#!/usr/bin/env bash
#
# AKFC — Dépôt commun, A3 : page membre « Déposer un ou plusieurs fichiers ».
#
#   - features/common-repository/CommonRepositoryUpload.tsx : composant autonome,
#     figé sur la destination common_repository. Dropzone + nom de conteneur +
#     les DEUX flux d'upload (pickBackend : image/vidéo → cloudinary, sinon → r2),
#     répliqués en version minimale (sans conflit/overwrite ni destinations admin).
#   - app/(public)/deposer/page.tsx : la page (accessible à tout connecté).
#   - UserMenu : lien « Déposer un ou plusieurs fichiers » (non-admins).
#
# Réutilise les mutations tRPC durcies en A2 (le backend refuse déjà toute autre
# destination pour un non-admin). Front seul, typecheck web.
#
# NB : en SANDBOX, les documents (R2→MinIO) échoueront jusqu'à la Phase 6
# (forcePathStyle). Les images marchent. En dev local (R2 réel), les deux marchent.
#
# Usage : bash apply-depot-commun-a3-member-page.sh
#         AKFC_APPLY_ONLY=1 bash apply-depot-commun-a3-member-page.sh   (clone)
#
set -euo pipefail

W="apps/web/src"
COMP_DIR="$W/features/common-repository"
COMP="$COMP_DIR/CommonRepositoryUpload.tsx"
PAGE_DIR="$W/app/(public)/deposer"
PAGE="$PAGE_DIR/page.tsx"
MENU="$W/features/app-shell/UserMenu.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$MENU" ]        || { echo "ERREUR: $MENU introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

mkdir -p "$COMP_DIR" "$PAGE_DIR"

# ── 1. Composant d'upload membre ─────────────────────────────────────────────
cat > "$COMP" <<'TSX'
"use client";

import { JSX, useState } from "react";
import { trpc } from "@trpc/trpcClient";

/**
 * Dépôt membre dans le Dépôt commun (common_repository).
 *
 * Version minimale et autonome du flux d'upload : dropzone + nom de conteneur,
 * puis, par fichier, image/vidéo → Cloudinary (ou presigned PUT MinIO en
 * sandbox), document → R2. Pas de gestion de conflit/overwrite ni de
 * destinations admin (le backend, durci, refuserait de toute façon). L'expéditeur
 * et l'horodatage sont enregistrés par fichier côté serveur.
 */

type UploadState = "idle" | "uploading" | "done" | "error";

function pickBackend(mimeType: string): "cloudinary" | "r2" {
  return mimeType.startsWith("image/") || mimeType.startsWith("video/")
    ? "cloudinary"
    : "r2";
}

export function CommonRepositoryUpload(): JSX.Element {
  const [files, setFiles] = useState<File[]>([]);
  const [containerName, setContainerName] = useState<string>("");
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const createUploadAuth = trpc.storage.createUploadAuthorization.useMutation();
  const registerUploaded = trpc.storage.registerUploadedAsset.useMutation();
  const createR2Upload = trpc.storage.createR2Upload.useMutation();
  const registerR2Upload = trpc.storage.registerR2Upload.useMutation();

  const destination = {
    kind: "common_repository" as const,
    containerName: containerName.trim() || undefined,
  };

  const uploadCloudinary = async (batch: File[]): Promise<number> => {
    if (batch.length === 0) return 0;
    const signatures = await createUploadAuth.mutateAsync({
      provider: "cloudinary",
      destination,
      allowOverwrite: false,
      assets: batch.map((f) => ({
        fileName: f.name,
        mimeType: f.type,
        mediaType: f.type.startsWith("video/")
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
      const file = batch[i];
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

  const uploadR2 = async (file: File): Promise<void> => {
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
    if (files.length === 0) {
      setMessage("Choisis au moins un fichier.");
      return;
    }
    setState("uploading");
    setMessage(null);
    try {
      const cloudinaryFiles = files.filter((f) => pickBackend(f.type) === "cloudinary");
      const r2Files = files.filter((f) => pickBackend(f.type) === "r2");

      const nCloud = await uploadCloudinary(cloudinaryFiles);
      for (const f of r2Files) await uploadR2(f);

      setState("done");
      setMessage(
        `${nCloud + r2Files.length} fichier(s) déposé(s) dans le Dépôt commun.`,
      );
      setFiles([]);
      setContainerName("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Échec du dépôt.");
    }
  };

  const busy = state === "uploading";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Déposer un ou plusieurs fichiers</h1>
      <p className="text-sm text-muted-foreground">
        Vos fichiers sont déposés dans le Dépôt commun. Les administrateurs les
        retrouveront et les classeront.
      </p>

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

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Fichiers</span>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="rounded border border-input bg-background px-2 py-1"
          disabled={busy}
        />
      </label>

      {files.length > 0 && (
        <ul className="text-sm text-muted-foreground">
          {files.map((f) => (
            <li key={f.name}>• {f.name}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={busy || files.length === 0}
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
    </div>
  );
}
TSX
echo "créé  $COMP"

# ── 2. Page ──────────────────────────────────────────────────────────────────
cat > "$PAGE" <<'TSX'
import { JSX } from "react";
import { CommonRepositoryUpload } from "@features/common-repository/CommonRepositoryUpload";

export default function DeposerPage(): JSX.Element {
  return <CommonRepositoryUpload />;
}
TSX
echo "créé  $PAGE"

# ── 3. Lien dans UserMenu (non-admins) ───────────────────────────────────────
python3 - "$MENU" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "/deposer" in s:
    print("UserMenu : lien déjà présent"); sys.exit(0)

# insérer après le lien « Mon profil » ; visible pour les NON-admins
anchor = (
    '          <Link\n'
    '            href="/profil"\n'
    '            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"\n'
    '            onClick={() => setOpen(false)}\n'
    '          >\n'
    '            Mon profil\n'
    '          </Link>\n'
)
assert anchor in s, "ancre « Mon profil » (UserMenu) introuvable"
link = (
    '          {!isAdmin && (\n'
    '            <Link\n'
    '              href="/deposer"\n'
    '              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"\n'
    '              onClick={() => setOpen(false)}\n'
    '            >\n'
    '              Déposer un ou plusieurs fichiers\n'
    '            </Link>\n'
    '          )}\n'
)
s = s.replace(anchor, anchor + link)
p.write_text(s, encoding="utf-8")
print("UserMenu : lien « Déposer… » ajouté (non-admins)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|createUploadAuth|registerR2|containerName" /tmp/akfc_tc.log | head -20; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(depot-commun): A3 — page membre « Déposer des fichiers » (2 providers) + lien UserMenu" \
  && echo "commit $(git rev-parse --short HEAD)"