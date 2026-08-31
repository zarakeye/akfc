#!/usr/bin/env bash
#
# AKFC — Sandbox, PHASE 2b : interface MediaBackend + sélecteur.
#
#   1. backends/media.types.ts  : types partagés (Variant, ResourceType,
#      ListAuthenticatedResourcesResult, GetAssetInfoResult) + interface
#      MediaBackend (les 9 fonctions).
#   2. cloudinaryBackend.ts      : importe ces types (au lieu de les définir),
#      et expose un objet `cloudinaryBackend: MediaBackend` (conformité vérifiée
#      au compile-time).
#   3. façade cloudinary.service : sélectionne le backend selon STORAGE_DRIVER
#      (défaut cloudinary) et re-exporte ses fonctions + les types, sous les noms
#      historiques → les ~25 consommateurs ne changent pas.
#
# Prérequis : Phase 2a (le fichier est en backends/cloudinaryBackend.ts).
# Backend + web (types partagés), typecheck des deux.
#
# Usage : bash sandbox-phase2b-interface.sh
#         AKFC_APPLY_ONLY=1 bash sandbox-phase2b-interface.sh   (clone)
#
set -euo pipefail

DIR="packages/backend/src/modules/cloudinary"
BK="$DIR/backends/cloudinaryBackend.ts"
TYPES="$DIR/backends/media.types.ts"
FACADE="$DIR/services/cloudinary.service.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$BK" ]     || { echo "ERREUR: $BK introuvable — applique d'abord la Phase 2a." >&2; exit 1; }
[ -f "$FACADE" ] || { echo "ERREUR: $FACADE introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Types partagés + interface ────────────────────────────────────────────
cat > "$TYPES" <<'TS'
/**
 * Contrat commun des backends média. La façade `cloudinary.service` sélectionne
 * l'implémentation (Cloudinary ou local MinIO+imgproxy) selon `STORAGE_DRIVER`.
 * Les deux backends implémentent `MediaBackend` — d'où une conformité vérifiée
 * au compile-time, garantie que le driver local ne pourra pas diverger.
 */

export type ResourceType = "image" | "video" | "raw";
export type Variant = "thumb" | "small" | "medium" | "large" | "original";

export interface ListAuthenticatedResourcesResult {
  publicId: string;
  url: string;
  /** Format technique (`jpg`, `png`, `mp4`, …) — sert à calculer `kind` au front. */
  format?: string;
}

export interface GetAssetInfoResult {
  resource_type: ResourceType;
  bytes?: number;
  created_at?: string;
  asset_id?: string;
  format?: string;
}

export interface MediaBackend {
  buildAuthenticatedUrl(
    publicId: string,
    variant: Variant,
    resourceType?: ResourceType,
    version?: number,
    format?: string,
  ): string;
  fetchAuthenticatedAsset(
    publicId: string,
    variant: Variant,
    version?: number,
    format?: string,
  ): Promise<Response | null>;
  getAssetInfo(publicId: string): Promise<GetAssetInfoResult>;
  fileExists(publicId: string): Promise<boolean>;
  listAuthenticatedResources(
    prefix: string,
  ): Promise<ListAuthenticatedResourcesResult[]>;
  deleteByPrefix(prefix: string): Promise<{ success: boolean }>;
  deleteCloudinaryFolderRecursive(prefix: string): Promise<void>;
  buildVideoPosterUrl(publicId: string, variant?: Variant): string;
  fetchVideoPoster(
    publicId: string,
    variant: Variant,
  ): Promise<Response | null>;
}
TS
echo "créé  $TYPES"

# ── 2. cloudinaryBackend : importer les types + exposer l'objet ──────────────
python3 - "$BK" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 2a. import des types partagés (après l'import du cache)
imp_anchor = '} from "@backend/modules/cloudinary/cache/resourcesCache";\n'
assert s.count(imp_anchor) == 1, "ancre import cache introuvable"
s = s.replace(
    imp_anchor,
    imp_anchor
    + 'import type {\n'
    + '  ResourceType,\n'
    + '  Variant,\n'
    + '  ListAuthenticatedResourcesResult,\n'
    + '  GetAssetInfoResult,\n'
    + '  MediaBackend,\n'
    + '} from "@backend/modules/cloudinary/backends/media.types";\n',
)

# 2b. retirer les définitions locales de types (maintenant importées)
types_block = (
    'export type ResourceType = "image" | "video" | "raw";\n'
    'export type Variant = "thumb" | "small" | "medium" | "large" | "original";\n'
    '\n'
    'export interface ListAuthenticatedResourcesResult {\n'
    '  publicId: string;\n'
    '  url: string;\n'
    '  /**\n'
    "   * Format technique de l'asset (`jpg`, `png`, `mp4`, ...).\n"
    '   *\n'
    '   * L\'API Cloudinary `resources` retourne ce champ pour chaque asset ;\n'
    '   * on le préserve ici pour qu\'il puisse remonter jusqu\'au `FileNode`\n'
    '   * du tree et au front (qui s\'en sert pour calculer `kind` = image/video/document).\n'
    '   */\n'
    '  format?: string;\n'
    '}\n'
    '\n'
    'interface GetAssetInfoResult {\n'
    '  resource_type: ResourceType;\n'
    '  bytes?: number;\n'
    '  created_at?: string;\n'
    '  asset_id?: string;\n'
    '  format?: string;\n'
    '}\n'
)
assert s.count(types_block) == 1, "ancre bloc de types introuvable (colle-moi le haut du fichier)"
s = s.replace(types_block, "// Types déplacés dans backends/media.types.ts (importés ci-dessus).\n")

# 2c. objet conforme à MediaBackend, en fin de fichier
if "export const cloudinaryBackend" not in s:
    s = s.rstrip() + (
        "\n\n"
        "/* -------------------------------------------------------------------------- */\n"
        "/*                    BACKEND (implémente MediaBackend)                       */\n"
        "/* -------------------------------------------------------------------------- */\n"
        "\n"
        "export const cloudinaryBackend: MediaBackend = {\n"
        "  buildAuthenticatedUrl,\n"
        "  fetchAuthenticatedAsset,\n"
        "  getAssetInfo,\n"
        "  fileExists,\n"
        "  listAuthenticatedResources,\n"
        "  deleteByPrefix,\n"
        "  deleteCloudinaryFolderRecursive,\n"
        "  buildVideoPosterUrl,\n"
        "  fetchVideoPoster,\n"
        "};\n"
    )

p.write_text(s, encoding="utf-8")
print("cloudinaryBackend : types importés + objet MediaBackend exposé")
PY

# ── 3. Façade = sélecteur ────────────────────────────────────────────────────
cat > "$FACADE" <<'TS'
/**
 * Façade média — point d'import unique des ~25 consommateurs.
 *
 * Sélectionne le backend selon `STORAGE_DRIVER` (défaut `cloudinary`) et
 * re-exporte ses fonctions sous les noms historiques : les consommateurs
 * importent d'ici sans rien changer. Le backend local (MinIO + imgproxy) sera
 * branché en Phase 3 — il suffira de remplacer la branche `local`.
 */
import { cloudinaryBackend } from "@backend/modules/cloudinary/backends/cloudinaryBackend";
import type { MediaBackend } from "@backend/modules/cloudinary/backends/media.types";

const backend: MediaBackend =
  process.env.STORAGE_DRIVER === "local"
    ? cloudinaryBackend // TODO Phase 3 : localBackend (MinIO + imgproxy)
    : cloudinaryBackend;

export const buildAuthenticatedUrl = backend.buildAuthenticatedUrl;
export const fetchAuthenticatedAsset = backend.fetchAuthenticatedAsset;
export const getAssetInfo = backend.getAssetInfo;
export const fileExists = backend.fileExists;
export const listAuthenticatedResources = backend.listAuthenticatedResources;
export const deleteByPrefix = backend.deleteByPrefix;
export const deleteCloudinaryFolderRecursive = backend.deleteCloudinaryFolderRecursive;
export const buildVideoPosterUrl = backend.buildVideoPosterUrl;
export const fetchVideoPoster = backend.fetchVideoPoster;

export type {
  Variant,
  ResourceType,
  ListAuthenticatedResourcesResult,
  GetAssetInfoResult,
  MediaBackend,
} from "@backend/modules/cloudinary/backends/media.types";
TS
echo "façade → sélecteur"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Cannot find" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(media): phase 2b — interface MediaBackend + sélecteur STORAGE_DRIVER (défaut cloudinary)" \
  && echo "commit $(git rev-parse --short HEAD)"