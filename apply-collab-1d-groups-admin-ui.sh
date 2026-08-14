#!/usr/bin/env bash
#
# AKFC — Chantier collaboratif, incrément 1d (FRONT) : gestion des groupes
# collaboratifs dans le dashboard admin.
#
# Étend apps/web/.../dashboard/groups/page.tsx (câblé sur les mutations exposées
# en 1a) :
#   - case à cocher « Espace collaboratif » à la création,
#   - même bascule sur un groupe existant (update.isCollaborative),
#   - badge « collab » dans la liste,
#   - pour chaque membre d'un groupe collaboratif : bouton éditeur ↔ lecteur
#     (setMemberAccess).
#
# FRONT non exécutable sur le clone → livré NON TESTÉ, à valider à l'écran.
# Prérequis : 1a appliqué (create/update.isCollaborative, members.access,
# setMemberAccess). Pas de migration.
#
# Usage : bash apply-collab-1d-groups-admin-ui.sh
#         AKFC_APPLY_ONLY=1 bash apply-collab-1d-groups-admin-ui.sh   (clone)
#
set -euo pipefail

PAGE="apps/web/src/app/(admin)/dashboard/groups/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($PAGE attendu)." >&2
  exit 1
fi

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier collaboratif va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

python3 - "$PAGE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

if "newCollab" in s:
    print("page groups déjà à jour")
    sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# 1) état newCollab
s = sub(
"""  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");""",
"""  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCollab, setNewCollab] = useState(false);""",
"state newCollab")

# 2) reset newCollab au succès de create
s = sub(
"""  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      setNewName("");
      void utils.memberGroup.list.invalidate();
    },
  });""",
"""  const create = trpc.memberGroup.create.useMutation({
    onSuccess: () => {
      setNewName("");
      setNewCollab(false);
      void utils.memberGroup.list.invalidate();
    },
  });""",
"create onSuccess")

# 3) bloc de création : ajoute la case collaboratif + passe isCollaborative
s = sub(
"""        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouveau groupe"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={!newName.trim() || create.isPending}
            onClick={() => create.mutate({ name: newName.trim() })}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            Créer
          </button>
        </div>""",
"""        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouveau groupe"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={!newName.trim() || create.isPending}
              onClick={() =>
                create.mutate({
                  name: newName.trim(),
                  isCollaborative: newCollab,
                })
              }
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Créer
            </button>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={newCollab}
              onChange={(e) => setNewCollab(e.target.checked)}
            />
            Espace collaboratif (dossier dédié + droits éditeur/lecteur)
          </label>
        </div>""",
"bloc création")

# 4) badge collab dans la liste
s = sub(
"""                  <span>{g.name}</span>
                  <span className="text-xs text-gray-400">{g.memberCount}</span>""",
"""                  <span className="flex items-center gap-2">
                    {g.name}
                    {g.isCollaborative ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        collab
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-gray-400">{g.memberCount}</span>""",
"badge liste")

# 5) type de prop GroupDetail : + isCollaborative
s = sub(
"""  group: { id: string; name: string; description: string | null };
  onDeleted: () => void;""",
"""  group: {
    id: string;
    name: string;
    description: string | null;
    isCollaborative: boolean;
  };
  onDeleted: () => void;""",
"prop GroupDetail")

# 6) mutations setCollab + setAccess
s = sub(
"""  const rename = trpc.memberGroup.update.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });""",
"""  const rename = trpc.memberGroup.update.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });
  const setCollab = trpc.memberGroup.update.useMutation({
    onSuccess: () => void utils.memberGroup.list.invalidate(),
  });
  const setAccess = trpc.memberGroup.setMemberAccess.useMutation({
    onSuccess: invalidate,
  });""",
"mutations setCollab/setAccess")

# 7) toggle collaboratif sur le groupe (après l'entête)
s = sub(
"""          Supprimer
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">""",
"""          Supprimer
        </button>
      </div>

      <label className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={group.isCollaborative}
          disabled={setCollab.isPending}
          onChange={() =>
            setCollab.mutate({
              id: group.id,
              name: group.name,
              isCollaborative: !group.isCollaborative,
            })
          }
        />
        Espace collaboratif (dossier dédié + droits éditeur/lecteur)
      </label>

      <div className="grid gap-6 sm:grid-cols-2">""",
"toggle collaboratif groupe")

# 8) bascule éditeur/lecteur par membre
s = sub(
"""                  <span>{m.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      removeMember.mutate({ groupId: group.id, userId: m.id })
                    }
                    className="text-xs text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
                </li>""",
"""                  <span>{m.name}</span>
                  <span className="flex items-center gap-2">
                    {group.isCollaborative ? (
                      <button
                        type="button"
                        onClick={() =>
                          setAccess.mutate({
                            groupId: group.id,
                            userId: m.id,
                            access: m.access === "EDITOR" ? "VIEWER" : "EDITOR",
                          })
                        }
                        className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100"
                        title="Basculer éditeur / lecteur"
                      >
                        {m.access === "EDITOR" ? "éditeur" : "lecteur"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        removeMember.mutate({ groupId: group.id, userId: m.id })
                      }
                      className="text-xs text-red-600 hover:underline"
                    >
                      Retirer
                    </button>
                  </span>
                </li>""",
"bascule access membre")

p.write_text(s, encoding="utf-8")
print("page groups patchée (collaboratif + access)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification"; exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(groups): UI dashboard — toggle collaboratif + bascule éditeur/lecteur par membre" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  Front livré NON testé — à valider à l'écran (pnpm dev, hard refresh)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi