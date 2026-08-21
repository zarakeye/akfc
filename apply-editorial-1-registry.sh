#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R1 : réduire le registre.
#
# Suite à la remise à plat : seules les pages à CONTENU PROPRE (non dynamiques,
# non consommatrices d'un autre éditeur) sont gérées ici — Accueil, L'association
# (rendue sur /about), Contacts (/contacts). Les pages consommatrices
# (disciplines, stages, events, agenda, galerie…) ont leur propre publication et
# sortent du périmètre → elles ne sont plus gatées par le middleware.
#
# Réécrit `apps/web/src/config/pageRegistry.ts` (PAGE_REGISTRY = 3 entrées).
# pageKeyForPath / ALL_PAGE_KEYS inchangés dans leur logique.
# Testable. Pas de migration.
# Usage : bash apply-editorial-1-registry.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-1-registry.sh   (clone)
#
set -euo pipefail

REG="apps/web/src/config/pageRegistry.ts"

if [ ! -f "package.json" ] || [ ! -f "$REG" ]; then
  echo "ERREUR: lance depuis la racine ($REG attendu — brique 2 appliquée ?)." >&2
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

cat > "$REG" <<'TS'
/**
 * Registre des PAGES ÉDITORIALES — pages au contenu PROPRE (non dynamiques, non
 * alimentées par un autre éditeur), avec un état publié/brouillon. Les pages
 * « consommatrices » (disciplines, stages, events, agenda, galerie…) affichent
 * du contenu à publication propre et NE figurent PAS ici : elles ne sont pas
 * gatées.
 *
 * `key` = clé stockée dans `PageVisibility` ; `path` = route PUBLIQUE (préfixe
 * couvrant les sous-routes). Source unique partagée middleware + centre de
 * contrôle « Pages éditoriales ».
 */
export type PageRegistryEntry = {
  key: string;
  label: string;
  path: string;
};

export const PAGE_REGISTRY: readonly PageRegistryEntry[] = [
  { key: "home", label: "Accueil", path: "/" },
  { key: "association", label: "L'association", path: "/about" },
  { key: "contacts", label: "Contacts", path: "/contacts" },
] as const;

/**
 * Résout un chemin de requête vers la clé de page éditoriale, ou `null` si la
 * route n'est pas éditoriale (donc jamais gatée). Accueil = match exact ; autres
 * = match exact OU préfixe (sous-routes incluses).
 */
export function pageKeyForPath(pathname: string): string | null {
  for (const entry of PAGE_REGISTRY) {
    if (entry.path === "/") {
      if (pathname === "/") return entry.key;
      continue;
    }
    if (pathname === entry.path || pathname.startsWith(entry.path + "/")) {
      return entry.key;
    }
  }
  return null;
}

/** Toutes les clés du registre (utile pour un traitement en masse). */
export const ALL_PAGE_KEYS: readonly string[] = PAGE_REGISTRY.map((e) => e.key);
TS
echo "registre réduit aux pages éditoriales : $REG"

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
if git commit -m "refactor(pages): registre réduit aux pages éditoriales (home/about/contacts)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  Les pages consommatrices ne sont plus gatées ; seules Accueil/Association/Contacts le sont."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi