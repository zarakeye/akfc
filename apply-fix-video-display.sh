#!/usr/bin/env bash
#
# AKFC — Affichage des vidéos : lecture auto (carousel) + poster/badge (éditeur).
#
#   1. HomeCarousel : la vidéo du slide actif ne se lisait pas — `play()` rejeté
#      par la politique autoplay parce que l'attribut JSX `muted` ne fixe pas
#      toujours la PROPRIÉTÉ `muted`. On la force dans la ref (`el.muted = true`).
#   2. Éditeur de galerie : un item vidéo était rendu en `<img src=…mp4>` (qu'un
#      <img> ne sait pas afficher). On passe sur le POSTER (première frame) +
#      un badge « play » en triangle pour marquer que c'est une vidéo.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-fix-video-display.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-fix-video-display.sh
#
set -euo pipefail

CARO="apps/web/src/features/app-shell/HomeCarousel.tsx"
EDIT="apps/web/src/features/page-builder/blocks/image-gallery/editor.client.tsx"

if [ ! -f "package.json" ] || [ ! -f "$CARO" ] || [ ! -f "$EDIT" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC (carousel + éditeur galerie attendus)." >&2
  exit 1
fi

# ── 1) Carousel : forcer muted ──────────────────────────────────────────────
python3 - "$CARO" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "el.muted = true" in s:
    print("carousel déjà corrigé"); sys.exit(0)
OLD = '''                  ref={(el) => {
                    if (el) videoRefs.current.set(item.mediaAssetId, el);
                    else videoRefs.current.delete(item.mediaAssetId);
                  }}'''
NEW = '''                  ref={(el) => {
                    if (el) {
                      // Forcer la PROPRIÉTÉ muted : l'attribut JSX ne la fixe
                      // pas toujours, et sans elle la politique autoplay bloque
                      // `play()` (rejet avalé → seul le poster s'affiche).
                      el.muted = true;
                      videoRefs.current.set(item.mediaAssetId, el);
                    } else {
                      videoRefs.current.delete(item.mediaAssetId);
                    }
                  }}'''
assert s.count(OLD) == 1, "ancre ref vidéo carousel introuvable — abandon"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("carousel : muted forcé (lecture auto)")
PY

# ── 2) Éditeur galerie : poster + badge play ────────────────────────────────
python3 - "$EDIT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "resolved.kind === \"video\"" in s:
    print("éditeur déjà corrigé"); sys.exit(0)
OLD = '''          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolved.url}
              alt=""
              className="h-full w-full object-cover"
            />
          );'''
NEW = '''          const isVideo = resolved.kind === "video";
          return (
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  isVideo ? (resolved.posterUrl ?? resolved.url) : resolved.url
                }
                alt=""
                className="h-full w-full object-cover"
              />
              {isVideo && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-4 w-4 fill-white"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );'''
assert s.count(OLD) == 1, "ancre <img> éditeur introuvable — abandon"
p.write_text(s.replace(OLD, NEW), encoding="utf-8")
print("éditeur galerie : poster + badge play")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "fix(carousel): lecture auto vidéo (muted) + feat(gallery-builder): poster + badge play" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi