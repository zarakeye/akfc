#!/usr/bin/env bash
#
# AKFC — Groupes, increment 4/N : le dialogue de publication cible les groupes.
#
# `PublishToMembersDialog` : en mode ciblé (SPECIFIC), sélecteur de GROUPES
# (cases à cocher, via `memberGroup.list`) au-dessus des membres ad hoc — les
# deux ensemble. Validation « ≥1 groupe ou membre ». `groupIds` passé à
# `publish` (que le backend accepte déjà, cf. 2b-1).
#
# Nécessite les increments 2a + 2b-1 groupes appliqués.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-groups-publish-dialog.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-groups-publish-dialog.sh
#
set -euo pipefail

DLG="apps/web/src/features/member-documents/PublishToMembersDialog.tsx"

if [ ! -f "package.json" ] || [ ! -f "$DLG" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($DLG attendu)." >&2
  exit 1
fi

python3 - "$DLG" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "groupIds" in s:
    print("déjà appliqué — rien à faire"); sys.exit(0)

# A) état groupIds
A_OLD = '  const [recipientIds, setRecipientIds] = useState<string[]>([]);'
A_NEW = ('  const [recipientIds, setRecipientIds] = useState<string[]>([]);\n'
         '  const [groupIds, setGroupIds] = useState<string[]>([]);')
assert s.count(A_OLD) == 1, "ancre state introuvable"
s = s.replace(A_OLD, A_NEW)

# B) groupsQuery
B_OLD = '''  const membersQuery = trpc.memberDocument.listMembers.useQuery(undefined, {
    enabled: !publication && audience === "SPECIFIC",
  });'''
B_NEW = B_OLD + '''
  const groupsQuery = trpc.memberGroup.list.useQuery(undefined, {
    enabled: !publication && audience === "SPECIFIC",
  });'''
assert s.count(B_OLD) == 1, "ancre membersQuery introuvable"
s = s.replace(B_OLD, B_NEW)

# C) toggleGroup
C_OLD = '''  const toggleRecipient = (id: string) =>
    setRecipientIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );'''
C_NEW = C_OLD + '''

  const toggleGroup = (id: string) =>
    setGroupIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );'''
assert s.count(C_OLD) == 1, "ancre toggleRecipient introuvable"
s = s.replace(C_OLD, C_NEW)

# D) validation + mutate
D_OLD = '''    if (audience === "SPECIFIC" && recipientIds.length === 0) {
      setError("Choisissez au moins un destinataire.");
      return;
    }
    publish.mutate({
      path,
      title: title.trim() || undefined,
      audience,
      recipientUserIds: audience === "SPECIFIC" ? recipientIds : undefined,
    });'''
D_NEW = '''    if (
      audience === "SPECIFIC" &&
      recipientIds.length === 0 &&
      groupIds.length === 0
    ) {
      setError("Choisissez au moins un groupe ou un membre.");
      return;
    }
    publish.mutate({
      path,
      title: title.trim() || undefined,
      audience,
      recipientUserIds: audience === "SPECIFIC" ? recipientIds : undefined,
      groupIds: audience === "SPECIFIC" ? groupIds : undefined,
    });'''
assert s.count(D_OLD) == 1, "ancre submit introuvable"
s = s.replace(D_OLD, D_NEW)

# E) rendu : bloc SPECIFIC avec groupes + membres
E_OLD = '''              {audience === "SPECIFIC" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Destinataires
                  </p>
                  <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-gray-200 p-2">
                    {membersQuery.isLoading ? (
                      <p className="px-1 py-2 text-sm text-gray-500">Chargement…</p>
                    ) : (membersQuery.data ?? []).length === 0 ? (
                      <p className="px-1 py-2 text-sm text-gray-500">
                        Aucun membre.
                      </p>
                    ) : (
                      (membersQuery.data ?? []).map((m) => (
                        <label
                          key={m.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={recipientIds.includes(m.id)}
                            onChange={() => toggleRecipient(m.id)}
                            className="accent-emerald-600"
                          />
                          {m.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}'''
E_NEW = '''              {audience === "SPECIFIC" && (
                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Groupes
                    </p>
                    <div className="max-h-40 space-y-1 overflow-auto rounded-lg border border-gray-200 p-2">
                      {groupsQuery.isLoading ? (
                        <p className="px-1 py-2 text-sm text-gray-500">
                          Chargement…
                        </p>
                      ) : (groupsQuery.data ?? []).length === 0 ? (
                        <p className="px-1 py-2 text-sm text-gray-500">
                          Aucun groupe.
                        </p>
                      ) : (
                        (groupsQuery.data ?? []).map((g) => (
                          <label
                            key={g.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={groupIds.includes(g.id)}
                              onChange={() => toggleGroup(g.id)}
                              className="accent-emerald-600"
                            />
                            {g.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Membres
                    </p>
                    <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-gray-200 p-2">
                      {membersQuery.isLoading ? (
                        <p className="px-1 py-2 text-sm text-gray-500">
                          Chargement…
                        </p>
                      ) : (membersQuery.data ?? []).length === 0 ? (
                        <p className="px-1 py-2 text-sm text-gray-500">
                          Aucun membre.
                        </p>
                      ) : (
                        (membersQuery.data ?? []).map((m) => (
                          <label
                            key={m.id}
                            className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={recipientIds.includes(m.id)}
                              onChange={() => toggleRecipient(m.id)}
                              className="accent-emerald-600"
                            />
                            {m.name}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}'''
assert s.count(E_OLD) == 1, "ancre bloc SPECIFIC introuvable"
s = s.replace(E_OLD, E_NEW)

p.write_text(s, encoding="utf-8")
print("dialogue : sélecteur de groupes ajouté (groupes + membres)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi

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
if git commit -m "feat(groups): dialogue de publication cible groupes + membres" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi