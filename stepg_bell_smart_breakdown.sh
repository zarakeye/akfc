#!/usr/bin/env bash
###############################################################################
# G — Cloche : libellé spécifique quand un SEUL type est en attente
#
#   - perso seul      → « Vous avez N contenus personnels en attente »
#   - général seul    → « Vous avez N contenus en attente dans le dossier « général » »
#   - disciplines seul → « Vous avez N contenus en attente »
#   - ≥ 2 types        → « … en attente dont A personnels et B dans le dossier « général » »
#
# Front uniquement. Remplace la version `typesCount` de buildMessage.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

BELL="apps/web/src/features/app-shell/NotificationBell.tsx"
test -f "$BELL" || { echo "ERREUR: $BELL introuvable."; exit 1; }

if ! grep -q "typesCount" "$BELL" 2>/dev/null; then
  echo "ERREUR: version 'typesCount' de buildMessage absente. Applique stepG_bell_smart_breakdown.sh d'abord."; exit 1
fi
if grep -q "let attente" "$BELL" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

python3 - << 'PY'
p = "apps/web/src/features/app-shell/NotificationBell.tsx"
s = open(p, encoding="utf-8").read()

a = '''function buildMessage(
  pending: number,
  bin: number,
  persoPending: number,
  generalPending: number,
): string {
  const s = (n: number) => (n > 1 ? "s" : "");

  // Types de contenus en attente : personnels / dossier « général » /
  // disciplines (le reste). La ventilation « dont … » n'apparaît que si AU
  // MOINS 2 types coexistent — avec un seul type, le total se suffit.
  // Le reste (disciplines) compte pour le seuil mais n'est pas nommé.
  const rest = Math.max(0, pending - persoPending - generalPending);
  const typesCount =
    (persoPending > 0 ? 1 : 0) +
    (generalPending > 0 ? 1 : 0) +
    (rest > 0 ? 1 : 0);

  let dont = "";
  if (typesCount >= 2) {
    const breakdown: string[] = [];
    if (persoPending > 0) {
      breakdown.push(`${persoPending} personnel${s(persoPending)}`);
    }
    if (generalPending > 0) {
      breakdown.push(`${generalPending} dans le dossier « général »`);
    }
    if (breakdown.length > 0) {
      dont = ` dont ${breakdown.join(" et ")}`;
    }
  }

  if (pending > 0 && bin > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente${dont} et ${bin} dans la corbeille`;
  }
  if (pending > 0) {
    return `Vous avez ${pending} contenu${s(pending)} en attente${dont}`;
  }
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}'''

b = '''function buildMessage(
  pending: number,
  bin: number,
  persoPending: number,
  generalPending: number,
): string {
  const s = (n: number) => (n > 1 ? "s" : "");

  // Types de contenus en attente : personnels / dossier « général » /
  // disciplines (le reste).
  const rest = Math.max(0, pending - persoPending - generalPending);
  const typesCount =
    (persoPending > 0 ? 1 : 0) +
    (generalPending > 0 ? 1 : 0) +
    (rest > 0 ? 1 : 0);

  // Partie « en attente » (sans « Vous avez » ni corbeille).
  let attente = "";
  if (pending > 0) {
    if (typesCount >= 2) {
      // ≥ 2 types : total + ventilation « dont … » (le reste non nommé).
      const breakdown: string[] = [];
      if (persoPending > 0) {
        breakdown.push(`${persoPending} personnel${s(persoPending)}`);
      }
      if (generalPending > 0) {
        breakdown.push(`${generalPending} dans le dossier « général »`);
      }
      const dont =
        breakdown.length > 0 ? ` dont ${breakdown.join(" et ")}` : "";
      attente = `${pending} contenu${s(pending)} en attente${dont}`;
    } else if (persoPending > 0) {
      // Uniquement du perso → libellé dédié.
      attente = `${persoPending} contenu${s(persoPending)} personnel${s(persoPending)} en attente`;
    } else if (generalPending > 0) {
      // Uniquement du général → libellé dédié.
      attente = `${generalPending} contenu${s(generalPending)} en attente dans le dossier « général »`;
    } else {
      // Uniquement des disciplines (non nommées).
      attente = `${pending} contenu${s(pending)} en attente`;
    }
  }

  if (attente && bin > 0) {
    return `Vous avez ${attente} et ${bin} dans la corbeille`;
  }
  if (attente) {
    return `Vous avez ${attente}`;
  }
  return `Vous avez ${bin} contenu${s(bin)} dans la corbeille`;
}'''

assert s.count(a) == 1, f"buildMessage : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  NotificationBell.tsx : libellé spécifique par type unique OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck web (serveur arrêté + .next vidé recommandé) =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "refactor(notifications): dedicated single-type pending message (perso/general)"
echo "OK — commité."