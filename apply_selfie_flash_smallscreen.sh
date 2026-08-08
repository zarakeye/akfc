#!/usr/bin/env bash
#
# AKFC — Flash selfie : réserver le flash LOGICIEL au petit écran.
#
# La détection de flash MATÉRIEL (`hasTorch` via getCapabilities().torch) et sa
# convocation (applyConstraints torch) existent déjà et restent inchangées.
# Le problème : le flash LOGICIEL (voile blanc « on », éclair « capture »)
# s'activait sur tout écran, y compris desktop, où il éblouit sans raison —
# c'est un palliatif à l'absence de flash frontal sur mobile.
#
# Correctif : `softwareFlashAllowed = !hasTorch && isSmallScreen` (media query
# max-width 640px, réactive). Le voile blanc et l'éclair de capture ne se
# déclenchent que si ce flag est vrai ; le bouton flash est masqué quand aucun
# flash (matériel OU logiciel) n'est réellement disponible.
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-selfie-flash-smallscreen.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-selfie-flash-smallscreen.sh
#
set -euo pipefail

SVC="apps/web/src/features/avatar/CameraCapture.tsx"

if [ ! -f "package.json" ] || [ ! -f "$SVC" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($SVC attendu)." >&2
  exit 1
fi

python3 - "$SVC" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "softwareFlashAllowed" in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── A) état isSmallScreen ───────────────────────────────────────────────────
A_OLD = '''  const [screenFlash, setScreenFlash] = useState(false);'''
A_NEW = '''  const [screenFlash, setScreenFlash] = useState(false);
  // Le flash logiciel ne compense l'absence de flash frontal que sur petit
  // écran / mobile. Sur grand écran, il éblouit sans raison.
  const [isSmallScreen, setIsSmallScreen] = useState(false);'''
assert s.count(A_OLD) == 1, "ancre screenFlash introuvable/multiple — abandon"
s = s.replace(A_OLD, A_NEW)

# ── B) effet media query + flags dérivés (avant stopStream, donc en scope
#       pour handleCapture / litOn) ────────────────────────────────────────
B_OLD = '''  const stopStream = () => {'''
B_NEW = '''  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsSmallScreen(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Flash logiciel autorisé uniquement sans flash matériel ET sur petit écran.
  // `flashAvailable` conditionne l'affichage du bouton flash.
  const softwareFlashAllowed = !hasTorch && isSmallScreen;
  const flashAvailable = hasTorch || softwareFlashAllowed;

  const stopStream = () => {'''
assert s.count(B_OLD) == 1, "ancre stopStream introuvable/multiple — abandon"
s = s.replace(B_OLD, B_NEW)

# ── C) éclair de capture : gated par softwareFlashAllowed ───────────────────
C_OLD = '''    if (flashMode === "capture" && !hasTorch) {'''
C_NEW = '''    if (flashMode === "capture" && softwareFlashAllowed) {'''
assert s.count(C_OLD) == 1, "ancre handleCapture introuvable/multiple — abandon"
s = s.replace(C_OLD, C_NEW)

# ── D) voile blanc persistant : gated par flashAvailable ────────────────────
D_OLD = '''  const litOn = flashMode === "on" && !screenFlash;'''
D_NEW = '''  const litOn = flashMode === "on" && !screenFlash && flashAvailable;'''
assert s.count(D_OLD) == 1, "ancre litOn introuvable/multiple — abandon"
s = s.replace(D_OLD, D_NEW)

# ── E) masquer le bouton flash quand aucun flash utile ──────────────────────
E_OLD = '''        <button
          type="button"
          aria-label={
            flashMode === "off"
              ? "Flash désactivé (cliquer pour flash à la capture)"
              : flashMode === "capture"
                ? "Flash à la capture (cliquer pour flash continu)"
                : "Flash continu (cliquer pour désactiver)"
          }
          onClick={cycleFlash}
          title={
            flashMode === "off"
              ? "Flash : off"
              : flashMode === "capture"
                ? "Flash : à la capture"
                : "Flash : continu"
          }
          className={`rounded-full p-2 transition-colors ${
            flashMode === "on"
              ? "bg-amber-400 text-gray-900"
              : flashMode === "capture"
                ? "bg-white text-gray-900"
                : "bg-white/10 text-white hover:bg-white/25"
          }`}
        >
          {flashMode === "off" ? (
            <ZapOff className="h-5 w-5" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
        </button>'''
E_NEW = '''        {flashAvailable && (
          <button
            type="button"
            aria-label={
              flashMode === "off"
                ? "Flash désactivé (cliquer pour flash à la capture)"
                : flashMode === "capture"
                  ? "Flash à la capture (cliquer pour flash continu)"
                  : "Flash continu (cliquer pour désactiver)"
            }
            onClick={cycleFlash}
            title={
              flashMode === "off"
                ? "Flash : off"
                : flashMode === "capture"
                  ? "Flash : à la capture"
                  : "Flash : continu"
            }
            className={`rounded-full p-2 transition-colors ${
              flashMode === "on"
                ? "bg-amber-400 text-gray-900"
                : flashMode === "capture"
                  ? "bg-white text-gray-900"
                  : "bg-white/10 text-white hover:bg-white/25"
            }`}
          >
            {flashMode === "off" ? (
              <ZapOff className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
          </button>
        )}'''
assert s.count(E_OLD) == 1, "ancre bouton flash introuvable/multiple — abandon"
s = s.replace(E_OLD, E_NEW)

p.write_text(s, encoding="utf-8")
print("patch CameraCapture OK (flash logiciel réservé au petit écran)")
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
if git commit -m "fix(avatar): réserver le flash logiciel au petit écran, masquer le bouton flash sans flash utile" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi