#!/usr/bin/env bash
# AKFC — Logo R2 (Volet 1, incrément 3 : affichages).
#  - Footer (server) : lit siteSettings via prisma → logo custom (<img>) sinon embarqué.
#  - Accueil (server) : idem pour le disque du hero.
#  - Header : déjà branché, non modifié.
# Repli uniforme : settings?.logoUrl ?? "/AKFC_logo.svg".
# Usage : bash apply-logo-r2-3-displays.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
FOOTER="apps/web/src/features/app-shell/Footer.tsx"
HOME_="apps/web/src/app/(public)/page.tsx"
for f in "$FOOTER" "$HOME_"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

python3 - "$FOOTER" "$HOME_" <<'PY'
import sys, pathlib, re
FOOTER, HOME_ = sys.argv[1], sys.argv[2]

# ---------- FOOTER ----------
p = pathlib.Path(FOOTER); s = p.read_text(encoding="utf-8")
assert '"use client"' not in s.splitlines()[0] and "'use client'" not in s.splitlines()[0], \
    "Footer est client — bascule nécessaire (dis-le-moi)"
if "siteSettings" in s:
    print("  — Footer : siteSettings déjà lu")
else:
    # import prisma (si absent)
    if "@backend/prisma" not in s:
        # insère après le premier bloc d'imports (après la ligne clubInfo)
        anchor_imp = 'import { CLUB_INFO, FOOTER_LEGAL_LINKS } from "@features/app-shell/clubInfo";'
        assert s.count(anchor_imp) == 1, "ancre import clubInfo"
        s = s.replace(anchor_imp, anchor_imp + '\nimport { prisma } from "@backend/prisma";')
    # signature → async + lecture settings
    sig = re.search(r'export default function Footer\(\)\s*:\s*JSX\.Element\s*\{', s)
    assert sig, "signature Footer introuvable"
    s = s[:sig.start()] + 'export default async function Footer(): Promise<JSX.Element> {\n' \
        + '  const settings = await prisma.siteSettings\n' \
        + '    .findUnique({ where: { id: "site" }, select: { logoKey: true, updatedAt: true } })\n' \
        + '    .catch(() => null);\n' \
        + '  const logoSrc = settings?.logoKey\n' \
        + '    ? `/api/media/site-logo?v=${settings.updatedAt.getTime()}`\n' \
        + '    : "/AKFC_logo.svg";\n' \
        + s[sig.end():]
    # remplace le <Image> logo par un rendu conditionnel <img>/<Image>
    old_img = '''              <Image
                src="/AKFC_logo.svg"
                alt="AKFC"
                width={80}
                height={80}
                className="h-16 w-auto"
              />'''
    new_img = '''              {settings?.logoKey ? (
                // logo custom (URL dynamique R2, hors pipeline next/image)
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt="AKFC" className="h-16 w-auto" />
              ) : (
                <Image
                  src="/AKFC_logo.svg"
                  alt="AKFC"
                  width={80}
                  height={80}
                  className="h-16 w-auto"
                />
              )}'''
    assert s.count(old_img) == 1, "ancre <Image> Footer"
    s = s.replace(old_img, new_img)
    p.write_text(s, encoding="utf-8")
    print("  ok  Footer : logo branché sur siteSettings (async server)")

# ---------- ACCUEIL ----------
p = pathlib.Path(HOME_); s = p.read_text(encoding="utf-8")
if "site-logo" in s or "logoKey" in s:
    print("  — Accueil : logo déjà branché")
else:
    # lecture settings juste après homeHero
    anchor_hero = '''  const homeHero = await prisma.homeHero.findUnique({
    where: { id: "home" },
  });'''
    assert s.count(anchor_hero) == 1, "ancre homeHero"
    s = s.replace(anchor_hero, anchor_hero + '''

  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "site" },
    select: { logoKey: true, updatedAt: true },
  });
  const heroLogoSrc = siteSettings?.logoKey
    ? `/api/media/site-logo?v=${siteSettings.updatedAt.getTime()}`
    : "/AKFC_logo.svg";''')
    # remplace le <Image> du disque hero
    old_img = '''          <Image
            src="/AKFC_logo.svg"
            alt="AKFC logo"
            width={250}
            height={250}
            priority
            className="h-full w-full object-contain"
          />'''
    new_img = '''          {siteSettings?.logoKey ? (
            // logo custom (URL dynamique R2)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroLogoSrc}
              alt="AKFC logo"
              className="h-full w-full object-contain"
            />
          ) : (
            <Image
              src="/AKFC_logo.svg"
              alt="AKFC logo"
              width={250}
              height={250}
              priority
              className="h-full w-full object-contain"
            />
          )}'''
    assert s.count(old_img) == 1, "ancre <Image> accueil"
    s = s.replace(old_img, new_img)
    p.write_text(s, encoding="utf-8")
    print("  ok  Accueil : logo du hero branché sur siteSettings")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
echo "prisma generate…"; { pnpm --filter @workspace/backend exec prisma generate || pnpm exec prisma generate || npx --yes prisma generate; } > /tmp/akfc_gen.log 2>&1 || true
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(site-settings): logo affiché depuis siteSettings (Footer + accueil), repli embarqué" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }