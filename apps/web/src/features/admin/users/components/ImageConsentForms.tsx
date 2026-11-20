"use client";

import { useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";

import { trpc } from "#core/trpc/trpcClient.ts";
import {
  IMAGE_CONSENT_SOURCE_LABEL,
  IMAGE_USAGE_VALUES,
  compareWishes,
  describeWishChanges,
  type ConsentChoices,
  type ImageUsageValue,
} from "@akfc/contracts/legal/imageConsent.ts";
import { ImageConsentFormViewer, type ViewableConsentForm } from "#features/image-consent/ImageConsentFormViewer.tsx";
import { BlankConsentFormPreview } from "#features/image-consent/BlankConsentFormCard.tsx";
import { formatDate, formatKeepAfterLeave, formatUsages } from "#features/image-consent/consentFormat.ts";
import { useConfirm } from "#components/ui/useConfirm.tsx";

/** Souhaits du membre gardés avec une validation par le parent (JSON), ou null. */
function readWishes(v: unknown): ConsentChoices | null {
  if (!v || typeof v !== "object") return null;
  const o = v as { usages?: unknown; keepAfterLeave?: unknown };
  if (!Array.isArray(o.usages)) return null;
  const usages = o.usages.filter((u): u is ImageUsageValue => (IMAGE_USAGE_VALUES as readonly string[]).includes(String(u)));
  return { usages, keepAfterLeave: typeof o.keepAfterLeave === "boolean" ? o.keepAfterLeave : null };
}

/**
 * Fiche d'un utilisateur (admin) : ses formulaires de droit à l'image, du plus récent au plus ancien.
 * Rien ne s'y dépose : tout se fait en ligne (le membre majeur confirme, le parent d'un mineur
 * valide) ; les anciens formulaires papier restent consultables. Le membre les retrouve dans
 * « Mon droit à l'image ».
 */
export function ImageConsentForms({ userId }: { userId: string }): JSX.Element {
  const router = useRouter();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const utils = trpc.useUtils();
  const list = trpc.imageConsent.listForUser.useQuery({ userId });
  const remove = trpc.imageConsent.remove.useMutation();

  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<ViewableConsentForm | null>(null);
  const [blankOpen, setBlankOpen] = useState(false);

  const refresh = async (): Promise<void> => {
    await Promise.all([utils.imageConsent.listForUser.invalidate({ userId }), utils.user.getAll.invalidate()]);
    router.refresh();
  };

  const del = async (id: string): Promise<void> => {
    if (!(await confirm({ title: "Supprimer ce formulaire signé ?", description: "Le statut du membre ne change pas." }))) return;
    setError(null);
    try {
      await remove.mutateAsync({ id });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <fieldset className="mt-6 rounded-lg border border-border p-4 text-sm" data-tour="users.image-consent.forms">
      <legend className="px-1 font-medium">Formulaires signés</legend>
      {confirmDialog}

      {list.data && list.data.length > 0 ? (
        <ul className="mb-4 divide-y divide-border">
          {list.data.map((f, i) => (
            <li key={f.id} className="flex flex-wrap items-start gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className={i === 0 ? "font-medium" : "text-muted-foreground"}>
                  {i === 0 ? "Le plus récent" : "Ancien"} — {IMAGE_CONSENT_SOURCE_LABEL[f.source]}
                  {f.source === "PAPER" ? (
                    <>
                      , signé le {formatDate(f.signedAt)}, déposé le {formatDate(f.createdAt)}
                      {f.uploadedBy && ` par ${[f.uploadedBy.firstName, f.uploadedBy.lastName].filter(Boolean).join(" ") || f.uploadedBy.email}`}
                    </>
                  ) : (
                    <>
                      {f.signerName && ` (${f.signerName}${f.signerQuality ? `, ${f.signerQuality}` : ""})`}, confirmé le{" "}
                      {formatDate(f.createdAt)}
                    </>
                  )}
                </p>
                <p className="text-muted-foreground">
                  Usages : {formatUsages(f.usages)}
                  {formatKeepAfterLeave(f.keepAfterLeave) && <> ; {formatKeepAfterLeave(f.keepAfterLeave)}</>}
                </p>
                <ParentChanges form={f} />
              </div>
              <button
                type="button"
                onClick={() => setOpen(f)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-muted"
              >
                <Eye className="h-4 w-4" /> Voir
              </button>
              <button
                type="button"
                onClick={() => void del(f.id)}
                disabled={remove.isPending}
                aria-label="Supprimer ce formulaire"
                className="rounded-md border border-border px-2 py-1 text-destructive hover:bg-destructive-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-muted-foreground">
          Aucun formulaire : l&apos;autorisation se donne en ligne.{" "}
          <button type="button" onClick={() => setBlankOpen(true)} className="text-success hover:underline">
            Voir le formulaire vierge
          </button>
          .
        </p>
      )}

      {error && <p className="text-destructive">{error}</p>}

      <ImageConsentFormViewer form={open} onClose={() => setOpen(null)} />
      {blankOpen && <BlankConsentFormPreview onClose={() => setBlankOpen(false)} />}
    </fieldset>
  );
}

/** Validation par le parent : ce qu'il a changé par rapport aux souhaits du membre. */
function ParentChanges({
  form,
}: {
  form: { memberWishes: unknown; usages: ImageUsageValue[]; keepAfterLeave: boolean | null };
}): JSX.Element | null {
  const wishes = readWishes(form.memberWishes);
  if (!wishes) return null;
  const changes = describeWishChanges(compareWishes(wishes, form));
  return changes.length === 0 ? (
    <p className="text-muted-foreground">Le parent a gardé tous les souhaits du membre.</p>
  ) : (
    <div className="mt-1 text-warning">
      <p>Changements du parent par rapport aux souhaits du membre :</p>
      <ul className="list-disc pl-5">
        {changes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
