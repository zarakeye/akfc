#!/usr/bin/env bash
###############################################################################
# G — Cloche : consolider le « en attente » en UNE ligne
#
# Au lieu de 3 lignes redondantes, une seule :
#   « Vous avez D contenus en attente dont A personnels et B dans le dossier
#     « général » [et N dans la corbeille] »
# Les clauses « dont … » n'apparaissent que si A/B > 0. Le reste (disciplines)
# n'est pas détaillé.
#
# Front uniquement (le backend renvoie déjà persoPending/generalPending).
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

BELL="apps/web/src/features/app-shell/NotificationBell.tsx"
test -f "$BELL" || { echo "ERREUR: $BELL introuvable."; exit 1; }

if ! grep -q "function persoPendingMessage" "$BELL" 2>/dev/null; then
  if grep -q "breakdown.push" "$BELL" 2>/dev/null; then
    echo "Déjà consolidé. Rien à faire."; exit 0
  fi
  echo "ERREUR: applique d'abord stepG_bell_perso_general.sh."; exit 1
fi

python3 - << 'PY'
p = "apps/web/src/features/app-shell/NotificationBell.tsx"
s = open(p, encoding="utf-8").read()

# 1. buildMessage consolidé (+ suppression des 2 helpers)
a = '''function buildMessage(pending: number, bin: number): string {
  const s = (n: number) => (n > 1 ? "s" : "");
  if (pending > 0 && bin > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente et ${bin} dans la corbeille`;
  }
  if (pending > 0)
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
b = '''function buildMessage(
  pending: number,
  bin: number,
  persoPending: number,
  generalPending: number,
): string {
  const s = (n: number) => (n > 1 ? "s" : "");

  // Ventilation du « en attente » : personnels et/ou dossier « général ».
  // Le reste (disciplines) n'est volontairement pas détaillé.
  const breakdown: string[] = [];
  if (persoPending > 0) {
    breakdown.push(`${persoPending} personnel${s(persoPending)}`);
  }
  if (generalPending > 0) {
    breakdown.push(`${generalPending} dans le dossier « général »`);
  }
  const dont = breakdown.length > 0 ? ` dont ${breakdown.join(" et ")}` : "";

  if (pending > 0 && bin > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente${dont} et ${bin} dans la corbeille`;
  }
  if (pending > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente${dont}`;
  }
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}'''
assert s.count(a) == 1, f"[1] buildMessage+helpers : {s.count(a)} match(es)."
s = s.replace(a, b)

# 2. aria-label : passer les 4 args
a = '''            ? buildMessage(counts!.pending, counts!.bin)
            : "Bibliothèque"'''
b = '''            ? buildMessage(
                counts!.pending,
                counts!.bin,
                counts!.persoPending,
                counts!.generalPending,
              )
            : "Bibliothèque"'''
assert s.count(a) == 1, f"[2] aria-label : {s.count(a)} match(es)."
s = s.replace(a, b)

# 3. tooltip : une seule ligne consolidée
a = '''        <div
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
b = '''        <div
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-max max-w-64 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg group-hover:block"
        >
          {buildMessage(
            counts!.pending,
            counts!.bin,
            counts!.persoPending,
            counts!.generalPending,
          )}
        </div>'''
assert s.count(a) == 1, f"[3] tooltip : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  NotificationBell.tsx : message consolidé OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck web =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "refactor(notifications): consolidate pending message into one line with breakdown"
echo "OK — commité. (arrête le serveur + rm -rf apps/web/.next si HMR récalcitrant)"