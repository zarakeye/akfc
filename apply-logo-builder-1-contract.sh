#!/usr/bin/env bash
# AKFC — Logo dans le builder (Volet 1bis, inc 1 : contrat).
# Ajoute le kind "site-logo" à mediaTextItemSchema (→ media-text ET float-text).
# Référence LOGIQUE (comme avatar) : pas d'id, résolue au rendu via SiteSettings.
# Usage : bash apply-logo-builder-1-contract.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="packages/contracts/src/page/blocks.v1.ts"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
grep -q '"site-logo"' "$F" && { echo "— site-logo déjà présent"; exit 0; }

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# 1) définir siteLogoMediaItemSchema juste avant mediaTextItemSchema
anchor_union = "const mediaTextItemSchema = z.discriminatedUnion(\"kind\", ["
assert s.count(anchor_union) == 1, f"ancre discriminatedUnion ×{s.count(anchor_union)}"
schema = '''/**
 * Référence LOGIQUE au logo du site (pas au binaire). Unique — aucun id. Résolue
 * dynamiquement au rendu via SiteSettings : si l'admin change le logo, toutes les
 * pages qui l'utilisent suivent. Le logo vit hors finder (clé R2 système).
 */
const siteLogoMediaItemSchema = z.object({
  kind: z.literal("site-logo"),
  caption: z.string().optional(),
});

'''
s = s.replace(anchor_union, schema + anchor_union)

# 2) ajouter le membre à la discriminatedUnion
old_members = '''const mediaTextItemSchema = z.discriminatedUnion("kind", [
  libraryMediaItemSchema,
  avatarMediaItemSchema,
]);'''
new_members = '''const mediaTextItemSchema = z.discriminatedUnion("kind", [
  libraryMediaItemSchema,
  avatarMediaItemSchema,
  siteLogoMediaItemSchema,
]);'''
assert s.count(old_members) == 1, f"ancre membres union ×{s.count(old_members)}"
s = s.replace(old_members, new_members)

p.write_text(s, encoding="utf-8")
print("  ok  contrat : kind \"site-logo\" ajouté (media-text + float-text)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(page-builder): contrat — kind site-logo (media-text + float-text)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }