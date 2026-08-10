#!/usr/bin/env bash
#
# AKFC — Documents membres : badge + tooltip sur l'item « Documents ».
#
#   - composant `DocumentsNavLink` : badge rouge (non-lus généraux + persos) +
#     tooltip sombre au survol (desktop) détaillant généraux / persos avec liens,
#     au niveau de finition de la cloche ; alimenté par `unreadBreakdownForMe` ;
#   - branché dans le Header sur les DEUX rendus de l'entrée /documents (barre
#     horizontale avec tooltip ; burger avec badge seul, pas de survol) ;
#   - invalidations `unreadBreakdownForMe` ajoutées dans `DocumentReaderPanel`
#     (lu/non-lu) et `PublishToMembersDialog` (publier/retirer) pour que le
#     badge se rafraîchisse.
#
# Nécessite les increments précédents + le revert cloche (unreadBreakdownForMe).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-member-documents-nav-badge.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-member-documents-nav-badge.sh
#
set -euo pipefail

CMP="apps/web/src/features/member-documents/DocumentsNavLink.tsx"
HEADER="apps/web/src/features/app-shell/Header.tsx"
PANEL="apps/web/src/features/member-documents/DocumentReaderPanel.tsx"
DIALOG="apps/web/src/features/member-documents/PublishToMembersDialog.tsx"

if [ ! -f "package.json" ] || [ ! -f "$HEADER" ]; then
  echo "ERREUR: lance depuis la racine du repo AKFC ($HEADER attendu)." >&2
  exit 1
fi

# ── 1) Composant ────────────────────────────────────────────────────────────
if [ -f "$CMP" ]; then echo "DocumentsNavLink déjà présent"; else
cat > "$CMP" <<'CMP_EOF'
"use client";

import Link from "next/link";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Entrée de navbar « Documents » avec badge de non-lus (généraux + persos) et,
 * sur desktop, un tooltip détaillé au survol (au niveau de la cloche). Le
 * burger passe `withTooltip={false}` : pas de survol sur tactile, juste le badge.
 */
export function DocumentsNavLink({
  href,
  label,
  className,
  withTooltip = true,
}: {
  href: string;
  label: string;
  className?: string;
  withTooltip?: boolean;
}) {
  const user = useSessionStore((s) => s.session?.user);
  const { data } = trpc.memberDocument.unreadBreakdownForMe.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const general = data?.general ?? 0;
  const perso = data?.perso ?? 0;
  const total = general + perso;

  return (
    <span
      className={
        withTooltip
          ? "group relative inline-flex items-center"
          : "relative flex items-center"
      }
    >
      <Link href={href} className={className}>
        {label}
      </Link>
      {total > 0 && (
        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {total}
        </span>
      )}
      {withTooltip && total > 0 && (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-60 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-left text-xs text-white shadow-lg group-hover:pointer-events-auto group-hover:block"
        >
          {general > 0 && (
            <Link href="/documents" className="block hover:underline">
              {general} document{general > 1 ? "s" : ""} du club à lire
            </Link>
          )}
          {perso > 0 && (
            <Link
              href="/documents"
              className={
                general > 0
                  ? "mt-1.5 block border-t border-white/15 pt-1.5 hover:underline"
                  : "block hover:underline"
              }
            >
              {perso} document{perso > 1 ? "s" : ""} personnel
              {perso > 1 ? "s" : ""} à lire
            </Link>
          )}
        </div>
      )}
    </span>
  );
}
CMP_EOF
echo "DocumentsNavLink créé"
fi

# ── 2) Header : brancher sur les 2 rendus ───────────────────────────────────
python3 - "$HEADER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "DocumentsNavLink" in s:
    print("Header déjà branché"); sys.exit(0)

IMP_OLD = '''  type NavEntry,
} from "@features/app-shell/navEntries";'''
IMP_NEW = '''  type NavEntry,
} from "@features/app-shell/navEntries";
import { DocumentsNavLink } from "@features/member-documents/DocumentsNavLink";'''
assert s.count(IMP_OLD) == 1, "ancre import Header introuvable"
s = s.replace(IMP_OLD, IMP_NEW)

BAR_OLD = '''          if (entry.kind === "link") {
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={`${NAV_GLOW} whitespace-nowrap text-[17px] 2xl:text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`}
              >
                {entry.label}
              </Link>
            );
          }'''
BAR_NEW = '''          if (entry.kind === "link") {
            const linkClass = `${NAV_GLOW} whitespace-nowrap text-[17px] 2xl:text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`;
            if (entry.href === "/documents") {
              return (
                <DocumentsNavLink
                  key={entry.href}
                  href={entry.href}
                  label={entry.label}
                  className={linkClass}
                />
              );
            }
            return (
              <Link key={entry.href} href={entry.href} className={linkClass}>
                {entry.label}
              </Link>
            );
          }'''
assert s.count(BAR_OLD) == 1, "ancre barre Header introuvable"
s = s.replace(BAR_OLD, BAR_NEW)

BURGER_OLD = '''                if (entry.kind === "link") {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className={`block py-3 text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`}
                    >
                      {entry.label}
                    </Link>
                  );
                }'''
BURGER_NEW = '''                if (entry.kind === "link") {
                  const linkClass = `block py-3 text-lg text-white ${isActive(entry) ? NAV_ACTIVE : ""}`;
                  if (entry.href === "/documents") {
                    return (
                      <DocumentsNavLink
                        key={entry.href}
                        href={entry.href}
                        label={entry.label}
                        className={linkClass}
                        withTooltip={false}
                      />
                    );
                  }
                  return (
                    <Link key={entry.href} href={entry.href} className={linkClass}>
                      {entry.label}
                    </Link>
                  );
                }'''
assert s.count(BURGER_OLD) == 1, "ancre burger Header introuvable"
s = s.replace(BURGER_OLD, BURGER_NEW)

p.write_text(s, encoding="utf-8")
print("Header branché (barre + burger)")
PY

# ── 3) Invalidations ────────────────────────────────────────────────────────
python3 - "$PANEL" "$DIALOG" <<'PY'
import sys, pathlib
for path in sys.argv[1:]:
    p = pathlib.Path(path)
    if not p.exists():
        continue
    s = p.read_text(encoding="utf-8")
    if "unreadBreakdownForMe" in s:
        print(f"{p.name} : invalidation déjà présente"); continue
    OLD = '''    void utils.memberDocument.unreadCountForMe.invalidate();
  };'''
    NEW = '''    void utils.memberDocument.unreadCountForMe.invalidate();
    void utils.memberDocument.unreadBreakdownForMe.invalidate();
  };'''
    assert s.count(OLD) == 1, f"{p.name} : ancre invalidate introuvable"
    p.write_text(s.replace(OLD, NEW), encoding="utf-8")
    print(f"{p.name} : invalidation unreadBreakdownForMe ajoutée")
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
if git commit -m "feat(documents): badge + tooltip non-lus (généraux/persos) sur l'item navbar Documents" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi