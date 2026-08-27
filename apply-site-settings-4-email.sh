#!/usr/bin/env bash
#
# AKFC — Réglages du site (CMS) incrément 4 : l'e-mail de bienvenue.
#
# Boucle la tâche de départ (« mettre à jour l'adresse du site dans l'e-mail »).
# Le template `welcomeEmailWithPassword.ts` lisait tout dans le .env :
# APP_SHORT_NAME, APP_FULL_NAME, APP_SUPPORT_EMAIL et NEXTAUTH_URL/auth/signin.
#
# FIX : au moment de l'envoi (rare — création de compte), on lit `SiteSettings`
# (prisma direct, on est dans le backend). Précédence : SiteSettings GAGNE,
# l'env reste le REPLI. L'URL du lien « Se connecter » passe sur une canonique
# unique — `NEXT_PUBLIC_SITE_URL || NEXTAUTH_URL || https://akfc.fr` — alignée
# sur le siteUrl.ts du front et robuste à un env périmé.
#
#   shortName (env, const module) → shortTitle (settings || env || "AKFC")
#   APP_FULL_NAME                 → longTitle  (settings || env || shortTitle)
#   APP_SUPPORT_EMAIL             → supportEmail (settings || env || "")
#   NEXTAUTH_URL/auth/signin      → siteUrl/auth/signin (canonique)
#
# NB : `sendPasswordResetEmail.ts` a le même symptôme (APP_URL → localhost par
# défaut) — hors périmètre ici, même traitement possible si tu veux.
#
# Prérequis : incrément 1 (modèle SiteSettings migré). Template seul. Typecheck backend.
#
# Usage : bash apply-site-settings-4-email.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-4-email.sh   (clone)
#
set -euo pipefail

TPL="packages/backend/src/email/templates/welcomeEmailWithPassword.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$TPL" ]         || { echo "ERREUR: $TPL introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$TPL" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "siteSettings" in s:
    print("e-mail déjà branché sur SiteSettings"); sys.exit(0)

# 1. import prisma + retrait de la const module `shortName`
old_head = (
    'import nodemail from "nodemailer";\n'
    "\n"
    "const shortName = process.env.APP_SHORT_NAME || 'My App';\n"
)
assert s.count(old_head) == 1, "ancre en-tête (import + const shortName) introuvable/multiple"
new_head = (
    'import nodemail from "nodemailer";\n'
    "\n"
    'import { prisma } from "@backend/prisma";\n'
)
s = s.replace(old_head, new_head)

# 2. bloc de résolution injecté en tête de fonction
old_open = (
    "export default async function sendPasswordEmail(to: string, subject: string, password: string): Promise<void> {\n"
    "  const mailInfo = {\n"
)
assert s.count(old_open) == 1, "ancre ouverture fonction introuvable/multiple"
new_open = (
    "export default async function sendPasswordEmail(to: string, subject: string, password: string): Promise<void> {\n"
    "  // Identité affichée : SiteSettings gagne, l'env reste le repli.\n"
    "  const settings = await prisma.siteSettings\n"
    '    .findUnique({ where: { id: "site" } })\n'
    "    .catch(() => null);\n"
    '  const shortTitle =\n'
    '    settings?.shortTitle?.trim() || process.env.APP_SHORT_NAME || "AKFC";\n'
    "  const longTitle =\n"
    "    settings?.longTitle?.trim() || process.env.APP_FULL_NAME || shortTitle;\n"
    '  const supportEmail =\n'
    '    settings?.supportEmail?.trim() || process.env.APP_SUPPORT_EMAIL || "";\n'
    "  // URL canonique (infra, pas éditable admin) — alignée sur siteUrl.ts.\n"
    "  const siteUrl = (\n"
    "    process.env.NEXT_PUBLIC_SITE_URL ||\n"
    "    process.env.NEXTAUTH_URL ||\n"
    '    "https://akfc.fr"\n'
    "  ).replace(/\\/+$/, \"\");\n"
    "\n"
    "  const mailInfo = {\n"
)
s = s.replace(old_open, new_open)

# 3. remplacement des variables dans le corps (comptes attendus)
def swap(src, old, new, n):
    c = src.count(old)
    assert c == n, f"attendu {n}× '{old}', trouvé {c}"
    return src.replace(old, new)

s = swap(s, "${shortName}", "${shortTitle}", 3)          # from, subject, h2
s = swap(s, "${process.env.APP_FULL_NAME}", "${longTitle}", 3)   # h2, footer, bonne année
s = swap(s, "${process.env.APP_SUPPORT_EMAIL}", "${supportEmail}", 2)  # href + texte
s = swap(s, "${process.env.NEXTAUTH_URL}/auth/signin", "${siteUrl}/auth/signin", 1)

p.write_text(s, encoding="utf-8")
print("e-mail branché (SiteSettings + URL canonique)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(settings): e-mail de bienvenue lit SiteSettings + URL canonique (lien de connexion corrigé)" \
  && echo "commit $(git rev-parse --short HEAD)"