#!/usr/bin/env bash
#
# fix_editorial_limits_migrate.sh
#
# Reprise de step_inline_editorial_limits.sh, qui s'est arrêté à la migration.
# Les fichiers sont déjà édités dans ton dépôt ; il ne reste que la migration,
# la génération du client et le commit.
#
# ─── Ce qui a cassé ────────────────────────────────────────────────────────
#
# J'ai nommé une variable de script `HOME`, pour désigner le chemin de la page
# d'accueil. Or `HOME` est la variable d'environnement du répertoire personnel.
# En l'écrasant, tout ce qui cherche un cache utilisateur a suivi : corepack a
# tenté d'ouvrir
#
#   apps/web/src/app/(public)/page.tsx/.cache/node/corepack/v1/pnpm
#
# d'où l'ENOTDIR — « page.tsx n'est pas un répertoire ». Rien à voir avec
# Prisma ni avec la migration elle-même.
#
# La leçon vaut d'être retenue pour les scripts suivants : les noms tout en
# majuscules appartiennent à l'environnement. `HOME`, `PATH`, `USER`, `TMPDIR`
# et consorts ne doivent jamais servir de variable locale. Ce script n'en
# déclare aucune.
#
# ─── Ce qu'il reste à faire ────────────────────────────────────────────────
#
# Migration, génération du client depuis la RACINE (Prisma y est configuré),
# vérification que le client connaît bien les nouvelles colonnes, typechecks,
# commit.
#
# Sûr à relancer : `migrate deploy` ignore ce qui est déjà appliqué,
# `generate` est idempotent, et le commit est sauté s'il n'y a rien à
# committer.
#
# Usage :
#   bash fix_editorial_limits_migrate.sh
#
set -euo pipefail

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

grep -q "summaryMaxChars" prisma/schema.prisma 2>/dev/null || {
  echo "✗ les colonnes sont absentes du schéma — lance d'abord"
  echo "  step_inline_editorial_limits.sh"
  exit 1
}
[ -d prisma/migrations/20260730160000_editorial_limits ] || {
  echo "✗ migration 20260730160000_editorial_limits introuvable"; exit 1; }

echo "→ migration (depuis la racine)…"
pnpm prisma migrate deploy || { echo "✗ migration échouée — rien n'est commité"; exit 1; }

echo "→ génération du client (depuis la racine)…"
pnpm prisma generate || { echo "✗ génération échouée — rien n'est commité"; exit 1; }

echo "→ vérification du client généré…"
GENERATED_TYPES="$(find node_modules -path '*.prisma/client/index.d.ts' 2>/dev/null | head -1 || true)"
if [ -z "$GENERATED_TYPES" ]; then
  echo "✗ client Prisma généré introuvable sous node_modules"
  exit 1
fi
if ! grep -q "summaryMaxChars" "$GENERATED_TYPES"; then
  echo "✗ le client généré ne connaît pas summaryMaxChars."
  echo "  Client inspecté : $GENERATED_TYPES"
  exit 1
fi
echo "  ✓ client à jour"

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "✓ rien à committer (déjà fait) — terminé"
  exit 0
fi

git commit -m "feat(editorial): limite et hauteur repliee reglables sur place

Un reglage qu'on ne peut pas essayer sans changer de page ne s'essaie
pas. Les deux controles vivent donc a cote du builder, dans le
formulaire de discipline.

La VALEUR, elle, reste partagee : une limite editoriale n'a de sens que
si elle vaut pour toutes les cartes. Elle est stockee dans SiteStyle —
la meme ligne unique que le laboratoire — et l'interface annonce
explicitement que le reglage vaut pour toutes les disciplines.

Deux colonnes entieres plutot que des entrees dans SiteStyle.variables:
ce champ est une carte de proprietes CSS, validee par une expression
reguliere qui n'accepte que --akfc- ; une limite de caracteres n'en est
pas une et ne finira jamais dans une balise <style>.

getLimits / saveLimits sont des procedures NOUVELLES : get et save
restent intactes, le layout racine et le laboratoire dependant de leur
forme de retour.

Le second reglage est une hauteur en pixels et non un nombre de
caracteres — c'est la hauteur qui rend les cartes egales, les mots
n'ayant pas tous la meme longueur. Le champ est libelle comme tel."

echo "✓ commité"
git log -1 --oneline