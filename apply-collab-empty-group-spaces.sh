#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif : espaces de groupe VISIBLES même vides dans le
# finder, SANS toucher à la convention `<status>` obsolète.
#
# Remplace/annule l'incrément 1g retiré (qui passait par `upsertFolders` →
# `statusFromPath`). Ici on crée directement des lignes `Folder` avec un statut
# EXPLICITE (`published`, métadonnée DB, PAS dérivé du chemin). Le finder lit le
# registre `Folder` filtré PAR PRÉFIXE, sans filtre de statut → la ligne suffit
# à afficher le dossier vide.
#
# Fichiers :
#   - ensureGroupSpaceFolder.service.ts (RÉÉCRIT proprement : prisma.folder.upsert,
#     statut explicite, pour `groups/` + l'espace du groupe)
#   - memberGroups/router.ts : appel dans create (si collaboratif) et update
#     (si bascule → collaboratif)   [idempotent : ignoré si déjà présent]
#
# Prérequis : 1a appliqué. Pas de migration.
# Usage : bash apply-collab-empty-group-spaces.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-empty-group-spaces.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberGroups/router.ts"
SVC="packages/backend/src/modules/memberGroups/ensureGroupSpaceFolder.service.ts"

if [ ! -f "package.json" ] || [ ! -f "$ROUTER" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($ROUTER attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── Service (RÉÉCRIT — écrase toute version antérieure, dont celle du 1g retiré) ─
cat > "$SVC" <<'TS'
import type { PrismaClient } from "@prisma/client";

import { resolveGroupBaseFolder } from "@backend/modules/media/services/resolveGroupBaseFolder.service";

/**
 * Rend l'espace d'un groupe COLLABORATIF visible (même vide) dans le finder, en
 * créant ses lignes de registre `Folder` — le conteneur `groups/` et l'espace
 * lui-même. Le finder lit `Folder` par PRÉFIXE (sans filtre de statut), donc
 * une ligne suffit à afficher le dossier vide.
 *
 * Le statut est posé EXPLICITEMENT (`published`, métadonnée DB) — jamais dérivé
 * du chemin : aucune allusion à la convention `<appRoot>/<status>/…` obsolète.
 * Idempotent (upsert sur la clé unique `appRoot_fullPath`).
 *
 * Lève si le groupe n'est pas collaboratif (resolveGroupBaseFolder) : à
 * n'appeler que pour un groupe collaboratif.
 */
export async function ensureGroupSpaceFolder(params: {
  prisma: PrismaClient;
  appRoot: string;
  groupId: string;
}): Promise<void> {
  const { prisma, appRoot, groupId } = params;

  const base = await resolveGroupBaseFolder({ prisma, appRoot, groupId });

  for (const fullPath of [`${appRoot}/groups`, base]) {
    await prisma.folder.upsert({
      where: { appRoot_fullPath: { appRoot, fullPath } },
      create: { appRoot, fullPath, status: "published" },
      update: {},
    });
  }
}
TS
echo "service (ré)écrit : $SVC"

# ── Router : hooks create + update (idempotent) ─────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")

if "ensureGroupSpaceFolder" in s:
    print("router memberGroups déjà câblé (hooks présents)")
    sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

ENSURE = (
    "        await ensureGroupSpaceFolder({\n"
    "          prisma: ctx.prisma,\n"
    "          appRoot: ctx.appRoot,\n"
    "          groupId: GROUPID,\n"
    "        });\n"
)

s = sub(
    'import { isAdmin } from "@backend/trpc/middleware";',
    'import { isAdmin } from "@backend/trpc/middleware";\n'
    'import { ensureGroupSpaceFolder } from "@backend/modules/memberGroups/ensureGroupSpaceFolder.service";',
    "import")

s = sub(
    "      const group = await ctx.prisma.memberGroup.create({\n"
    "        data: {\n"
    "          name: input.name,\n"
    "          description: input.description,\n"
    "          isCollaborative: input.isCollaborative ?? false,\n"
    "        },\n"
    "        select: { id: true },\n"
    "      });\n"
    "      return { id: group.id };",
    "      const group = await ctx.prisma.memberGroup.create({\n"
    "        data: {\n"
    "          name: input.name,\n"
    "          description: input.description,\n"
    "          isCollaborative: input.isCollaborative ?? false,\n"
    "        },\n"
    "        select: { id: true },\n"
    "      });\n"
    "      if (input.isCollaborative) {\n"
    + ENSURE.replace("GROUPID", "group.id") +
    "      }\n"
    "      return { id: group.id };",
    "create hook")

s = sub(
    "      await ctx.prisma.memberGroup.update({\n"
    "        where: { id: input.id },\n"
    "        data: {\n"
    "          name: input.name,\n"
    "          description: input.description ?? null,\n"
    "          isCollaborative: input.isCollaborative,\n"
    "        },\n"
    "      });\n"
    "      return { success: true };",
    "      await ctx.prisma.memberGroup.update({\n"
    "        where: { id: input.id },\n"
    "        data: {\n"
    "          name: input.name,\n"
    "          description: input.description ?? null,\n"
    "          isCollaborative: input.isCollaborative,\n"
    "        },\n"
    "      });\n"
    "      if (input.isCollaborative === true) {\n"
    + ENSURE.replace("GROUPID", "input.id") +
    "      }\n"
    "      return { success: true };",
    "update hook")

rp.write_text(s, encoding="utf-8")
print("router memberGroups câblé (create + update)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(groups): espace de groupe visible même vide (Folder explicite, sans statusFromPath)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  Groupes créés AVANT ce script : décoche/recoche « collaboratif » sur leur fiche pour matérialiser l'espace."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi