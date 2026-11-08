"use client";

import Link from "next/link";
import { useState, type JSX } from "react";

import { trpc } from "@trpc/trpcClient";

import { MediaTagsDialog } from "./MediaTagsDialog";

type Section = "REFUSED" | "MISSING" | "UNTAGGED";

const SECTIONS: ReadonlyArray<{
  key: Section;
  label: string;
  help: string;
  tone: string;
}> = [
  {
    key: "REFUSED",
    label: "Masqués : à retirer",
    help: "Une personne taguée a refusé le site public : le média est déjà masqué en ligne. Retire-le du contenu, ou retire le tag si la personne n'y est pas.",
    tone: "border-red-300 bg-red-50 text-red-800",
  },
  {
    key: "MISSING",
    label: "En attente d'autorisation",
    help: "Une personne taguée n'a pas encore répondu. Le média reste en ligne ; relance-la depuis la fenêtre des tags.",
    tone: "border-amber-300 bg-amber-50 text-amber-900",
  },
  {
    key: "UNTAGGED",
    label: "À taguer",
    help: "Personne n'est tagué : le droit à l'image n'agit pas encore. Indique qui y apparaît, ou « aucune personne reconnaissable ».",
    tone: "border-gray-300 bg-gray-50 text-gray-700",
  },
];

/**
 * Rapport du droit à l'image des médias montrés sur le site public (`mediaPeople.publicReport`),
 * en trois listes. Un clic sur un média ouvre la fenêtre des tags ; la liste se relit à sa fermeture.
 */
export function PublicRightsReport(): JSX.Element {
  const utils = trpc.useUtils();
  const report = trpc.mediaPeople.publicReport.useQuery();
  const [chosen, setChosen] = useState<Section | null>(null);
  const [tagging, setTagging] = useState<{
    id: string;
    url: string;
    name: string;
  } | null>(null);

  const rows = report.data ?? [];
  const count = (k: Section): number =>
    rows.filter((r) => r.verdict === k).length;
  // Par défaut, la première liste qui n'est pas vide (ce qui est masqué d'abord).
  const section =
    chosen ?? SECTIONS.find((s) => count(s.key) > 0)?.key ?? "REFUSED";
  const meta = SECTIONS.find((s) => s.key === section)!;
  const shown = rows.filter((r) => r.verdict === section);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Droit à l&apos;image des médias en ligne
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Galeries publiques, carrousel d&apos;accueil, contenus des pages et
          images des cartes : ce qui demande une action. Les médias en règle
          n&apos;apparaissent pas.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Listes"
        className="flex flex-wrap gap-2"
        data-tour="droit-image.tabs"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={s.key === section}
            onClick={() => setChosen(s.key)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              s.key === section
                ? s.tone + " font-semibold"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.label} ({report.data ? count(s.key) : "…"})
          </button>
        ))}
      </div>

      <p
        className={`rounded-md border px-3 py-2 text-sm ${meta.tone}`}
        data-tour="droit-image.help"
      >
        {meta.help}
      </p>

      <div data-tour="droit-image.list">
        {report.isLoading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : shown.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Rien dans cette liste.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Média</th>
                  <th className="px-3 py-2 text-left">Fichier</th>
                  <th className="px-3 py-2 text-left">Personnes</th>
                  <th className="px-3 py-2 text-left">Montré sur</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr
                    key={r.mediaAssetId}
                    className="border-t border-gray-100 align-top"
                  >
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setTagging({
                            id: r.mediaAssetId,
                            url: r.thumbUrl,
                            name: r.fileName,
                          })
                        }
                        aria-label={`Taguer les personnes de ${r.fileName}`}
                        className="h-14 w-14 overflow-hidden rounded-md bg-gray-100 ring-emerald-500 hover:ring-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.thumbUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    </td>
                    <td className="px-3 py-2 break-all text-gray-800">
                      {r.fileName}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {r.people === 0
                        ? "—"
                        : `${r.people} taguée${r.people > 1 ? "s" : ""}`}
                    </td>
                    <td className="px-3 py-2">
                      <ul className="space-y-0.5">
                        {r.usages.map((u) => (
                          <li key={u.href + u.label}>
                            <Link
                              href={u.href}
                              className="text-emerald-700 hover:underline"
                            >
                              {u.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tagging && (
        <MediaTagsDialog
          mediaAssetId={tagging.id}
          previewUrl={tagging.url}
          title={tagging.name}
          onClose={() => {
            setTagging(null);
            void utils.mediaPeople.publicReport.invalidate();
          }}
        />
      )}
    </div>
  );
}
