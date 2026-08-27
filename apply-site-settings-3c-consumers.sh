#!/usr/bin/env bash
#
# AKFC — Réglages du site (CMS) incrément 3c : consommateurs front.
#
# Prérequis : incréments 1, 2, 3a, 3b (le get renvoie logoUrl) + durcissement.
# Tout est front → un seul typecheck web.
#
# 1. Header (client) — lit `siteSettings.get` : logo depuis `logoUrl` (repli sur
#    `/AKFC_logo.svg`), libellé depuis `shortTitle` (repli "AKFC"). Le logo
#    personnalisé est rendu en <img> simple (URL de proxy dynamique, hors
#    pipeline next/image) ; le chemin par défaut garde son <Image> INCHANGÉ.
#
# 2. layout racine — titre d'onglet DYNAMIQUE : le `metadata` statique devient
#    `generateMetadata()` (server) qui lit `siteSettings`. ROBUSTE aux deux
#    états : si le chantier SEO a été appliqué (metadataBase + robots présents),
#    on les PRÉSERVE ; sinon on ne met que titre + description. Le python détecte
#    lequel des deux blocs est là.
#
# 3. page de config — LISSAGE de l'aperçu : si l'id choisi est le logo
#    ENREGISTRÉ, on prend `logoUrl` (public, autorisé même en brouillon via 3a)
#    → un brouillon s'aperçoit comme le produit fini ; sinon `resolveByIds` le
#    temps d'enregistrer.
#
# Usage : bash apply-site-settings-3c-consumers.sh
#         AKFC_APPLY_ONLY=1 bash apply-site-settings-3c-consumers.sh   (clone)
#
set -euo pipefail

HEADER="apps/web/src/features/app-shell/Header.tsx"
LAYOUT="apps/web/src/app/layout.tsx"
CONFIG="apps/web/src/app/(admin)/dashboard/settings/page.tsx"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$HEADER" "$LAYOUT" "$CONFIG"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. Header ────────────────────────────────────────────────────────────────
python3 - "$HEADER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "siteSettings.get" in s:
    print("Header déjà branché"); sys.exit(0)

# import trpc
imp_anchor = 'import { DocumentsNavLink } from "@features/member-documents/DocumentsNavLink";\n'
assert s.count(imp_anchor) == 1, "ancre import DocumentsNavLink introuvable/multiple"
s = s.replace(imp_anchor, imp_anchor + 'import { trpc } from "@trpc/trpcClient";\n')

# hook (après user + pathname)
hook_anchor = (
    "  const user = useSessionStore(state => state.session?.user);\n"
    "  const pathname = usePathname();\n"
)
assert s.count(hook_anchor) == 1, "ancre user/pathname introuvable/multiple"
hook = (
    "  const user = useSessionStore(state => state.session?.user);\n"
    "  const pathname = usePathname();\n"
    "\n"
    "  // Identité éditable (logo + libellé) — lecture publique, repli embarqué.\n"
    "  const siteSettings = trpc.siteSettings.get.useQuery();\n"
    "  const logoUrl = siteSettings.data?.logoUrl ?? null;\n"
    '  const brand = siteSettings.data?.shortTitle ?? "AKFC";\n'
)
s = s.replace(hook_anchor, hook)

# rendu du logo (conditionnel)
logo_anchor = (
    '          <Image\n'
    '            src="/AKFC_logo.svg"\n'
    '            alt="AKFC logo"\n'
    '            width={100}\n'
    '            height={100}\n'
    '            priority\n'
    '            className="h-12 w-auto xl:h-16 2xl:h-25"\n'
    '          />\n'
)
assert s.count(logo_anchor) == 1, "ancre <Image logo> introuvable/multiple"
logo_new = (
    '          {logoUrl ? (\n'
    '            // Logo personnalisé (réglages) — <img> simple : URL de proxy\n'
    '            // dynamique, hors pipeline next/image.\n'
    '            // eslint-disable-next-line @next/next/no-img-element\n'
    '            <img\n'
    '              src={logoUrl}\n'
    '              alt={`${brand} logo`}\n'
    '              className="h-12 w-auto xl:h-16 2xl:h-25"\n'
    '            />\n'
    '          ) : (\n'
    '            <Image\n'
    '              src="/AKFC_logo.svg"\n'
    '              alt={`${brand} logo`}\n'
    '              width={100}\n'
    '              height={100}\n'
    '              priority\n'
    '              className="h-12 w-auto xl:h-16 2xl:h-25"\n'
    '            />\n'
    '          )}\n'
)
s = s.replace(logo_anchor, logo_new)

p.write_text(s, encoding="utf-8")
print("Header branché (logo + libellé)")
PY

# ── 2. layout racine : metadata → generateMetadata (robuste SEO/non-SEO) ──────
python3 - "$LAYOUT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "generateMetadata" in s:
    print("layout déjà dynamique"); sys.exit(0)

head = (
    "export async function generateMetadata(): Promise<Metadata> {\n"
    "  const settings = await prisma.siteSettings\n"
    '    .findUnique({ where: { id: "site" }, select: { shortTitle: true, longTitle: true, tagline: true } })\n'
    "    .catch(() => null);\n"
    '  const shortTitle = settings?.shortTitle?.trim() || "AKFC";\n'
    '  const longTitle =\n'
    '    settings?.longTitle?.trim() || "Association de Kung Fu de Chambéry";\n'
    "  const description = settings?.tagline?.trim() || longTitle;\n"
    "  return {\n"
)

seo_block = (
    'export const metadata: Metadata = {\n'
    '  metadataBase: new URL(SITE_URL),\n'
    '  title: { default: "AKFC", template: "%s · AKFC" },\n'
    '  description: "Association de Kung Fu de Chambéry",\n'
    '  robots: { index: true, follow: true },\n'
    '}\n'
)
orig_block = (
    'export const metadata: Metadata = {\n'
    '  title: "AKFC",\n'
    '  description: "Association de Kung Fu de Chambéry",\n'
    '}\n'
)

if seo_block in s:
    body = (
        "    metadataBase: new URL(SITE_URL),\n"
        "    title: { default: shortTitle, template: `%s · ${shortTitle}` },\n"
        "    description,\n"
        "    robots: { index: true, follow: true },\n"
        "  };\n"
        "}\n"
    )
    s = s.replace(seo_block, head + body)
    print("layout dynamique (variante SEO préservée)")
elif orig_block in s:
    body = (
        "    title: { default: shortTitle, template: `%s · ${shortTitle}` },\n"
        "    description,\n"
        "  };\n"
        "}\n"
    )
    s = s.replace(orig_block, head + body)
    print("layout dynamique (variante d'origine)")
else:
    print("ERREUR: bloc metadata racine introuvable (ni SEO ni origine)", file=sys.stderr)
    sys.exit(1)

p.write_text(s, encoding="utf-8")
PY

# ── 3. page de config : lissage de l'aperçu ─────────────────────────────────
python3 - "$CONFIG" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "savedLogoId" in s:
    print("aperçu déjà lissé"); sys.exit(0)

old = (
    "  const logoImg = trpc.media.resolveByIds.useQuery(\n"
    "    { mediaIds: logoAssetId ? [logoAssetId] : [] },\n"
    "    { enabled: logoAssetId !== null },\n"
    "  );\n"
    "  const logoUrl = logoAssetId\n"
    "    ? (logoImg.data?.[logoAssetId]?.url ?? null)\n"
    "    : null;\n"
)
assert s.count(old) == 1, "ancre aperçu logo (config) introuvable/multiple"
new = (
    "  const savedLogoId = settings.data?.logoAssetId ?? null;\n"
    "  const savedLogoUrl = settings.data?.logoUrl ?? null;\n"
    "\n"
    "  // Aperçu : si l'id courant est le logo ENREGISTRÉ, on prend l'URL publique\n"
    "  // (autorisée même en brouillon via la garde) → un brouillon s'aperçoit\n"
    "  // comme le produit fini. Sinon (choix pas encore enregistré) : resolveByIds\n"
    "  // (published) le temps d'enregistrer.\n"
    "  const picked = trpc.media.resolveByIds.useQuery(\n"
    "    {\n"
    "      mediaIds:\n"
    "        logoAssetId && logoAssetId !== savedLogoId ? [logoAssetId] : [],\n"
    "    },\n"
    "    { enabled: logoAssetId !== null && logoAssetId !== savedLogoId },\n"
    "  );\n"
    "  const logoUrl = !logoAssetId\n"
    "    ? null\n"
    "    : logoAssetId === savedLogoId\n"
    "      ? savedLogoUrl\n"
    "      : (picked.data?.[logoAssetId]?.url ?? null);\n"
)
s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("aperçu lissé (brouillon = produit fini une fois enregistré)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(settings): header logo+libellé, titre d'onglet dynamique, aperçu logo lissé (brouillon=produit fini)" \
  && echo "commit $(git rev-parse --short HEAD)"