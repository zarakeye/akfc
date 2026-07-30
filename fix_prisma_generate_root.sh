#!/usr/bin/env bash
#
# fix_prisma_generate_root.sh
#
# Reprise de step_discipline_summary_backend.sh, qui s'est arrêté au typecheck.
# Les fichiers sont déjà édités dans ton dépôt ; il ne reste que la migration,
# la régénération du client et le commit.
#
# ─── Ce qui a échoué, et pourquoi c'était silencieux ───────────────────────
#
# Prisma est configuré à la RACINE de ton monorepo : le `postinstall` y fait
# `pnpm prisma generate`, la configuration `prisma` (seed) est dans le
# package.json racine, et le schéma est en `prisma/schema.prisma`.
# `packages/backend/package.json` n'a ni script ni configuration Prisma.
#
# Mon `pnpm --filter backend prisma generate` ne visait donc pas ton schéma.
# Il a rendu la main sans régénérer quoi que ce soit — et sans code d'erreur,
# donc le script a poursuivi jusqu'au typecheck, qui a buté sur des types
# Prisma inchangés. Une réussite apparente est pire qu'un échec franc : elle
# déplace l'erreur loin de sa cause.
#
# Les commandes partent maintenant de la racine, avec l'idiome du projet
# lui-même (`pnpm prisma …`, celui du postinstall).
#
# ─── Et une vérification, pour que ça ne repasse plus inaperçu ─────────────
#
# Après `generate`, le script CONTRÔLE que le client produit connaît bien le
# champ. Si la génération n'a rien fait, on le sait tout de suite et avec le
# bon message, au lieu de le découvrir quatre erreurs de types plus loin.
#
# Le script est sûr à relancer : `migrate deploy` ignore les migrations déjà
# appliquées, `generate` est idempotent, et le commit est sauté s'il n'y a
# rien à committer.
#
# Usage :
#   bash fix_prisma_generate_root.sh
#
set -euo pipefail

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Prérequis : les édits du script précédent doivent être en place ────────
grep -q "summary Json" prisma/schema.prisma 2>/dev/null || {
  echo "✗ le champ summary est absent du schéma — lance d'abord"
  echo "  step_discipline_summary_backend.sh"
  exit 1
}
[ -d prisma/migrations/20260730120000_discipline_summary ] || {
  echo "✗ migration 20260730120000_discipline_summary introuvable"; exit 1; }

# ── Migration, depuis la racine ────────────────────────────────────────────
echo "→ application de la migration (depuis la racine)…"
if ! pnpm prisma migrate deploy; then
  echo "✗ migration non appliquée — rien n'est commité"
  exit 1
fi

# ── Régénération du client, depuis la racine ───────────────────────────────
echo "→ régénération du client Prisma (depuis la racine)…"
if ! pnpm prisma generate; then
  echo "✗ génération du client échouée — rien n'est commité"
  exit 1
fi

# ── Vérification : le client connaît-il vraiment le champ ? ────────────────
# C'est le contrôle qui manquait. Sans lui, une génération qui ne fait rien
# passe pour un succès et l'erreur ne se manifeste qu'au typecheck.
echo "→ vérification du client généré…"
GEN="$(find node_modules -path '*.prisma/client/index.d.ts' 2>/dev/null | head -1 || true)"
if [ -z "$GEN" ]; then
  echo "✗ client Prisma généré introuvable sous node_modules"
  echo "  (attendu : un chemin en .prisma/client/index.d.ts)"
  exit 1
fi
if ! grep -q "summary" "$GEN"; then
  echo "✗ le client généré ne connaît PAS le champ summary."
  echo "  Le schéma lu par Prisma n'est pas celui qu'on a édité, ou la"
  echo "  génération a écrit ailleurs que là où TypeScript résout."
  echo "  Client inspecté : $GEN"
  exit 1
fi
echo "  ✓ le client connaît le champ summary"

# ── Typechecks, séparément ─────────────────────────────────────────────────
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

git commit -m "feat(disciplines): champ de presentation synthetique

Premier des trois increments : le champ, sa migration, sa plomberie.

summary se calque exactement sur description — un Json en PageContentV1
avec le meme composite vide par defaut. Aucune conversion, aucun cas
nullable en aval, PageRenderer s'y applique tel quel. Un composite vide
vaut « pas de presentation synthetique » : c'est l'interrupteur
d'apparition sur l'accueil, sans booleen supplementaire, comme la bio
d'instructeur.

Piege traite : syncPageMediaReferences recalcule l'ensemble COMPLET des
references d'une page. Lui passer un seul des deux composites ferait
passer les images de l'autre pour orphelines. La sync recoit donc leur
UNION, et l'update relit la ligne APRES ecriture plutot que de
raisonner sur ce qui a ete fourni — l'union porte alors sur l'etat
reel, sans cas particulier a oublier.

Migration ecrite a la main (utilisateur Postgres sans CREATEDB) et
appliquee par migrate deploy depuis la RACINE : prisma est configure la
(postinstall, config seed, prisma/schema.prisma) et non dans
packages/backend, ou les commandes ne visaient pas le bon schema."

echo "✓ commité"
git log -1 --oneline