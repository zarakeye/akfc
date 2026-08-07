#!/usr/bin/env bash
#
# AKFC — Baker les variables NEXT_PUBLIC_* au build de l'image.
#
# Pourquoi : `APP_ROOT` (racine sous laquelle le finder liste les assets
# Cloudinary/R2) = `process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'my_app'`. Les
# `NEXT_PUBLIC_*` sont INLINÉES au moment de `next build`, pas lues au runtime.
# Le Dockerfile n'en passait aucune → APP_ROOT a été gravé à 'my_app' dans
# l'image → le finder liste sous 'my_app/…' au lieu de 'AKFC/…' → « Aucun
# élément ». Aucune variable runtime (env_file) ne peut corriger ça : il faut
# les fournir au BUILD, en build args, puis rebâtir.
#
# Ce script ajoute les ARG/ENV dans l'étape `builder`. Les VALEURS se passent
# côté serveur via `build.args` du compose (cf. message d'accompagnement) — ce
# script ne fige aucune valeur.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-next-public-build-args.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-next-public-build-args.sh
#
set -euo pipefail

DOCKERFILE="Dockerfile"

if [ ! -f "$DOCKERFILE" ] || [ ! -f "package.json" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC (Dockerfile + package.json attendus)." >&2
  exit 1
fi

python3 - "$DOCKERFILE" <<'PY'
import sys, pathlib

df = pathlib.Path(sys.argv[1])
src = df.read_text(encoding="utf-8")

if "ARG NEXT_PUBLIC_APP_SHORT_NAME" in src:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

OLD = "RUN pnpm --filter web build"
NEW = """# ─── Variables publiques figées au BUILD ─────────────────────────────────
# Les `NEXT_PUBLIC_*` sont inlinées par `next build`, pas lues au runtime.
# Sans elles ici, `APP_ROOT` (= NEXT_PUBLIC_APP_SHORT_NAME || 'my_app', racine
# du finder) tombe sur son fallback et le finder liste du vide en prod. On les
# reçoit en build args (valeurs fournies par le compose : build.args).
ARG NEXT_PUBLIC_APP_SHORT_NAME
ARG NEXT_PUBLIC_APP_FULL_NAME
ENV NEXT_PUBLIC_APP_SHORT_NAME=${NEXT_PUBLIC_APP_SHORT_NAME}
ENV NEXT_PUBLIC_APP_FULL_NAME=${NEXT_PUBLIC_APP_FULL_NAME}
RUN pnpm --filter web build"""

assert src.count(OLD) == 1, (
    "ancre 'RUN pnpm --filter web build' introuvable ou multiple — abandon avant tout commit"
)
df.write_text(src.replace(OLD, NEW), encoding="utf-8")
print("patch Dockerfile OK (ARG/ENV NEXT_PUBLIC_* avant le build)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

# Changement Dockerfile uniquement : typecheck de pure forme, mais on respecte
# la règle « commit seulement si vert ».
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
if git commit -m "build(docker): passer NEXT_PUBLIC_* en build args (APP_ROOT du finder gravé au build)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi