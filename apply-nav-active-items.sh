#!/usr/bin/env bash
# AKFC — Navigation : fin du gras hérité + mise en évidence de la page active + « Nos disciplines ».
#  - Cause du gras : NAV_ACTIVE (font-bold) posé sur le CONTENEUR du menu « Qui sommes-nous ? »,
#    qui englobe le déroulant → la graisse s'héritait aux deux items. L'état actif passe sur le LIBELLÉ.
#  - Items de sous-menu (Qui sommes-nous ? + Nos disciplines) : la page courante est mise en évidence
#    sans gras (fond émeraude + liseré en barre, texte émeraude en panneau) + aria-current="page".
#  - « Nos disciplines » : libellé actif sur /disciplines/*, renommage (libellés + commentaires).
# Usage : bash apply-nav-active-items.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
D="apps/web/src/features/app-shell"
NAV="$D/navEntries.ts"; HEADER="$D/Header.tsx"; ACT="$D/OurActivitiesMenu.tsx"
for f in "$NAV" "$HEADER" "$ACT"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
grep -q 'NAV_SUB_ACTIVE_BAR' "$NAV" && { echo "— déjà appliqué"; exit 0; }

python3 - "$NAV" "$HEADER" "$ACT" <<'PY'
import sys, pathlib
NAV, HEADER, ACT = sys.argv[1:4]
def load(p): return pathlib.Path(p).read_text(encoding="utf-8")
def save(p, s): pathlib.Path(p).write_text(s, encoding="utf-8")
def one(s, old, new, label):
    assert s.count(old) == 1, f"{label} : ancre ×{s.count(old)}"
    return s.replace(old, new)

# ---------- navEntries.ts : styles partagés ----------
s = load(NAV)
s = one(s, 'export const NAV_ACTIVE = "font-bold underline underline-offset-4";',
'''export const NAV_ACTIVE = "font-bold underline underline-offset-4";

/**
 * Item de SOUS-MENU correspondant à la page courante — sans gras.
 * Barre (déroulant clair) : fond émeraude + liseré gauche en ombre interne
 * (pas de bordure : le texte ne se décale pas). Panneau (fond noir) : texte émeraude.
 *
 * ⚠ Ne jamais poser NAV_ACTIVE sur un CONTENEUR qui englobe un déroulant : la
 * graisse s'hérite à tous ses items. L'état actif d'un menu se pose sur son libellé.
 */
export const NAV_SUB_ACTIVE_BAR =
  "bg-emerald-100 text-emerald-800 shadow-[inset_4px_0_0_#059669] hover:bg-emerald-100";
export const NAV_SUB_ACTIVE_PANEL = "text-emerald-400";''', "navEntries constantes")
s = s.replace("Nos activités", "Nos disciplines")
save(NAV, s); print("  ok  navEntries.ts")

# ---------- Header.tsx ----------
s = load(HEADER)
s = one(s, "  NAV_ACTIVE,\n", "  NAV_ACTIVE,\n  NAV_SUB_ACTIVE_BAR,\n  NAV_SUB_ACTIVE_PANEL,\n", "Header import")
# état actif : du conteneur (qui englobe le déroulant) vers le libellé
s = one(s,
  'className={`relative flex items-center whitespace-nowrap 2xl:text-[20px] ${NAV_GLOW} ${isActive(entry) ? NAV_ACTIVE : ""}`}',
  'className={`relative flex items-center whitespace-nowrap 2xl:text-[20px] ${NAV_GLOW}`}',
  "Header conteneur menu")
s = one(s,
  '<span className="whitespace-nowrap text-lg font-bold">{entry.label}</span>',
  '<span className={`whitespace-nowrap text-lg font-bold ${isActive(entry) ? NAV_ACTIVE : ""}`}>{entry.label}</span>',
  "Header libellé menu")
# items du déroulant (barre)
s = one(s,
  '''                    href={child.href}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"''',
  '''                    href={child.href}
                    aria-current={pathname === child.href ? "page" : undefined}
                    className={`block px-4 py-2 ${pathname === child.href ? NAV_SUB_ACTIVE_BAR : "text-gray-800 hover:bg-gray-100"}`}''',
  "Header items barre")
# items du panneau
s = one(s,
  '''                            href={child.href}
                            className="block py-2 text-white/80"''',
  '''                            href={child.href}
                            aria-current={pathname === child.href ? "page" : undefined}
                            className={`block py-2 ${pathname === child.href ? NAV_SUB_ACTIVE_PANEL : "text-white/80"}`}''',
  "Header items panneau")
s = s.replace("Nos activités", "Nos disciplines")
save(HEADER, s); print("  ok  Header.tsx")

# ---------- OurActivitiesMenu.tsx ----------
s = load(ACT)
s = one(s, 'import Image from "next/image";\n',
  'import Image from "next/image";\nimport { usePathname } from "next/navigation";\n'
  'import {\n  NAV_ACTIVE,\n  NAV_SUB_ACTIVE_BAR,\n  NAV_SUB_ACTIVE_PANEL,\n} from "@features/app-shell/navEntries";\n',
  "Menu imports")
s = one(s, "  const [hover, setHover] = useState<boolean>(false);\n",
  "  const [hover, setHover] = useState<boolean>(false);\n"
  "  // Page active : le libellé s'active sur toute page discipline, l'item sur SA discipline.\n"
  "  const pathname = usePathname();\n"
  "  const onDisciplines = pathname.startsWith(\"/disciplines/\");\n"
  "  const isCurrent = (slug: string): boolean => pathname === `/disciplines/${slug}`;\n",
  "Menu état")
s = one(s,
  'className="flex items-center justify-between py-3 text-left text-lg text-white"',
  'className={`flex items-center justify-between py-3 text-left text-lg text-white ${onDisciplines ? NAV_ACTIVE : ""}`}',
  "Menu bouton panneau")
s = one(s,
  '''                    href={`/disciplines/${d.slug}`}
                    className="block py-2 text-white/80"''',
  '''                    href={`/disciplines/${d.slug}`}
                    aria-current={isCurrent(d.slug) ? "page" : undefined}
                    className={`block py-2 ${isCurrent(d.slug) ? NAV_SUB_ACTIVE_PANEL : "text-white/80"}`}''',
  "Menu items panneau")
s = one(s,
  '<span className="text-lg font-bold">Nos activités</span>',
  '<span className={`text-lg font-bold ${onDisciplines ? NAV_ACTIVE : ""}`}>Nos disciplines</span>',
  "Menu libellé barre")
s = one(s,
  '''                        href={`/disciplines/${d.slug}`}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"''',
  '''                        href={`/disciplines/${d.slug}`}
                        aria-current={isCurrent(d.slug) ? "page" : undefined}
                        className={`block px-4 py-2 ${isCurrent(d.slug) ? NAV_SUB_ACTIVE_BAR : "text-gray-800 hover:bg-gray-100"}`}''',
  "Menu items barre")
s = s.replace("Nos activités", "Nos disciplines")
save(ACT, s); print("  ok  OurActivitiesMenu.tsx")

# ---------- commentaires ailleurs (renommage) ----------
for p in ("apps/web/src/features/app-shell/Footer.tsx", "apps/web/src/app/(public)/disciplines/[slug]/page.tsx"):
    q = pathlib.Path(p)
    if q.exists() and "Nos activités" in q.read_text(encoding="utf-8"):
        save(p, load(p).replace("Nos activités", "Nos disciplines")); print(f"  ok  {p} (commentaire)")
PY

left=$(grep -rn 'Nos activités' apps/web/src --include=*.ts --include=*.tsx | grep -v node_modules || true)
[ -z "$left" ] || { echo "⚠ occurrences restantes :"; echo "$left"; }

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ ÉCHEC — pas de commit :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "fix(nav): plus de gras hérité dans les déroulants, page active mise en évidence, « Nos disciplines »" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }