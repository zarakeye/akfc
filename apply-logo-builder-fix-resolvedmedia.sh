#!/usr/bin/env bash
# AKFC — Fix : compléter l'objet siteLogo aux champs requis de ResolvedMedia.
# Usage : bash apply-logo-builder-fix-resolvedmedia.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/page-builder/PageRenderer.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'mimeType: "image/svg+xml"' in s:
    print("  — siteLogo déjà complet"); sys.exit(0)
old = '''  const siteLogo: ResolvedMedia | null = {
    url: siteSettingsRow?.logoKey
      ? `/api/media/site-logo?v=${siteSettingsRow.updatedAt.getTime()}`
      : "/AKFC_logo.svg",
    kind: "image",
    posterUrl: null,
  };'''
new = '''  const siteLogo: ResolvedMedia | null = {
    url: siteSettingsRow?.logoKey
      ? `/api/media/site-logo?v=${siteSettingsRow.updatedAt.getTime()}`
      : "/AKFC_logo.svg",
    kind: "image",
    posterUrl: null,
    mimeType: "image/svg+xml",
    fileName: "logo.svg",
    width: null,
    height: null,
    duration: null,
  };'''
assert s.count(old) == 1, f"ancre siteLogo ×{s.count(old)}"
p.write_text(s.replace(old, new), encoding="utf-8")
print("  ok  siteLogo complété (champs ResolvedMedia)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(page-builder): rendu du logo (site-logo) — media-text + float-text, repli embarqué" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }