#!/usr/bin/env bash
#
# AKFC — Livraison publique des images Cloudinary de bibliothèque (option A).
#
# Ce que fait ce script, en un seul incrément :
#   1. crée la route publique /api/media/public/by-public-id/[...publicId]
#      (garde : asset `published` ET référencé par >=1 PageMediaReference),
#   2. fait honorer `audience` à buildMediaProxyUrl côté Cloudinary,
#   3. rafraîchit un commentaire périmé du resolver (non bloquant).
#
# Édits = substitutions python avec assert count==1 : si une ancre ne matche
# pas, le script s'arrête AVANT tout commit. Idempotent (anti-double-appli).
#
# Usage normal (Stéphane) : depuis la racine du repo -> apply -> typecheck -> commit.
#   bash apply-public-cloudinary-proxy.sh
#
# Usage Claude sur clone (applique seulement, ni typecheck ni commit) :
#   AKFC_APPLY_ONLY=1 bash apply-public-cloudinary-proxy.sh
#
set -euo pipefail

ROUTE_FILE="apps/web/src/app/api/media/public/by-public-id/[...publicId]/route.ts"
MEDIA_URL="packages/backend/src/modules/media/helpers/media-url.ts"
RESOLVER="packages/backend/src/modules/media/services/resolveMediaByIds.service.ts"

# ── Garde : lancé depuis la racine du repo ──────────────────────────────────
if [ ! -f "$MEDIA_URL" ]; then
  echo "ERREUR: $MEDIA_URL introuvable — lance ce script depuis la racine du repo AKFC." >&2
  exit 1
fi

# ── Application (idempotente) ───────────────────────────────────────────────
python3 - "$ROUTE_FILE" "$MEDIA_URL" "$RESOLVER" <<'PY'
import sys, pathlib

route_file, media_url, resolver = sys.argv[1:4]

mu = pathlib.Path(media_url)
src = mu.read_text(encoding="utf-8")

# Anti double-application : le marqueur unique est la nouvelle branche.
if "public/by-public-id" in src:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) buildMediaProxyUrl : honorer `audience` côté Cloudinary (HARD) ───────
OLD = """  if (asset.publicId !== null) {
    return `/api/media/by-public-id/${encodeSegments(asset.publicId)}?variant=large`;
  }"""
NEW = """  if (asset.publicId !== null) {
    const cldPrefix =
      audience === 'public'
        ? '/api/media/public/by-public-id'
        : '/api/media/by-public-id';
    return `${cldPrefix}/${encodeSegments(asset.publicId)}?variant=large`;
  }"""
assert src.count(OLD) == 1, (
    "ancre buildMediaProxyUrl introuvable ou multiple — abandon avant tout commit"
)
mu.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("patch media-url.ts OK")

# ── 2) Nouvelle route publique Cloudinary ───────────────────────────────────
ROUTE_TS = r'''import { NextRequest } from "next/server";

import { prisma } from "@backend/prisma";
import {
  fetchAuthenticatedAsset,
  fetchVideoPoster,
} from "@backend/modules/cloudinary/services/cloudinary.service";

/**
 * Proxy PUBLIC des images / vidéos Cloudinary de bibliothèque.
 *
 * Pendant Cloudinary de `/api/media/public/r2/[...path]`, et symétrique de
 * `/api/media/by-public-id/[...publicId]` — qui, lui, exige une session
 * parce qu'il sert aussi des documents personnels (et un fallback R2).
 *
 * ─── Garde (doctrine « deux gestes intentionnels ») ─────────────────────
 *
 *   l'asset doit être `published` ET référencé par au moins une
 *   `PageMediaReference`.
 *
 * Un document personnel n'est jamais référencé par une page : il ne passe
 * donc jamais cette garde, sans qu'on ait à distinguer « image » de
 * « document ». C'est ce qui rend cette route sûre là où rouvrir le proxy
 * général ne le serait pas.
 *
 * ─── 404 uniforme ───────────────────────────────────────────────────────
 *
 * Comme la route R2 publique : on ne distingue pas « n'existe pas » de
 * « existe mais non servable ». Tout refus est un 404 — et aucune image de
 * démonstration n'est servie ici.
 *
 * ─── Livraison ──────────────────────────────────────────────────────────
 *
 * Le backend détient le secret Cloudinary, signe l'URL `authenticated`, va
 * chercher le binaire et le re-streame. Paramètres reconnus, en parité avec
 * le proxy authentifié : `variant`, `as=poster`, `v` (version Cloudinary),
 * `format` (extension autoritaire, cf. buildAuthenticatedUrl).
 */

type Variant = "thumb" | "small" | "medium" | "large" | "original";

function parseVariant(value: string | null): Variant {
  if (value === "thumb") return "thumb";
  if (value === "small") return "small";
  if (value === "medium") return "medium";
  if (value === "large") return "large";
  if (value === "original") return "original";
  return "large";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string[] }> },
) {
  try {
    const { publicId } = await params;
    const id = publicId?.join("/");
    if (!id) return new Response("Not found", { status: 404 });

    // ─── Garde : published + référencé par au moins une page ──────────────
    // Clé sur `publicId` (@unique). L'asset ne se sert publiquement que si
    // un PageMediaReference le pointe et qu'il est publié — l'invariant
    // « référencé ⟹ published » est verrouillé côté sync + gardes de statut,
    // mais on revérifie ici : cette route est frappable indépendamment du
    // rendu de la page.
    const reference = await prisma.pageMediaReference.findFirst({
      where: {
        mediaAsset: {
          publicId: id,
          status: "published",
        },
      },
      select: { id: true },
    });

    if (!reference) return new Response("Not found", { status: 404 });

    // ─── Paramètres de rendu ──────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const variant = parseVariant(searchParams.get("variant"));
    const asPoster = searchParams.get("as") === "poster";

    const vParam = searchParams.get("v");
    const version = vParam ? Number(vParam) : undefined;
    const safeVersion =
      version && Number.isFinite(version) ? version : undefined;

    const rawFormat = searchParams.get("format");
    const format =
      rawFormat && /^[A-Za-z0-9]{1,8}$/.test(rawFormat) ? rawFormat : undefined;

    const asset = asPoster
      ? await fetchVideoPoster(id, variant)
      : await fetchAuthenticatedAsset(id, variant, safeVersion, format);

    // Asset gardé mais introuvable côté Cloudinary : erreur réelle, mais on
    // ne révèle rien de plus — 404 franc, pas d'image de secours.
    if (!asset || !asset.ok || !asset.body) {
      return new Response("Not found", { status: 404 });
    }

    const contentType =
      asset.headers.get("content-type") ?? "application/octet-stream";
    const isMedia = /^(image|video)\//.test(contentType);

    return new Response(asset.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // On ne fige (1 an, immutable) que ce qui est bien un média : une
        // réponse inattendue ne doit pas se fossiliser dans le cache client.
        "Cache-Control": isMedia
          ? "public, max-age=31536000, immutable"
          : "public, max-age=60",
        "X-Asset-Source": "cloudinary",
      },
    });
  } catch (error) {
    console.error("[media] public by-public-id error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
'''

rf = pathlib.Path(route_file)
rf.parent.mkdir(parents=True, exist_ok=True)
rf.write_text(ROUTE_TS, encoding="utf-8")
print("route publique créée")

# ── 3) Commentaire périmé du resolver (SOFT — non bloquant) ─────────────────
rp = pathlib.Path(resolver)
if rp.exists():
    rsrc = rp.read_text(encoding="utf-8")
    COLD = " *                (la route `by-public-id` est déjà publique), mais"
    CNEW = " *                (via `/api/media/public/by-public-id`, garde published + réf), mais"
    if rsrc.count(COLD) == 1:
        rp.write_text(rsrc.replace(COLD, CNEW), encoding="utf-8")
        print("commentaire resolver rafraîchi")
    else:
        print("commentaire resolver inchangé (ancre absente) — non bloquant")
PY

# ── APPLY_ONLY : Claude sur clone, on s'arrête là ───────────────────────────
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

# ── Rien à committer (cas idempotent) ───────────────────────────────────────
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

# ── Typecheck (pnpm check nettoie .next d'abord → pas de faux négatif) ───────
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

# ── Commit ──────────────────────────────────────────────────────────────────
git add -A
if git commit -m "feat(media): proxy public Cloudinary by-public-id (garde published + référencé) + audience honorée dans buildMediaProxyUrl" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"
  head -10 /tmp/akfc_commit.log
  exit 1
fi