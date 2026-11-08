"use client";

import { useId, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { IMAGE_USAGE_VALUES, type ImageUsageValue } from "@contracts/legal/imageConsent";
import type { PersonUsageState, UsageVerdict } from "@contracts/legal/mediaPeople";

import { USAGE_ORDER_HINT, VerdictBadges } from "./RightsBadges";

/** Recherche insensible à la casse et aux accents. */
const fold = (s: string): string => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Verdict des cases cochées, avant enregistrement (même règle que le serveur). */
function draftVerdicts(
  states: ReadonlyArray<Record<ImageUsageValue, PersonUsageState>>,
  noRecognizable: boolean,
): Record<ImageUsageValue, UsageVerdict> {
  const out = {} as Record<ImageUsageValue, UsageVerdict>;
  for (const u of IMAGE_USAGE_VALUES) {
    if (noRecognizable) out[u] = "OK";
    else if (states.length === 0) out[u] = "UNTAGGED";
    else {
      const s = states.map((p) => p[u]);
      out[u] = s.includes("REFUSED") ? "REFUSED" : s.includes("MISSING") ? "MISSING" : "OK";
    }
  }
  return out;
}

/**
 * Modale des tags d'un média (administrateurs) : cocher les personnes qui y apparaissent. Chaque
 * membre montre déjà l'état de son droit à l'image, et le verdict se recalcule à chaque case : on
 * voit ce que deviendra la photo AVANT d'enregistrer. Les personnes déjà taguées sans réponse
 * peuvent être relancées d'ici.
 */
export function MediaTagsDialog({
  mediaAssetId,
  previewUrl,
  title,
  onClose,
}: {
  mediaAssetId: string;
  previewUrl: string | null;
  /** « Média n° 3 », nom du fichier… */
  title: string;
  onClose: () => void;
}): JSX.Element {
  const titleId = useId();
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState<string[] | null>(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tagsQuery = trpc.mediaPeople.forMedia.useQuery({ mediaAssetId });
  const candidatesQuery = trpc.mediaPeople.candidates.useQuery(undefined, { staleTime: 60_000 });
  const tags = tagsQuery.data;
  const candidates = candidatesQuery.data ?? [];

  const refresh = async (): Promise<void> => {
    await Promise.all([
      utils.mediaPeople.forMedia.invalidate({ mediaAssetId }),
      utils.mediaPeople.verdicts.invalidate(),
    ]);
  };
  const onError = (e: { message: string }): void => setError(e.message);

  const setTags = trpc.mediaPeople.setTags.useMutation({
    onSuccess: async () => {
      await refresh();
      onClose();
    },
    onError,
  });
  const setNoRecognizable = trpc.mediaPeople.setNoRecognizable.useMutation({ onSuccess: refresh, onError });
  const remind = trpc.mediaPeople.remind.useMutation({
    onSuccess: async (r) => {
      setNotice(`Relance envoyée à ${r.sentToMasked}.`);
      await refresh();
    },
    onError,
  });

  const selected = draft ?? tags?.people.map((p) => p.userId) ?? [];
  // Pendant l'enregistrement, la case montre déjà la valeur demandée.
  const noRecognizable = setNoRecognizable.isPending
    ? setNoRecognizable.variables.value
    : (tags?.noRecognizablePerson ?? false);
  const statesById = new Map(candidates.map((c) => [c.id, c.states]));
  const dirty = draft !== null;
  // Sans modification, le verdict du serveur ; sinon, celui des cases cochées.
  const preview =
    !dirty && tags
      ? tags.verdicts
      : draftVerdicts(
          selected.flatMap((id) => statesById.get(id) ?? []),
          noRecognizable,
        );

  const toggle = (id: string): void =>
    setDraft(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const q = fold(search.trim());
  const shown = q ? candidates.filter((c) => fold(`${c.name} ${c.email}`).includes(q)) : candidates;
  // Les personnes cochées d'abord : on retrouve d'un coup d'œil qui est sur la photo.
  const ordered = [...shown].sort((a, b) => Number(selected.includes(b.id)) - Number(selected.includes(a.id)));

  // Portail : la modale s'ouvre aussi DANS un formulaire (création de galerie) ; hors de son arbre
  // DOM, « Entrée » dans la recherche n'envoie pas ce formulaire.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-gray-900">
            Personnes sur ce média — {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex gap-4">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-700">
                {dirty ? "Verdict après enregistrement" : "Verdict"}
              </p>
              <VerdictBadges verdicts={preview} labeled />
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={noRecognizable}
                  disabled={!tags || setNoRecognizable.isPending}
                  onChange={(e) => setNoRecognizable.mutate({ mediaAssetId, value: e.target.checked })}
                  className="accent-emerald-600"
                />
                Aucune personne reconnaissable (salle, matériel, de dos…)
              </label>
            </div>
          </div>

          {tags && tags.people.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-medium text-gray-700">Déjà taguées</h3>
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {tags.people.map((p) => (
                  <li key={p.userId} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                    <span className="min-w-40 flex-1 text-gray-800">
                      {p.name}
                      {p.legalAge === "MINOR" && <span className="ml-1 text-xs text-gray-500">(mineur)</span>}
                    </span>
                    <VerdictBadges verdicts={p.states} />
                    {p.canRemind ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNotice(null);
                          setError(null);
                          remind.mutate({ userId: p.userId });
                        }}
                        disabled={remind.isPending}
                        className="rounded-full border border-amber-400 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                      >
                        Relancer
                      </button>
                    ) : p.remindedAt ? (
                      <span className="text-xs text-gray-500">
                        Relancé le {new Date(p.remindedAt).toLocaleDateString("fr-FR")}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-700">
                Membres <span className="font-normal text-gray-500">({selected.length} coché{selected.length > 1 ? "s" : ""})</span>
              </h3>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre"
                aria-label="Rechercher un membre"
                className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <p className="mb-1 text-xs text-gray-500">{USAGE_ORDER_HINT} Survole une pastille pour le détail.</p>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200">
              {candidatesQuery.isLoading ? (
                <p className="px-3 py-2 text-sm text-gray-500">Chargement…</p>
              ) : ordered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-500">Aucun membre ne correspond.</p>
              ) : (
                ordered.map((c) => (
                  <label
                    key={c.id}
                    className="flex cursor-pointer flex-wrap items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(c.id)}
                      onChange={() => toggle(c.id)}
                      className="accent-emerald-600"
                    />
                    <span className="min-w-40 flex-1">
                      {c.name}
                      {c.legalAge === "MINOR" && <span className="ml-1 text-xs text-gray-500">(mineur)</span>}
                    </span>
                    <VerdictBadges verdicts={c.states} />
                  </label>
                ))
              )}
            </div>
          </section>

          {notice && <p className="text-sm text-emerald-700">{notice}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setTags.mutate({ mediaAssetId, userIds: selected });
            }}
            disabled={!tags || !dirty || setTags.isPending}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {setTags.isPending ? "Enregistrement…" : "Enregistrer les tags"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
