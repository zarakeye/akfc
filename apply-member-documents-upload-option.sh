#!/usr/bin/env bash
#
# AKFC — Documents membres : option de mise à disposition dans le formulaire
# d'upload (couvre aussi le drag-and-drop, la zone du formulaire EST un DnD).
#
#   - section admin « Rendre les PDF disponibles aux membres après l'envoi »
#     (visible seulement si admin ET ≥1 PDF dans le lot) : audience + destinataires ;
#   - dans `onSubmit`, après les uploads R2 réussis, `publish({ path, audience,
#     recipientUserIds })` pour chaque PDF déposé (le path R2 est déjà connu du
#     front via l'outcome). Erreurs de publication non bloquantes (ex. déjà à
#     disposition).
#
# Aucun changement backend. Nécessite les increments 1, 2, 6a appliqués.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-upload-option.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-upload-option.sh
#
set -euo pipefail

SVC="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "publishToMembers" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) État + query + mutation ──────────────────────────────────────────────
S1_OLD = "  const [isSubmitting, setIsSubmitting] = useState(false);"
S1_NEW = r'''  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mise à disposition des PDF aux membres (admin) au moment de l'envoi.
  const isAdmin = user?.role?.name === 'ADMIN';
  const hasPdf = items.some((it) => it.file.type === 'application/pdf');
  const [publishToMembers, setPublishToMembers] = useState(false);
  const [publishAudience, setPublishAudience] = useState<
    'ALL_MEMBERS' | 'SPECIFIC'
  >('ALL_MEMBERS');
  const [publishRecipientIds, setPublishRecipientIds] = useState<string[]>([]);
  const publishMembersMutation = trpc.memberDocument.publish.useMutation();
  const membersQuery = trpc.memberDocument.listMembers.useQuery(undefined, {
    enabled: isAdmin && publishToMembers && publishAudience === 'SPECIFIC',
  });'''
assert s.count(S1_OLD) == 1, "ancre state introuvable — abandon"
s = s.replace(S1_OLD, S1_NEW)

# ── 2) onSubmit : publier les PDF déposés ───────────────────────────────────
S2_OLD = r'''        void utils.storage.getAttentionCounts.invalidate();
      }
      if (skippedSet.size > 0) {'''
S2_NEW = r'''        void utils.storage.getAttentionCounts.invalidate();
      }

      // Mise à disposition des PDF déposés (option admin). Le path R2 est déjà
      // connu du front (outcome). Erreurs non bloquantes (ex. déjà publié).
      if (isAdmin && publishToMembers) {
        const pdfPaths = r2Outcomes
          .filter((o): o is R2UploadOutcome & { ok: true } => o.ok)
          .filter(
            (o) =>
              items.find((it) => it.id === o.itemId)?.file.type ===
              'application/pdf',
          )
          .map((o) => o.path);
        let published = 0;
        for (const path of pdfPaths) {
          try {
            await publishMembersMutation.mutateAsync({
              path,
              audience: publishAudience,
              recipientUserIds:
                publishAudience === 'SPECIFIC' ? publishRecipientIds : undefined,
            });
            published += 1;
          } catch {
            // non bloquant
          }
        }
        if (published > 0) {
          void utils.memberDocument.listAdmin.invalidate();
          void utils.memberDocument.unreadCountForMe.invalidate();
        }
      }

      if (skippedSet.size > 0) {'''
assert s.count(S2_OLD) == 1, "ancre onSubmit introuvable — abandon"
s = s.replace(S2_OLD, S2_NEW)

# ── 3) Section admin dans le rendu (avant le bouton Envoyer) ────────────────
S3_OLD = r'''      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed w-full mt-4"
      >'''
S3_NEW = r'''      {isAdmin && hasPdf && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={publishToMembers}
              onChange={(e) => setPublishToMembers(e.target.checked)}
              className="accent-emerald-600"
            />
            Rendre les PDF disponibles aux membres après l'envoi
          </label>
          {publishToMembers && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="pubAudience"
                  checked={publishAudience === 'ALL_MEMBERS'}
                  onChange={() => setPublishAudience('ALL_MEMBERS')}
                  className="accent-emerald-600"
                />
                Tous les membres
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="pubAudience"
                  checked={publishAudience === 'SPECIFIC'}
                  onChange={() => setPublishAudience('SPECIFIC')}
                  className="accent-emerald-600"
                />
                Des membres précis
              </label>
              {publishAudience === 'SPECIFIC' && (
                <div className="max-h-40 space-y-1 overflow-auto rounded border border-gray-200 bg-white p-2">
                  {(membersQuery.data ?? []).map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={publishRecipientIds.includes(m.id)}
                        onChange={() =>
                          setPublishRecipientIds((ids) =>
                            ids.includes(m.id)
                              ? ids.filter((x) => x !== m.id)
                              : [...ids, m.id],
                          )
                        }
                        className="accent-emerald-600"
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed w-full mt-4"
      >'''
assert s.count(S3_OLD) == 1, "ancre bouton submit introuvable — abandon"
s = s.replace(S3_OLD, S3_NEW)

p.write_text(s, encoding="utf-8")
print("DragNDropForm : option de mise à disposition intégrée")
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
if git commit -m "feat(documents): option « rendre disponible aux membres » dans le formulaire d'upload (PDF)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi