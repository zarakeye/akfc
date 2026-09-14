#!/usr/bin/env bash
#
# AKFC — SEO : Open Graph + Twitter Card au niveau racine (site entier).
#
# Le generateMetadata racine posait déjà metadataBase/title/description/robots
# mais AUCUNE balise Open Graph → les liens partagés (WhatsApp, LinkedIn…)
# s'affichent nus. On ajoute openGraph + twitter, pilotés par les titres déjà
# lus depuis siteSettings. Image de partage par défaut : /og-default.png
# (à déposer dans apps/web/public/, 1200×630 — voir note en fin de script).
#
# Périmètre : apps/web/src/app/layout.tsx. Un typecheck.
# Usage : bash apply-seo-root-opengraph.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/app/layout.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'openGraph:' "$F" 2>/dev/null; then echo "— Open Graph déjà présent"; exit 0; fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

old = """  return {
    metadataBase: new URL(SITE_URL),
    title: { default: shortTitle, template: `%s · ${shortTitle}` },
    description,
    robots: { index: true, follow: true },
  };"""
new = """  return {
    metadataBase: new URL(SITE_URL),
    title: { default: shortTitle, template: `%s · ${shortTitle}` },
    description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: shortTitle,
      locale: "fr_FR",
      url: SITE_URL,
      title: longTitle,
      description,
      images: [
        { url: "/og-default.png", width: 1200, height: 630, alt: longTitle },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: longTitle,
      description,
      images: ["/og-default.png"],
    },
  };"""
assert s.count(old) == 1, f"ancre return ×{s.count(old)}"
p.write_text(s.replace(old, new), encoding="utf-8")
print("layout.tsx : openGraph + twitter ajoutés.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(seo): Open Graph + Twitter Card au niveau racine" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }

echo ""
echo "════════ À FAIRE côté toi ════════"
echo "Dépose une image de partage : apps/web/public/og-default.png (1200×630)."
echo "Sans elle, l'OG marche (titre+description) mais sans vignette. Le logo"
echo "SVG ne convient pas directement — il faut un PNG/JPG 1200×630 (bannière"
echo "avec logo + nom du club sur fond de couleur)."