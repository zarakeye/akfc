#!/usr/bin/env bash
#
# AKFC — Versionner la FORME de la config d'environnement (pas les secrets).
#
# Pourquoi : `.gitignore` contient `.env*`, donc TOUS les fichiers d'env
# (dont apps/web/.env.local) sont ignorés et n'ont jamais été poussés. Sur
# le serveur, l'app tourne donc sans Cloudinary/R2/JWT/SMTP → le finder liste
# du vide (« Aucun élément »). C'est le comportement CORRECT de git : des
# secrets n'ont rien à faire dans le dépôt. Le vrai correctif n'est pas de
# committer les secrets, mais de :
#
#   1. versionner un `.env.example` (template, valeurs bidon) pour que la
#      liste des variables requises soit documentée et ne se reperde plus ;
#   2. fournir les VRAIS secrets au conteneur côté serveur, via le compose
#      (`env_file:`), hors git — étape manuelle décrite dans le message
#      d'accompagnement.
#
# Ce script fait le point (1). Il ne touche à aucun secret réel.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-env-example.sh
# Usage Claude sur clone (applique seulement) :
#   AKFC_APPLY_ONLY=1 bash apply-env-example.sh
#
set -euo pipefail

GITIGNORE=".gitignore"
EXAMPLE=".env.example"

if [ ! -f "package.json" ] || [ ! -f "$GITIGNORE" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC (package.json + .gitignore attendus)." >&2
  exit 1
fi

python3 - "$GITIGNORE" "$EXAMPLE" <<'PY'
import sys, pathlib

gitignore, example = sys.argv[1:3]

gi = pathlib.Path(gitignore)
gsrc = gi.read_text(encoding="utf-8")
ex = pathlib.Path(example)

already_ignore = "!.env.example" in gsrc
already_example = ex.exists()

if already_ignore and already_example:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) .gitignore : ne plus ignorer le template (HARD si pas déjà fait) ─────
# `.env*` capture aussi `.env.example` : il faut une négation APRÈS le motif.
if not already_ignore:
    OLD = "# env files (can opt-in for committing if needed)\n.env*"
    NEW = "# env files (can opt-in for committing if needed)\n.env*\n# ...sauf le template, qui lui DOIT être versionné :\n!.env.example"
    assert gsrc.count(OLD) == 1, (
        "ancre .gitignore introuvable ou multiple — abandon avant tout commit"
    )
    gi.write_text(gsrc.replace(OLD, NEW), encoding="utf-8")
    print("patch .gitignore OK (!.env.example)")
else:
    print(".gitignore déjà OK")

# ── 2) .env.example : template, valeurs bidon uniquement ────────────────────
if not already_example:
    TEMPLATE = """# ════════════════════════════════════════════════════════════════════════
#  AKFC — TEMPLATE de configuration d'environnement
#
#  Ce fichier est le SEUL fichier d'env versionné. Il ne contient QUE des
#  valeurs bidon : il documente les variables requises, pas leurs secrets.
#
#  En local  : copie-le en `apps/web/.env.local` et remplis les vraies
#              valeurs (Next charge `.env.local` en dev et au build).
#  En prod   : le build est `output: "standalone"` et le Dockerfile ne copie
#              AUCUN .env. Les variables serveur doivent donc être injectées
#              dans le conteneur par le compose (`env_file:` de préférence).
#              Les `NEXT_PUBLIC_*` sont figées au BUILD : elles doivent être
#              présentes quand `next build` tourne (build args), pas seulement
#              au runtime.
# ════════════════════════════════════════════════════════════════════════

# ─── Base de données (Prisma) ───────────────────────────────────────────
# ⚠ En Docker, l'hôte n'est PAS localhost mais le nom du service compose
#   (ex. pgbouncer). Un `@localhost` ici casse la connexion dans le conteneur.
DATABASE_URL=postgresql://user:password@host:5432/akfc_db?schema=public
DIRECT_DATABASE_URL=postgresql://user:password@host:5432/akfc_db?schema=public
PRISMA_CLIENT_ENGINE_TYPE=library

# ─── Auth ────────────────────────────────────────────────────────────────
JWT_SECRET=change-me-long-random-string

# ─── Cloudinary (REQUIS par le finder : listing + livraison des images) ──
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ─── Cloudflare R2 (REQUIS par le finder : le client JETTE si une manque) ─
# NB : le `.env` racine ne les avait PAS — seul apps/web/.env.local les porte.
R2_ACCOUNT_ID=your-r2-account-id
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=your-r2-bucket

# ─── Identité de l'app ───────────────────────────────────────────────────
APP_FULL_NAME=Association ...
APP_SHORT_NAME=AKFC
# Figées au build (client bundle). À passer en build args côté Docker.
NEXT_PUBLIC_APP_FULL_NAME=Association ...
NEXT_PUBLIC_APP_SHORT_NAME=AKFC
# Lues par le code mais absentes des .env actuels — à renseigner :
APP_URL=https://akfc.example.org
NEXTAUTH_URL=https://akfc.example.org
APP_SUPPORT_EMAIL=contact@example.org
# ⚠ Le code lit `APP_DOLMAIN` (faute de frappe pour APP_DOMAIN). Tant que le
#   code n'est pas corrigé, la variable côté env doit s'appeler APP_DOLMAIN.
APP_DOLMAIN=example.org

# ─── SMTP (emails transactionnels) ───────────────────────────────────────
SMTP_HOST=smtp.example.org
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_NOREPLY=noreply@example.org
"""
    ex.write_text(TEMPLATE, encoding="utf-8")
    print(".env.example créé")
else:
    print(".env.example déjà présent — laissé tel quel")
PY

# ── APPLY_ONLY : Claude sur clone ───────────────────────────────────────────
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

# Changement docs+gitignore uniquement : le typecheck est une formalité, mais
# on respecte la règle « commit seulement si vert ».
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
if git commit -m "chore(env): template .env.example versionné + .gitignore n'ignore plus le template" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi