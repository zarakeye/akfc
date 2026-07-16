#!/usr/bin/env bash
###############################################################################
# G — Cloche : détail « perso en attente » + « général en attente »
#
#   1. getAttentionCounts (router) : + generalPending + persoPending (courant).
#   2. NotificationBell.tsx : deux lignes de détail dans le tooltip
#      (singulier/pluriel géré).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

ROUTER="packages/backend/src/modules/storage/router.ts"
BELL="apps/web/src/features/app-shell/NotificationBell.tsx"

if ! grep -q "import.*countPersoImages" "$ROUTER" 2>/dev/null; then
  echo "ERREUR: 1b absent (countPersoImages). Applique la chaîne d'abord."; exit 1
fi
if grep -q "persoPending" "$ROUTER" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. getAttentionCounts : + generalPending + persoPending                     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/storage/router.ts"
s = open(p, encoding="utf-8").read()
a = '''  getAttentionCounts: protectedProcedure.query(async ({ ctx }) => {
    const [pending, bin] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
    ]);
    return { pending, bin };
  }),'''
b = '''  getAttentionCounts: protectedProcedure.query(async ({ ctx }) => {
    const [pending, bin, generalPending, persoCounts] = await Promise.all([
      ctx.prisma.mediaAsset.count({ where: { status: "pending" } }),
      ctx.prisma.trashEntry.count({ where: { status: "IN_BIN" } }),
      ctx.prisma.mediaAsset.count({
        where: {
          status: "pending",
          appRoot: ctx.appRoot,
          fullPath: { contains: "/general/" },
        },
      }),
      countPersoImages({
        prisma: ctx.prisma,
        appRoot: ctx.appRoot,
        userId: ctx.user.id,
      }),
    ]);
    return {
      pending,
      bin,
      generalPending,
      persoPending: persoCounts.pending,
    };
  }),'''
assert s.count(a) == 1, f"[1] getAttentionCounts : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] router.ts : getAttentionCounts + perso/general pending OK")
PY

# --------------------------------------------------------------------------- #
# 2. NotificationBell : helpers + lignes tooltip                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/app-shell/NotificationBell.tsx"
s = open(p, encoding="utf-8").read()

# 2a. helpers après buildMessage
a = '''  if (pending > 0)
    return `Vous avez ${pending} contenu${s(pending)} en attente`;
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}'''
b = '''  if (pending > 0)
    return `Vous avez ${pending} contenu${s(pending)} en attente`;
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}

function persoPendingMessage(n: number): string {
  const s = n > 1 ? "s" : "";
  return `Vous avez ${n} contenu${s} personnel${s} en attente`;
}

function generalPendingMessage(n: number): string {
  const s = n > 1 ? "s" : "";
  return `Il y a ${n} contenu${s} en attente dans le dossier « général »`;
}'''
assert s.count(a) == 1, f"[2a] helpers : {s.count(a)} match(es)."
s = s.replace(a, b)

# 2b. tooltip multi-lignes
a = '''        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-max max-w-64 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          {buildMessage(counts!.pending, counts!.bin)}
        </div>'''
b = '''        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-max max-w-64 space-y-1 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          <p>{buildMessage(counts!.pending, counts!.bin)}</p>
          {counts!.persoPending > 0 && (
            <p>{persoPendingMessage(counts!.persoPending)}</p>
          )}
          {counts!.generalPending > 0 && (
            <p>{generalPendingMessage(counts!.generalPending)}</p>
          )}
        </div>'''
assert s.count(a) == 1, f"[2b] tooltip : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [2] NotificationBell.tsx : lignes perso/general OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== prisma generate =="
pnpm prisma generate
echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(notifications): detail perso + general pending counts in bell tooltip"
echo "OK — commité. (rm -rf apps/web/.next si HMR récalcitrant)"