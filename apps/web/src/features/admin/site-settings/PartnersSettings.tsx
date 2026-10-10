"use client";

import { useRef, useState, type JSX } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { trpc } from "@/core/trpc/trpcClient";
import { LogoPreview } from "@features/admin/site-settings/LogoPreview";
import { PARTNER_ROLE_OPTION, type PartnerRoleValue } from "@features/partners/partnerUi";

/**
 * Réglages du site → « Partenaires du club » (MJC, fédération…) : nom, rôle, phrase de présentation,
 * site, liens utiles (ex. inscription et tarifs sur le site de la MJC), logo, ordre, visibilité.
 * Affichés dans le pied de page et sur la page « S'inscrire ».
 */

const MAX_LOGO_BYTES = 512 * 1024;
const LOGO_TYPES: Record<string, "image/svg+xml" | "image/png" | "image/webp" | "image/jpeg"> = {
  svg: "image/svg+xml",
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none";

type Partner = {
  id: string;
  name: string;
  role: PartnerRoleValue;
  description: string | null;
  websiteUrl: string | null;
  links: { label: string; url: string }[];
  isActive: boolean;
  logoUrl: string | null;
};

export function PartnersSettings(): JSX.Element {
  const utils = trpc.useUtils();
  const list = trpc.sitePartner.listAdmin.useQuery();
  const refresh = async (): Promise<void> => {
    await Promise.all([utils.sitePartner.listAdmin.invalidate(), utils.sitePartner.list.invalidate()]);
  };
  const create = trpc.sitePartner.save.useMutation({ onSuccess: refresh });
  const reorder = trpc.sitePartner.reorder.useMutation({ onSuccess: refresh });

  const partners = (list.data ?? []) as Partner[];
  const move = (index: number, delta: number): void => {
    const ids = partners.map((p) => p.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate({ ids });
  };

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-1 text-xl font-semibold">Partenaires du club</h2>
      <p className="mb-6 text-sm text-gray-600">
        Structures liées au club (la MJC qui l&apos;accueille, la fédération…). Leurs logos s&apos;affichent dans
        le pied de page et sur la page «&nbsp;S&apos;inscrire&nbsp;», avec leurs liens utiles.
      </p>

      {list.isLoading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {partners.map((p, i) => (
            <li key={p.id}>
              <PartnerCard
                partner={p}
                onChanged={refresh}
                onUp={i > 0 ? () => move(i, -1) : undefined}
                onDown={i < partners.length - 1 ? () => move(i, 1) : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => create.mutate({ name: "Nouveau partenaire", role: "OTHER", isActive: false, links: [] })}
        disabled={create.isPending}
        className="mt-6 inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Ajouter un partenaire
      </button>
    </section>
  );
}

function PartnerCard({
  partner,
  onChanged,
  onUp,
  onDown,
}: {
  partner: Partner;
  onChanged: () => Promise<void>;
  onUp?: () => void;
  onDown?: () => void;
}): JSX.Element {
  const [name, setName] = useState(partner.name);
  const [role, setRole] = useState<PartnerRoleValue>(partner.role);
  const [description, setDescription] = useState(partner.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(partner.websiteUrl ?? "");
  const [links, setLinks] = useState(partner.links);
  const [isActive, setIsActive] = useState(partner.isActive);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const save = trpc.sitePartner.save.useMutation({ onSuccess: onChanged });
  const setLogo = trpc.sitePartner.setLogo.useMutation({ onSuccess: onChanged });
  const clearLogo = trpc.sitePartner.clearLogo.useMutation({ onSuccess: onChanged });
  const remove = trpc.sitePartner.delete.useMutation({ onSuccess: onChanged });

  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const ext = file.name.toLowerCase().split(".").pop() ?? "";
    const mimeType = LOGO_TYPES[ext];
    if (!mimeType) return setLogoError("Format accepté : SVG, PNG, WebP ou JPEG.");
    if (file.size > MAX_LOGO_BYTES) return setLogoError("Logo trop volumineux (512 Ko au plus).");
    const reader = new FileReader();
    reader.onload = () => {
      const dataBase64 = (typeof reader.result === "string" ? reader.result : "").split(",")[1] ?? "";
      if (!dataBase64) return setLogoError("Lecture du fichier impossible.");
      setLogo.mutate({ id: partner.id, dataBase64, mimeType });
    };
    reader.onerror = () => setLogoError("Lecture du fichier impossible.");
    reader.readAsDataURL(file);
  };

  const onSave = (): void => {
    save.mutate({
      id: partner.id,
      name: name.trim(),
      role,
      description: description.trim() || null,
      websiteUrl: websiteUrl.trim(),
      links: links.filter((l) => l.label.trim() !== "" || l.url.trim() !== "").map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
      isActive,
    });
  };

  return (
    <div className={`rounded-lg border p-4 ${isActive ? "border-gray-200" : "border-dashed border-gray-300 bg-gray-50"}`}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col items-center gap-2">
          {partner.logoUrl ? (
            <LogoPreview src={partner.logoUrl} alt={partner.name} />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-gray-300 text-center text-xs text-gray-400">
              pas de logo
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={setLogo.isPending}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 disabled:opacity-50"
          >
            {setLogo.isPending ? "Envoi…" : partner.logoUrl ? "Remplacer" : "Importer un logo"}
          </button>
          <input ref={fileRef} type="file" accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg" onChange={onPickLogo} className="hidden" />
          {partner.logoUrl && (
            <button
              type="button"
              onClick={() => clearLogo.mutate({ id: partner.id })}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              Retirer le logo
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Nom</span>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Rôle</span>
              <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as PartnerRoleValue)}>
                {(Object.keys(PARTNER_ROLE_OPTION) as PartnerRoleValue[]).map((r) => (
                  <option key={r} value={r}>
                    {PARTNER_ROLE_OPTION[r]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Présentation <span className="text-gray-400">(une phrase, facultative)</span>
            </span>
            <input className={inputClass} value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              Site web <span className="text-gray-400">(le logo y mène)</span>
            </span>
            <input className={inputClass} value={websiteUrl} placeholder="https://…" onChange={(e) => setWebsiteUrl(e.target.value)} />
          </label>

          <fieldset className="text-sm">
            <legend className="mb-1 font-medium">
              Liens utiles <span className="font-normal text-gray-400">(ex. inscription et tarifs, activités du club)</span>
            </legend>
            <div className="flex flex-col gap-2">
              {links.map((l, i) => (
                <div key={i} className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className={`${inputClass} sm:w-56`}
                    placeholder="Libellé"
                    value={l.label}
                    onChange={(e) => setLinks((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    className={inputClass}
                    placeholder="https://…"
                    value={l.url}
                    onChange={(e) => setLinks((prev) => prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                  />
                  <button
                    type="button"
                    aria-label="Retirer ce lien"
                    onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
                    className="self-start rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {links.length < 10 && (
                <button
                  type="button"
                  onClick={() => setLinks((prev) => [...prev, { label: "", url: "" }])}
                  className="self-start text-xs text-emerald-700 hover:underline"
                >
                  + Ajouter un lien
                </button>
              )}
            </div>
          </fieldset>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-emerald-600" />
            Affiché sur le site
          </label>

          {(logoError || setLogo.error || save.error || remove.error) && (
            <p className="text-xs text-red-600">{logoError ?? setLogo.error?.message ?? save.error?.message ?? remove.error?.message}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={onSave}
              disabled={save.isPending || name.trim() === ""}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {save.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
            {save.isSuccess && !save.isPending && <span className="text-xs text-emerald-700">Enregistré.</span>}
            <span className="flex-1" />
            <button type="button" aria-label="Monter" disabled={!onUp} onClick={onUp} className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-30">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Descendre" disabled={!onDown} onClick={onDown} className="rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-30">
              <ArrowDown className="h-4 w-4" />
            </button>
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={() => remove.mutate({ id: partner.id })}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Confirmer la suppression
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500">
                  Annuler
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-gray-500 hover:text-red-600">
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
