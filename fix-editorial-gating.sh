#!/usr/bin/env bash
#
# AKFC — fix enforcement des pages éditoriales (home / about / contacts).
#
# Le middleware d'enforcement (brique 3) était en `middleware.ts` → IGNORÉ par
# Next 16 (qui n'utilise que `proxy.ts`, déjà pris par le préfiltre d'auth).
# Résultat : `/`, `/about`, `/contacts` en brouillon s'affichaient pour tous.
#
# FIX (aligné sur le pivot « pages éditoriales ») : gating DANS LE RENDU.
# Nouveau helper serveur `isEditorialPageGated(key)` (lit PageVisibility +
# session) + placeholder `UnderConstruction`. Chaque page, en tête :
#   if (await isEditorialPageGated("<key>")) return <UnderConstruction />;
# Clés : home→"home", about→"association", contacts→"contacts".
#
# Prérequis : brique 1 (PageVisibility) + R1 (registre). Front NON testé.
# Pas de migration.
# Usage : bash fix-editorial-gating.sh
#         AKFC_APPLY_ONLY=1 bash fix-editorial-gating.sh   (clone)
#
set -euo pipefail

GATE="apps/web/src/features/editorial/editorialGate.tsx"
HOME_P="apps/web/src/app/(public)/page.tsx"
ABOUT="apps/web/src/app/(public)/about/page.tsx"
CONTACTS="apps/web/src/app/(public)/contacts/page.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$HOME_P" "$ABOUT" "$CONTACTS"; do
  [ -f "$f" ] || { echo "ERREUR: page manquante: $f" >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: sur '$BRANCH'. Ce fix peut aller sur main directement (Ctrl-C pour annuler)."
    sleep 2
  fi
fi

# ── helper + placeholder ────────────────────────────────────────────────────
mkdir -p "$(dirname "$GATE")"
cat > "$GATE" <<'TSX'
import type { JSX } from "react";

import { prisma } from "@backend/prisma";
import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";

/**
 * Gating d'une page éditoriale (home / association / contacts).
 *
 * Renvoie `true` si la page doit être MASQUÉE au visiteur courant : non publiée
 * (PageVisibility.published != true) ET visiteur non-admin. Un ADMIN voit
 * toujours la vraie page (prévisualisation). Lu côté serveur (cookies), donc
 * la page devient dynamique — ce qui est voulu pour un rendu par visiteur.
 */
export async function isEditorialPageGated(key: string): Promise<boolean> {
  const vis = await prisma.pageVisibility.findUnique({ where: { key } });
  if (vis?.published === true) return false;

  const session = await getSessionFromRequest();
  const isAdmin = session?.user?.role?.name === "ADMIN";
  return !isAdmin;
}

/**
 * Placeholder « page en construction » — rendu à la place du contenu réel
 * quand la page est gatée. S'affiche dans le layout public (header + footer).
 */
export function UnderConstruction(): JSX.Element {
  return (
    <div className="akfc-page py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold">Page en construction</h1>
      <p className="akfc-measure-block mx-auto text-muted-foreground">
        Cette page n&apos;est pas encore disponible. Revenez bientôt !
      </p>
    </div>
  );
}
TSX
echo "helper écrit : $GATE"

# ── injection du gate dans chaque page ──────────────────────────────────────
python3 - "$HOME_P" "$ABOUT" "$CONTACTS" <<'PY'
import sys, pathlib

IMPORT = ('import {\n'
          '  isEditorialPageGated,\n'
          '  UnderConstruction,\n'
          '} from "@features/editorial/editorialGate";\n')
PRISMA_IMP = 'import { prisma } from "@backend/prisma";\n'

def patch(path, key, fn_anchor):
    p = pathlib.Path(path); s = p.read_text(encoding="utf-8")
    if "isEditorialPageGated" in s:
        print(f"déjà à jour: {path}"); return
    # import (après l'import prisma, présent dans les 3 pages)
    assert s.count(PRISMA_IMP) == 1, f"ancre import prisma introuvable: {path}"
    s = s.replace(PRISMA_IMP, PRISMA_IMP + IMPORT, 1)
    # gate en tête de la fonction
    assert s.count(fn_anchor) == 1, f"ancre fonction introuvable: {path}"
    gate = (fn_anchor +
            f'  if (await isEditorialPageGated("{key}")) {{\n'
            f'    return <UnderConstruction />;\n'
            f'  }}\n\n')
    s = s.replace(fn_anchor, gate)
    p.write_text(s, encoding="utf-8")
    print(f"patché ({key}): {path}")

home, about, contacts = sys.argv[1], sys.argv[2], sys.argv[3]
patch(home, "home",
      "export default async function HomePage(): Promise<JSX.Element> {\n")
patch(about, "association",
      "export default async function AboutPage(): Promise<JSX.Element> {\n")
patch(contacts, "contacts",
      "export default async function ContactsPage(): Promise<JSX.Element> {\n")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(pages): gater le rendu des pages éditoriales en brouillon (home/about/contacts)" && echo "commit $(git rev-parse --short HEAD)"
echo "→ après déploiement : une page éditoriale en brouillon montre « en construction » aux visiteurs ; l'admin voit la vraie page."