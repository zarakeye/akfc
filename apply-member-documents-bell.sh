#!/usr/bin/env bash
#
# AKFC — Documents membres, increment 5/6 : étendre la cloche.
#
# `NotificationBell` gère désormais aussi les membres :
#   - query `memberDocument.unreadCountForMe` pour tout utilisateur connecté ;
#   - total badge = bibliothèque (managers) + documents non lus ;
#   - lien principal → /dashboard/library (manager) ou /documents (membre) ;
#   - ligne « N documents à lire » dans le tooltip (→ /documents) ;
#   - un membre simple sans document ne voit pas la cloche ; un manager la
#     garde toujours (muette si rien). Un admin, étant membre, cumule.
#
# Nécessite les increments 1+2 appliqués (router memberDocument).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-bell.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-bell.sh
#
set -euo pipefail

SVC="apps/web/src/features/app-shell/NotificationBell.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "unreadCountForMe" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── Sub 1 : query docs + total + gates + valeurs dérivées ───────────────────
S1_OLD = r'''  if (!canSee) return null;

  const total = (counts?.pending ?? 0) + (counts?.bin ?? 0);'''
S1_NEW = r'''  const { data: unreadDocs = 0 } =
    trpc.memberDocument.unreadCountForMe.useQuery(undefined, {
      enabled: Boolean(user),
    });

  const libraryTotal = (counts?.pending ?? 0) + (counts?.bin ?? 0);
  const total = libraryTotal + unreadDocs;

  // Manager : cloche toujours là (muette si rien à traiter). Membre simple :
  // elle n'apparaît que s'il a des documents à lire.
  if (!user) return null;
  if (!canSee && total === 0) return null;

  const href = canSee ? "/dashboard/library" : "/documents";
  const docsLabel =
    unreadDocs > 0
      ? `${unreadDocs} document${unreadDocs > 1 ? "s" : ""} à lire`
      : "";
  const libLabel =
    canSee && libraryTotal > 0
      ? buildMessage(
          counts!.pending,
          counts!.bin,
          counts!.persoPending,
          counts!.generalPending,
        )
      : "";
  const ariaLabel =
    [libLabel, docsLabel].filter(Boolean).join(" · ") ||
    (canSee ? "Bibliothèque" : "Mes documents");'''
assert s.count(S1_OLD) == 1, "ancre Sub1 introuvable/multiple — abandon"
s = s.replace(S1_OLD, S1_NEW)

# ── Sub 2 : lien principal (href + aria-label) ──────────────────────────────
S2_OLD = r'''      <Link
        href="/dashboard/library"
        aria-label={
          total > 0
            ? buildMessage(
                counts!.pending,
                counts!.bin,
                counts!.persoPending,
                counts!.generalPending,
              )
            : "Bibliothèque"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >'''
S2_NEW = r'''      <Link
        href={href}
        aria-label={ariaLabel}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      >'''
assert s.count(S2_OLD) == 1, "ancre Sub2 introuvable/multiple — abandon"
s = s.replace(S2_OLD, S2_NEW)

# ── Sub 3a : garde du bloc « en attente » du tooltip ────────────────────────
S3A_OLD = r'''            {counts!.pending > 0 && ('''
S3A_NEW = r'''            {canSee && counts && counts.pending > 0 && ('''
assert s.count(S3A_OLD) == 1, "ancre Sub3a introuvable/multiple — abandon"
s = s.replace(S3A_OLD, S3A_NEW)

# ── Sub 3b : bloc corbeille gardé + ligne documents ─────────────────────────
S3B_OLD = r'''            {counts!.bin > 0 && (
              <p className={counts!.pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>
                {counts!.bin} contenu{counts!.bin > 1 ? 's' : ''} dans la
                corbeille
              </p>
            )}
          </div>'''
S3B_NEW = r'''            {canSee && counts && counts.bin > 0 && (
              <p className={counts.pending > 0 ? 'mt-1.5 border-t border-white/15 pt-1.5' : ''}>
                {counts.bin} contenu{counts.bin > 1 ? 's' : ''} dans la
                corbeille
              </p>
            )}
            {unreadDocs > 0 && (
              <Link
                href="/documents"
                className={
                  canSee && counts && (counts.pending > 0 || counts.bin > 0)
                    ? 'mt-1.5 block border-t border-white/15 pt-1.5 hover:underline'
                    : 'block hover:underline'
                }
              >
                {unreadDocs} document{unreadDocs > 1 ? 's' : ''} à lire
              </Link>
            )}
          </div>'''
assert s.count(S3B_OLD) == 1, "ancre Sub3b introuvable/multiple — abandon"
s = s.replace(S3B_OLD, S3B_NEW)

p.write_text(s, encoding="utf-8")
print("NotificationBell étendu (documents membres)")
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
if git commit -m "feat(documents): étendre la cloche aux membres (compteur documents non lus)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi