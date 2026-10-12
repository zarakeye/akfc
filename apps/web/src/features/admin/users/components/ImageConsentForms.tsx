"use client";

import { useRef, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, Upload } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  IMAGE_CONSENT_BLANK_FORM_URL,
  IMAGE_CONSENT_FORM_MAX_BYTES,
  IMAGE_CONSENT_FORM_MIME_EXT,
  IMAGE_USAGE_LABEL,
  IMAGE_USAGE_VALUES,
  type ImageUsageValue,
} from "@contracts/legal/imageConsent";
import { heicFailureMessage, isHeicFile, toBrowserImages } from "@features/media/heic/browserImages";
import { ImageConsentFormViewer, type ViewableConsentForm } from "@features/image-consent/ImageConsentFormViewer";
import { formatDate, formatKeepAfterLeave, formatUsages } from "@features/image-consent/consentFormat";

type KeepChoice = "unset" | "remove" | "keep";

/**
 * Fiche d'un utilisateur (admin) : formulaires de droit à l'image signés. Dépôt du PDF ou de la
 * photo du formulaire, avec les usages cochés « Oui » ; le statut du membre en découle. Le membre
 * retrouve le formulaire dans son profil.
 */
export function ImageConsentForms({ userId }: { userId: string }): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const list = trpc.imageConsent.listForUser.useQuery({ userId });
  const createUpload = trpc.imageConsent.createUpload.useMutation();
  const register = trpc.imageConsent.register.useMutation();
  const remove = trpc.imageConsent.remove.useMutation();

  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [usages, setUsages] = useState<ImageUsageValue[]>([]);
  const [keep, setKeep] = useState<KeepChoice>("unset");
  const [signedAt, setSignedAt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState<ViewableConsentForm | null>(null);

  const refresh = async (): Promise<void> => {
    await Promise.all([utils.imageConsent.listForUser.invalidate({ userId }), utils.user.getAll.invalidate()]);
    router.refresh();
  };

  const reset = (): void => {
    setFile(null);
    setUsages([]);
    setKeep("unset");
    setSignedAt("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (): Promise<void> => {
    if (!file) return;
    setError(null);
    setDone(false);
    try {
      let toSend = file;
      if (isHeicFile(file)) {
        setBusy("Conversion de la photo iPhone (HEIC) en JPEG…");
        const r = await toBrowserImages([file]);
        if (!r.files[0]) throw new Error(heicFailureMessage(r.failed));
        toSend = r.files[0];
      }
      if (!IMAGE_CONSENT_FORM_MIME_EXT[toSend.type]) throw new Error("Format non accepté : PDF, JPEG, PNG ou WebP.");
      if (toSend.size > IMAGE_CONSENT_FORM_MAX_BYTES) throw new Error("Fichier trop volumineux (15 Mo au plus).");
      setBusy("Envoi…");
      const auth = await createUpload.mutateAsync({ userId, mimeType: toSend.type, bytes: toSend.size });
      const res = await fetch(auth.uploadUrl, { method: "PUT", headers: { "Content-Type": toSend.type }, body: toSend });
      if (!res.ok) throw new Error(`Envoi refusé (HTTP ${res.status})`);
      await register.mutateAsync({
        userId,
        path: auth.path,
        fileName: toSend.name,
        usages,
        keepAfterLeave: keep === "unset" ? null : keep === "keep",
        signedAt: signedAt || null,
      });
      reset();
      setDone(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const del = async (id: string): Promise<void> => {
    if (!window.confirm("Supprimer ce formulaire signé ? Le statut du membre ne change pas.")) return;
    setError(null);
    try {
      await remove.mutateAsync({ id });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggle = (u: ImageUsageValue): void =>
    setUsages((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));

  return (
    <fieldset className="mt-6 rounded-lg border border-border p-4 text-sm">
      <legend className="px-1 font-medium">Formulaires signés</legend>

      {list.data && list.data.length > 0 ? (
        <ul className="mb-4 divide-y divide-border">
          {list.data.map((f, i) => (
            <li key={f.id} className="flex flex-wrap items-start gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className={i === 0 ? "font-medium" : "text-muted-foreground"}>
                  {i === 0 ? "En vigueur" : "Ancien"} — signé le {formatDate(f.signedAt)}, déposé le{" "}
                  {formatDate(f.createdAt)}
                  {f.uploadedBy && ` par ${[f.uploadedBy.firstName, f.uploadedBy.lastName].filter(Boolean).join(" ") || f.uploadedBy.email}`}
                </p>
                <p className="text-muted-foreground">
                  Usages : {formatUsages(f.usages)}
                  {formatKeepAfterLeave(f.keepAfterLeave) && <> ; {formatKeepAfterLeave(f.keepAfterLeave)}</>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(f)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" /> Voir
              </button>
              <button
                type="button"
                onClick={() => void del(f.id)}
                disabled={remove.isPending}
                aria-label="Supprimer ce formulaire"
                className="rounded-md border border-gray-300 px-2 py-1 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-muted-foreground">
          Aucun formulaire déposé. Formulaire vierge :{" "}
          <a href={IMAGE_CONSENT_BLANK_FORM_URL} download className="text-emerald-700 hover:underline">
            télécharger le PDF
          </a>
          .
        </p>
      )}

      <div className="space-y-3 rounded-md bg-muted/40 p-3">
        <p className="font-medium">Déposer un formulaire signé</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setDone(false);
          }}
          className="block w-full text-sm"
        />
        <div>
          <p className="mb-1 text-muted-foreground">Usages cochés « Oui » sur le formulaire (aucun = refus) :</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {IMAGE_USAGE_VALUES.map((u) => (
              <label key={u} className="inline-flex items-center gap-1.5">
                <input type="checkbox" checked={usages.includes(u)} onChange={() => toggle(u)} />
                {IMAGE_USAGE_LABEL[u]}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="grid gap-1">
            <span className="text-muted-foreground">Après le départ</span>
            <select
              value={keep}
              onChange={(e) => setKeep(e.target.value as KeepChoice)}
              className="rounded border px-2 py-1.5"
            >
              <option value="unset">Non précisé</option>
              <option value="remove">Retrait sous un an</option>
              <option value="keep">Usage continu autorisé</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Date de signature</span>
            <input
              type="date"
              value={signedAt}
              onChange={(e) => setSignedAt(e.target.value)}
              className="rounded border px-2 py-1"
            />
          </label>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!file || busy !== null}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {busy ?? "Déposer"}
          </button>
        </div>
        {done && <p className="text-emerald-700">Formulaire enregistré ; le statut du membre est à jour.</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>

      <ImageConsentFormViewer form={open} onClose={() => setOpen(null)} />
    </fieldset>
  );
}
