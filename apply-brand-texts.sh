#!/usr/bin/env bash
# AKFC — Volet 2 : textes de marque affichés → siteSettings.shortTitle (repli "AKFC").
#  - Footer : copyright + alt du logo.
#  - Accueil : alt du logo du hero.
#  - events/[slug] : coquille "associationde" → "association de".
# SEO (title/description/JSON-LD) laissé FIGÉ volontairement.
# Usage : bash apply-brand-texts.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
FOOTER="apps/web/src/features/app-shell/Footer.tsx"
HOME_="apps/web/src/app/(public)/page.tsx"
EVENTS="apps/web/src/app/(public)/events/[slug]/page.tsx"
for f in "$FOOTER" "$HOME_" "$EVENTS"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

python3 - "$FOOTER" "$HOME_" "$EVENTS" <<'PY'
import sys, pathlib
FOOTER, HOME_, EVENTS = sys.argv[1], sys.argv[2], sys.argv[3]
def rd(p): return pathlib.Path(p).read_text(encoding="utf-8")
def wr(p,s): pathlib.Path(p).write_text(s, encoding="utf-8")
def one(s, old, new, label):
    assert s.count(old) == 1, f"{label}: ancre ×{s.count(old)}"
    return s.replace(old, new)

BRAND = 'settings?.shortTitle ?? "AKFC"'

# ---------- élargir les select siteSettings (ajouter shortTitle) ----------
s = rd(FOOTER)
if "shortTitle" not in s:
    s = one(s,
        "select: { logoKey: true, updatedAt: true }",
        "select: { logoKey: true, updatedAt: true, shortTitle: true }",
        "footer select")
    wr(FOOTER, s); print("  ok  Footer : select élargi (shortTitle)")

s = rd(HOME_)
if "shortTitle: true" not in s:
    s = one(s,
        "select: { logoKey: true, updatedAt: true },",
        "select: { logoKey: true, updatedAt: true, shortTitle: true },",
        "accueil select")
    wr(HOME_, s); print("  ok  Accueil : select élargi (shortTitle)")

# ---------- FOOTER ----------
s = rd(FOOTER)
# copyright
s = one(s,
    '<p>© {year} AKFC. Tous droits réservés.</p>',
    '<p>© {year} {' + BRAND + '}. Tous droits réservés.</p>',
    "footer copyright")
# alt du logo custom (<img ... alt="AKFC")
s = one(s,
    '<img src={logoSrc} alt="AKFC" className="h-16 w-auto" />',
    '<img src={logoSrc} alt={' + BRAND + '} className="h-16 w-auto" />',
    "footer alt img")
# alt du <Image> embarqué (bloc multi-lignes : alt="AKFC" seul sur sa ligne)
s = one(s,
    '''                <Image
                  src="/AKFC_logo.svg"
                  alt="AKFC"''',
    '''                <Image
                  src="/AKFC_logo.svg"
                  alt={''' + BRAND + '''}''',
    "footer alt Image")
wr(FOOTER, s); print("  ok  Footer : copyright + alt → shortTitle")

# ---------- ACCUEIL ----------
s = rd(HOME_)
# les deux alt="AKFC logo" (custom <img> et <Image> embarqué). L'accueil lit
# déjà siteSettings (Volet 1). On remplace les 2 occurrences.
n = s.count('alt="AKFC logo"')
assert n == 2, f"accueil: {n} occurrence(s) alt='AKFC logo' (attendu 2)"
s = s.replace('alt="AKFC logo"', 'alt={`${siteSettings?.shortTitle ?? "AKFC"} logo`}')
wr(HOME_, s); print("  ok  Accueil : 2 alt → shortTitle")

# ---------- EVENTS : coquille ----------
s = rd(EVENTS)
if "associationde" in s:
    s = one(s, "associationde kung-fu", "association de kung-fu", "events coquille")
    wr(EVENTS, s); print("  ok  events : coquille corrigée")
else:
    print("  — events : coquille déjà absente")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(identité): textes de marque affichés → siteSettings (Footer, accueil) + fix coquille events" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }