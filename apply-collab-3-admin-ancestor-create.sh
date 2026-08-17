#!/usr/bin/env bash
#
# AKFC — Étape 3, règles « Administrateurs ancêtre de tout groupe ».
#
#   Règle 1 (aucun groupe → 1er = Administrateurs) : déjà assurée par
#           `ensureAdminGroup` au boot (crée Administrateurs, isAdminGroup, root).
#   Règle 2 (nouveau groupe sans parent explicite → rattaché à Administrateurs) :
#           le `create` résout le parent par défaut = groupe isAdminGroup.
#   Règle 3 (à la création, un SELECT de parent en plus du nom) : `GroupForm`
#           reçoit un select des groupes (défaut = Administrateurs).
#
# Backend : memberGroup.create — input `parentGroupId?` + résolution défaut admin
#           + `data.parentGroupId`.
# Front   : réécrit `GroupForm.tsx` (nom + case collaboratif + select parent).
#
# Prérequis : 1a + empty-group-spaces + 3a (+ migration 3a appliquée) + 1f.
# Front NON testé → valider à l'écran. Pas de migration.
# Usage : bash apply-collab-3-admin-ancestor-create.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-3-admin-ancestor-create.sh   (clone)
#
set -euo pipefail

ROUTER="packages/backend/src/modules/memberGroups/router.ts"
FORM="apps/web/src/features/admin/groups/forms/GroupForm.tsx"

for f in "package.json" "$ROUTER"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f (lance depuis la racine)." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── Backend : create rattache au groupe admin par défaut ────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
rp = pathlib.Path(sys.argv[1]); s = rp.read_text(encoding="utf-8")
if "// Règle « Administrateurs ancêtre" in s:
    print("create déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# input : + parentGroupId (UNIQUE au create : z.object({ suivi direct de name,
# alors que update a `id:` avant name)
s = sub(
    "      z.object({\n"
    "        name: z.string().trim().min(1).max(120),\n"
    "        description: z.string().trim().max(500).optional(),\n"
    "        isCollaborative: z.boolean().optional(),\n"
    "      }),",
    "      z.object({\n"
    "        name: z.string().trim().min(1).max(120),\n"
    "        description: z.string().trim().max(500).optional(),\n"
    "        isCollaborative: z.boolean().optional(),\n"
    "        parentGroupId: z.string().optional(),\n"
    "      }),",
    "create input")

# corps : résoudre le parent par défaut + l'écrire dans data
s = sub(
    "    .mutation(async ({ ctx, input }) => {\n"
    "      const group = await ctx.prisma.memberGroup.create({\n"
    "        data: {\n"
    "          name: input.name,\n"
    "          description: input.description,\n"
    "          isCollaborative: input.isCollaborative ?? false,\n"
    "        },\n"
    "        select: { id: true },\n"
    "      });",
    "    .mutation(async ({ ctx, input }) => {\n"
    "      // Règle « Administrateurs ancêtre de tout » : sans parent explicite,\n"
    "      // le nouveau groupe est rattaché au groupe Administrateurs.\n"
    "      const parentGroupId =\n"
    "        input.parentGroupId ??\n"
    "        (\n"
    "          await ctx.prisma.memberGroup.findFirst({\n"
    "            where: { isAdminGroup: true },\n"
    "            select: { id: true },\n"
    "          })\n"
    "        )?.id ??\n"
    "        null;\n"
    "\n"
    "      const group = await ctx.prisma.memberGroup.create({\n"
    "        data: {\n"
    "          name: input.name,\n"
    "          description: input.description,\n"
    "          isCollaborative: input.isCollaborative ?? false,\n"
    "          parentGroupId,\n"
    "        },\n"
    "        select: { id: true },\n"
    "      });",
    "create body")

rp.write_text(s, encoding="utf-8")
print("create patché (parent par défaut = Administrateurs)")
PY

# ── Front : GroupForm réécrit avec select de parent ─────────────────────────
mkdir -p "$(dirname "$FORM")"
cat > "$FORM" <<'EOF'
"use client";

import { JSX, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@components/ui/Input";
import { Button } from "@components/ui/Button";
import { trpc } from "@trpc/trpcClient";

/**
 * Création d'un groupe : nom + case « collaboratif » + SELECT du groupe parent.
 * Sans parent choisi, le backend rattache au groupe « Administrateurs »
 * (Administrateurs = ancêtre de tout groupe). Câblé sur la mutation tRPC.
 */
export function GroupForm(): JSX.Element {
  const router = useRouter();
  const utils = trpc.useUtils();
  const groupsQuery = trpc.memberGroup.list.useQuery();

  const [name, setName] = useState("");
  const [collaborative, setCollaborative] = useState(false);
  const [parentGroupId, setParentGroupId] = useState("");

  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      void utils.memberGroup.list.invalidate();
      router.push("/dashboard/groups");
    },
  });

  const groups = groupsQuery.data ?? [];

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        create.mutate({
          name: name.trim(),
          isCollaborative: collaborative,
          parentGroupId: parentGroupId || undefined,
        });
      }}
    >
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nom
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bureau, Compétition…"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="parent" className="text-sm font-medium">
          Groupe parent
        </label>
        <select
          id="parent"
          value={parentGroupId}
          onChange={(e) => setParentGroupId(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Administrateurs (par défaut)</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          Sans choix, le groupe est rattaché à « Administrateurs ».
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={collaborative}
          onChange={(e) => setCollaborative(e.target.checked)}
        />
        Espace collaboratif (dossier dédié + droits éditeur/lecteur)
      </label>

      {create.error && <p className="text-red-500">{create.error.message}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={!name.trim() || create.isPending}>
          {create.isPending ? "Création…" : "Créer"}
        </Button>
      </div>
    </form>
  );
}
EOF
echo "GroupForm réécrit (select parent) : $FORM"

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
if git commit -m "feat(groups): Administrateurs = parent par défaut (create) + select de parent au formulaire" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front non testé — valider : /dashboard/groups/create montre le select de parent."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi