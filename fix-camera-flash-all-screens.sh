#!/usr/bin/env bash
#
# AKFC — CameraCapture : flash disponible sur TOUT écran.
#
# Comportement voulu : torch si le matériel l'a, sinon flash logiciel
# (illumination de l'écran) — quel que soit l'écran. Aujourd'hui le flash
# logiciel est bridé par `&& isSmallScreen`, d'où son absence sur laptop/desktop.
#
#   - `softwareFlashAllowed = !hasTorch && isSmallScreen` → `!hasTorch`
#     (donc `flashAvailable` devient toujours vrai) ;
#   - suppression de l'état `isSmallScreen` + son useEffect matchMedia (devenus
#     morts, sinon variable inutilisée).
#
# La sélection torch vs logiciel est déjà gérée par cycleFlash/handleCapture —
# rien d'autre à toucher. 1 fichier, typecheck web.
#
# Usage : bash fix-camera-flash-all-screens.sh
#         AKFC_APPLY_ONLY=1 bash fix-camera-flash-all-screens.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/avatar/CameraCapture.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 1. Assouplir la condition (+ commentaire)
cond_old = (
    "  // Flash logiciel autorisé uniquement sans flash matériel ET sur petit écran.\n"
    "  // `flashAvailable` conditionne l'affichage du bouton flash.\n"
    "  const softwareFlashAllowed = !hasTorch && isSmallScreen;\n"
)
cond_new = (
    "  // Flash disponible sur TOUT écran : torch si le matériel l'a, sinon flash\n"
    "  // logiciel (illumination de l'écran). `flashAvailable` est donc toujours\n"
    "  // vrai et conditionne l'affichage du bouton flash.\n"
    "  const softwareFlashAllowed = !hasTorch;\n"
)
if "const softwareFlashAllowed = !hasTorch;\n" in s:
    print("condition déjà assouplie"); 
else:
    assert s.count(cond_old) == 1, "ancre condition softwareFlashAllowed introuvable"
    s = s.replace(cond_old, cond_new)
    print("condition : flash logiciel autorisé sur tout écran")

# 2. Retirer l'état isSmallScreen (commentaire + useState)
st_old = (
    "  // Le flash logiciel ne compense l'absence de flash frontal que sur petit\n"
    "  // écran / mobile. Sur grand écran, il éblouit sans raison.\n"
    "  const [isSmallScreen, setIsSmallScreen] = useState(false);\n"
)
if "isSmallScreen" in s and st_old in s:
    s = s.replace(st_old, "")
    print("état isSmallScreen retiré")

# 3. Retirer le useEffect matchMedia (+ ligne vide qui suit)
eff_old = (
    "  useEffect(() => {\n"
    "    if (typeof window === \"undefined\") return;\n"
    "    const mq = window.matchMedia(\"(max-width: 640px)\");\n"
    "    const update = () => setIsSmallScreen(mq.matches);\n"
    "    update();\n"
    "    mq.addEventListener(\"change\", update);\n"
    "    return () => mq.removeEventListener(\"change\", update);\n"
    "  }, []);\n\n"
)
if eff_old in s:
    s = s.replace(eff_old, "")
    print("useEffect matchMedia retiré")

# garde-fou : plus aucune référence à isSmallScreen
if "isSmallScreen" in s:
    print("ATTENTION: référence isSmallScreen résiduelle — vérifie le fichier", file=sys.stderr)

p.write_text(s, encoding="utf-8")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|isSmallScreen" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "fix(avatar): flash caméra disponible sur tout écran (torch si présent, sinon logiciel)" \
  && echo "commit $(git rev-parse --short HEAD)"