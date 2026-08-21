#!/usr/bin/env bash
#
# AKFC — Chantier « En construction », BRIQUE 2 : registre des pages.
#
# Config front partagée (middleware d'enforcement + centre de contrôle) :
#   - PAGE_REGISTRY : les pages publiques toggables { key, label, path }.
#   - pageKeyForPath(pathname) : résout une URL → clé de page (ou null si la
#     route n'est pas toggable → non gatée). Match exact pour l'accueil, préfixe
#     pour les sections (couvre leurs sous-routes, ex. /disciplines/<slug>).
#
# Pages VITRINE incluses ; `profil` et `documents` (fonctionnelles) exclues.
# Nouveau fichier. Testable (typecheck). Pas de migration.
# Usage : bash apply-construction-2-registry.sh
#         AKFC_APPLY_ONLY=1 bash apply-construction-2-registry.sh   (clone)
#
set -euo pipefail

REG="apps/web/src/config/pageRegistry.ts"

if [ ! -f "package.json" ]; then
  echo "ERREUR: lance depuis la racine du repo." >&2
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

mkdir -p "$(dirname "$REG")"
cat > "$REG" <<'TS'
/**
 * Registre des pages publiques « toggables » (mode « En construction »).
 *
 * Source unique partagée par le middleware d'enforcement et le centre de
 * contrôle admin. `key` est la clé stockée dans `PageVisibility` ; `path` est la
 * route (préfixe qui couvre aussi les sous-routes de la section).
 *
 * Pages fonctionnelles (profil, documents, mes-espaces, dashboard) volontairement
 * absentes : elles ne sont pas du « contenu en construction ».
 */
export type PageRegistryEntry = {
  key: string;
  label: string;
  path: string;
};

export const PAGE_REGISTRY: readonly PageRegistryEntry[] = [
  { key: "home", label: "Accueil", path: "/" },
  { key: "about", label: "À propos", path: "/about" },
  { key: "agenda", label: "Agenda", path: "/agenda" },
  { key: "contacts", label: "Contacts", path: "/contacts" },
  { key: "course", label: "Cours", path: "/course" },
  { key: "disciplines", label: "Disciplines", path: "/disciplines" },
  { key: "events", label: "Événements", path: "/events" },
  { key: "gallery", label: "Galerie", path: "/gallery" },
  { key: "infos", label: "Infos", path: "/infos" },
  { key: "stages", label: "Stages", path: "/stages" },
] as const;

/**
 * Résout un chemin de requête vers la clé de page correspondante, ou `null` si
 * la route n'est pas toggable (donc jamais gatée). Accueil = match exact ;
 * sections = match exact OU préfixe (pour couvrir leurs sous-routes).
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

/** Toutes les clés du registre (utile pour le toggle global). */
export const ALL_PAGE_KEYS: readonly string[] = PAGE_REGISTRY.map((e) => e.key);
TS
echo "registre écrit : $REG"

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
if git commit -m "feat(pages): registre des pages publiques toggables + pageKeyForPath" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "ℹ️  Ajuste les labels / ajoute-retire des pages dans $REG au besoin."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi