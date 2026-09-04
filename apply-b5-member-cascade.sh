#!/usr/bin/env bash
#
# AKFC — Chantier B, B5 : uploader MEMBRE en cascade (type → entité) + fallback Dépôt commun.
#
# Réécrit CommonRepositoryUpload : un sélecteur de destination en tête —
#   1) Type : Discipline / Stage / Event / Dépôt commun
#   2) Entité (si type ≠ Dépôt commun) : select alimenté par
#      discipline.getAll / stage.listForUpload / event.listForUpload
# Le `destination` devient dynamique ; TOUTE la mécanique d'upload (2 flux
# cloudinary/r2, vignettes, cropper, PdfThumbnail) est réutilisée telle quelle.
# Le bloc containerName + select des dépôts + setLabel ne s'affiche QUE pour le
# fallback « Dépôt commun ».
#
# Réécriture intégrale (le fichier n'est pas dans mon snapshot). typecheck web.
#
# Usage : bash apply-B5-member-cascade.sh
#         AKFC_APPLY_ONLY=1 bash apply-B5-member-cascade.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/common-repository/CommonRepositoryUpload.tsx"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable (applique A3 d'abord)." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

cp "$F" "$F.bak" && echo "sauvegarde : $F.bak"

cat > "$F" <<'TSX'
"use client";

import { JSX, useMemo, useState } from "react";
import { trpc } from "@trpc/trpcClient";
import Cropper from "@features/gallery-crop/components/Cropper";
import { PdfThumbnail } from "@features/common-repository/PdfThumbnail";
import type { PictureItem } from "@features/gallery-crop/types/picture.types";
import type { CropResult } from "@features/gallery-crop/types/cropper.types";

/**
 * Uploader MEMBRE en cascade.
 *
 *   1) Type de destination : Discipline / Stage / Event / Dépôt commun.
 *   2) Entité existante (si type ≠ Dépôt commun) : discipline / stage / event.
 *   3) Dépôt → le contenu part `pending` (géré par l'admin). La LECTURE reste
 *      admin ; le membre ne fait qu'écrire.
 *
 * Le « Dépôt commun » est le fallback (rien ne correspond) : nom de conteneur
 * libre + reprise d'un dépôt existant. Toute la mécanique d'upload (2 flux
 * cloudinary/r2, vignettes, cropper) est commune à toutes les destinations.
 */

type UploadState = "idle" | "uploading" | "done" | "error";
type DestKind = "discipline" | "stage" | "event" | "common_repository";

function pickBackend(mimeType: string): "cloudinary" | "r2" {
  return mimeType.startsWith("image/") || mimeType.startsWith("video/")
    ? "cloudinary"
    : "r2";
}

function iconForMime(mime: string): string {
  if (mime === "application/pdf") return "📄";
  if (mime.startsWith("video/")) return "🎬";
  if (mime.startsWith("image/")) return "🖼️";
  return "📁";
}

export function CommonRepositoryUpload(): JSX.Element {
  const [destKind, setDestKind] = useState<DestKind>("common_repository");
  const [entityId, setEntityId] = useState<number | "">("");
  const [items, setItems] = useState<PictureItem[]>([]);
  const [itemToCrop, setItemToCrop] = useState<PictureItem | null>(null);
  const [containerName, setContainerName] = useState<string>("");
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const createUploadAuth = trpc.storage.createUploadAuthorization.useMutation();
  const registerUploaded = trpc.storage.registerUploadedAsset.useMutation();
  const createR2Upload = trpc.storage.createR2Upload.useMutation();
  const registerR2Upload = trpc.storage.registerR2Upload.useMutation();
  const { data: myContainers = [], refetch: refetchContainers } =
    trpc.storage.listMyCommonRepositoryContainers.useQuery();
  const setLabel = trpc.storage.setCommonRepositoryLabel.useMutation();

  // Listes d'entités (niveau 2). Chargées à la demande selon le type choisi.
  const disciplines = trpc.discipline.getAll.useQuery(undefined, {
    enabled: destKind === "discipline",
  });
  const stages = trpc.stage.listForUpload.useQuery(undefined, {
    enabled: destKind === "stage",
  });
  const events = trpc.event.listForUpload.useQuery(undefined, {
    enabled: destKind === "event",
  });

  // Options du select entité selon le type.
  const entityOptions = useMemo<{ id: number; label: string }[]>(() => {
    if (destKind === "discipline")
      return (disciplines.data ?? []).map((d) => ({ id: d.id, label: d.name }));
    if (destKind === "stage")
      return (stages.data ?? []).map((s) => ({ id: s.id, label: s.label }));
    if (destKind === "event")
      return (events.data ?? []).map((e) => ({ id: e.id, label: e.label }));
    return [];
  }, [destKind, disciplines.data, stages.data, events.data]);

  // categoryId de la discipline choisie (nécessaire pour existing-discipline).
  const categoryIdOfDiscipline = useMemo<number | null>(() => {
    if (destKind !== "discipline" || entityId === "") return null;
    const d = (disciplines.data ?? []).find((x) => x.id === entityId);
    return d?.categoryId ?? null;
  }, [destKind, entityId, disciplines.data]);

  // Construit la destination d'upload selon le choix.
  const destination = useMemo(() => {
    if (destKind === "discipline" && entityId !== "" && categoryIdOfDiscipline)
      return {
        kind: "existing-discipline" as const,
        categoryId: categoryIdOfDiscipline,
        disciplineId: entityId,
      };
    if (destKind === "stage" && entityId !== "")
      return { kind: "stage" as const, stageId: entityId };
    if (destKind === "event" && entityId !== "")
      return { kind: "event" as const, eventId: entityId, disciplineIds: [] };
    return {
      kind: "common_repository" as const,
      containerName: containerName.trim() || undefined,
    };
  }, [destKind, entityId, categoryIdOfDiscipline, containerName]);

  const isCommon = destination.kind === "common_repository";
  // Une entité est requise mais pas encore choisie ?
  const entityMissing = destKind !== "common_repository" && entityId === "";

  const onPick = (fileList: FileList | null) => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    const picked = Array.from(fileList ?? []);
    setItems(
      picked.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        originalFile: f,
        previewUrl: URL.createObjectURL(f),
      })),
    );
  };

  const handleCrop = ({ pictureId, croppedFile }: CropResult) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== pictureId) return it;
        URL.revokeObjectURL(it.previewUrl);
        return {
          ...it,
          file: croppedFile,
          previewUrl: URL.createObjectURL(croppedFile),
        };
      }),
    );
    setItemToCrop(null);
  };

  const uploadCloudinary = async (batch: PictureItem[]): Promise<number> => {
    if (batch.length === 0) return 0;
    const signatures = await createUploadAuth.mutateAsync({
      provider: "cloudinary",
      destination,
      allowOverwrite: false,
      assets: batch.map((it) => ({
        fileName: it.file.name,
        mimeType: it.file.type,
        mediaType: it.file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
      })),
    });

    const assets: {
      publicId: string;
      secureUrl: string;
      resourceType: "image" | "video";
      format?: string;
      bytes: number;
      width?: number;
      height?: number;
      duration?: number;
      originalFileName: string;
      mimeType: string;
      folder: string;
    }[] = [];

    for (let i = 0; i < batch.length; i++) {
      const file = batch[i].file;
      const sig = signatures[i];
      if (sig.uploadUrl) {
        const put = await fetch(sig.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!put.ok) throw new Error(`MinIO HTTP ${put.status}`);
        assets.push({
          publicId: `${sig.folder}/${sig.publicId}`,
          secureUrl: "",
          resourceType: sig.resourceType,
          format: file.type.split("/")[1],
          bytes: file.size,
          originalFileName: file.name,
          mimeType: file.type,
          folder: sig.folder,
        });
      } else {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sig.apiKey);
        fd.append("timestamp", String(sig.timestamp));
        fd.append("signature", sig.signature);
        fd.append("folder", sig.folder);
        fd.append("public_id", sig.publicId);
        fd.append("type", sig.type);
        fd.append("overwrite", String(sig.overwrite));
        const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`;
        const res = await fetch(url, { method: "POST", body: fd });
        if (!res.ok) throw new Error(`Cloudinary HTTP ${res.status}`);
        const data = await res.json();
        assets.push({
          publicId: data.public_id,
          secureUrl: data.secure_url,
          resourceType: sig.resourceType,
          format: data.format,
          bytes: data.bytes,
          width: data.width,
          height: data.height,
          duration: data.duration,
          originalFileName: file.name,
          mimeType: file.type,
          folder: sig.folder,
        });
      }
    }

    const registered = await registerUploaded.mutateAsync({
      provider: "cloudinary",
      destination,
      assets,
    });
    return registered.assets.length;
  };

  const uploadR2 = async (item: PictureItem): Promise<void> => {
    const file = item.file;
    const auth = await createR2Upload.mutateAsync({
      destination,
      originalFileName: file.name,
      mimeType: file.type,
      maxBytes: file.size,
    });
    const put = await fetch(auth.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) throw new Error(`R2 HTTP ${put.status}`);
    await registerR2Upload.mutateAsync({
      path: auth.path,
      expectedBytes: file.size,
      expectedMimeType: file.type,
      destination,
      originalFileName: file.name,
    });
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      setMessage("Choisis au moins un fichier.");
      return;
    }
    if (entityMissing) {
      setMessage("Choisis une destination.");
      return;
    }
    setState("uploading");
    setMessage(null);
    try {
      const cloud = items.filter((it) => pickBackend(it.file.type) === "cloudinary");
      const r2 = items.filter((it) => pickBackend(it.file.type) === "r2");

      const nCloud = await uploadCloudinary(cloud);
      for (const it of r2) await uploadR2(it);

      // Libellé humain seulement pour le Dépôt commun (les entités ont leur nom).
      if (isCommon) {
        const typed = containerName.trim();
        if (typed) {
          try {
            await setLabel.mutateAsync({ subject: typed, label: typed });
            await refetchContainers();
          } catch {
            /* le libellé est cosmétique : on n'échoue pas le dépôt pour ça. */
          }
        }
      }
      setState("done");
      setMessage(`${nCloud + r2.length} fichier(s) déposé(s).`);
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
      setItems([]);
      setContainerName("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Échec du dépôt.");
    }
  };

  const busy = state === "uploading";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Déposer un ou plusieurs fichiers</h1>
      <p className="text-sm text-muted-foreground">
        Choisissez une destination. Le contenu déposé sera classé par les
        administrateurs. Cliquez une image pour la recadrer.
      </p>

      {/* Niveau 1 : type de destination */}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Destination</span>
        <select
          className="rounded border border-input bg-background px-2 py-1"
          disabled={busy}
          value={destKind}
          onChange={(e) => {
            setDestKind(e.target.value as DestKind);
            setEntityId("");
          }}
        >
          <option value="discipline">Une discipline (cours)</option>
          <option value="stage">Un stage</option>
          <option value="event">Un événement</option>
          <option value="common_repository">
            Aucune de ces destinations (Dépôt commun)
          </option>
        </select>
      </label>

      {/* Niveau 2 : entité existante */}
      {!isCommon && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            {destKind === "discipline"
              ? "Discipline"
              : destKind === "stage"
                ? "Stage"
                : "Événement"}
          </span>
          <select
            className="rounded border border-input bg-background px-2 py-1"
            disabled={busy}
            value={entityId === "" ? "" : String(entityId)}
            onChange={(e) =>
              setEntityId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">— Choisir —</option>
            {entityOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Dépôt commun : nom de conteneur + reprise d'un dépôt existant */}
      {isCommon && (
        <>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nom du dossier de dépôt (optionnel)</span>
            <input
              type="text"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              placeholder="ex. Photos du stage de bâton long"
              className="rounded border border-input bg-background px-2 py-1"
              disabled={busy}
            />
          </label>

          {myContainers.length > 0 && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Ou reprendre un dépôt existant</span>
              <select
                className="rounded border border-input bg-background px-2 py-1"
                disabled={busy}
                value=""
                onChange={(e) => {
                  if (e.target.value) setContainerName(e.target.value);
                }}
              >
                <option value="">— Choisir un de mes dépôts —</option>
                {myContainers.map((c) => (
                  <option key={c.subject} value={c.subject}>
                    {c.label ?? c.subject}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Fichiers</span>
        <input
          type="file"
          multiple
          onChange={(e) => onPick(e.target.files)}
          className="rounded border border-input bg-background px-2 py-1"
          disabled={busy}
        />
      </label>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {items.map((it) => {
            const isImage = it.file.type.startsWith("image/");
            return (
              <div
                key={it.id}
                className="relative h-32 w-32 overflow-hidden rounded border bg-gray-50"
              >
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.previewUrl}
                    alt=""
                    title="Cliquer pour recadrer"
                    className="h-full w-full cursor-pointer object-contain"
                    onClick={() => !busy && setItemToCrop(it)}
                  />
                ) : it.file.type === "application/pdf" ? (
                  <PdfThumbnail file={it.file} width={128} />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                    <span className="mb-1 text-3xl">
                      {iconForMime(it.file.type)}
                    </span>
                    <span
                      className="w-full truncate text-xs text-gray-700"
                      title={it.file.name}
                    >
                      {it.file.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={busy || items.length === 0 || entityMissing}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? "Dépôt en cours…" : "Déposer"}
      </button>

      {message && (
        <p
          className={`text-sm ${state === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {message}
        </p>
      )}

      {itemToCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-full overflow-auto rounded-lg bg-white p-4">
            <Cropper
              picture={itemToCrop}
              onCrop={handleCrop}
              onCancel={() => setItemToCrop(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
TSX
echo "réécrit  $F (cascade)"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|destination|entityId|listForUpload|getAll" /tmp/akfc_tc.log | head -20; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(B5): uploader membre en cascade (discipline/stage/event) + fallback Dépôt commun" \
  && echo "commit $(git rev-parse --short HEAD)"