#!/usr/bin/env bash
# AKFC — SEO local : JSON-LD LocalBusiness + titres/descriptions (accueil, /infos, pages statiques).
# Usage : bash apply-seo-local.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
B="apps/web/src/app/(public)"
HOME_="$B/page.tsx"
INFOS="$B/infos/[slug]/page.tsx"
SEO_DIR="apps/web/src/features/seo"
JSONLD="$SEO_DIR/LocalBusinessJsonLd.tsx"
for f in "$HOME_" "$INFOS"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
[ -d "$SEO_DIR" ] || mkdir -p "$SEO_DIR"

# ---------- composant JSON-LD ----------
cat > "$JSONLD" <<'TSX'
import type { JSX } from "react";
import { SITE_URL } from "@/config/siteUrl";

/**
 * Données structurées (schema.org) de l'AKFC — type SportsActivityLocation
 * (sous-type de LocalBusiness). Donne à Google, de façon machine-lisible :
 * l'entité (nom + sigle développé), l'adresse (MJC de Chambéry), la géoloc,
 * les disciplines et la zone desservie (Chambéry + agglo, Savoie, Isère).
 * À monter sur l'accueil. `sameAs`/`telephone` ajoutables plus tard.
 */
export function LocalBusinessJsonLd(): JSX.Element {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: "AKFC",
    alternateName: "Association Kung-Fu Chambéry",
    description:
      "Association de kung-fu à Chambéry : cours de kung-fu (tchoy-lee-fut), taï-chi-chuan, kali et arts martiaux chinois, pour tous publics, à la MJC de Chambéry.",
    url: SITE_URL,
    image: `${SITE_URL}/og-default.png`,
    sport: ["Kung-fu", "Taï-chi-chuan", "Kali", "Arts martiaux chinois"],
    address: {
      "@type": "PostalAddress",
      name: "MJC de Chambéry",
      streetAddress: "311 Faubourg Montmélian",
      postalCode: "73000",
      addressLocality: "Chambéry",
      addressRegion: "Savoie",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 45.5664,
      longitude: 5.93008,
    },
    areaServed: [
      { "@type": "City", name: "Chambéry" },
      { "@type": "City", name: "La Motte-Servolex" },
      { "@type": "City", name: "Cognin" },
      { "@type": "City", name: "Jacob-Bellecombet" },
      { "@type": "City", name: "Barberaz" },
      { "@type": "City", name: "La Ravoire" },
      { "@type": "City", name: "Challes-les-Eaux" },
      { "@type": "City", name: "Bassens" },
      { "@type": "City", name: "Saint-Alban-Leysse" },
      { "@type": "AdministrativeArea", name: "Savoie" },
      { "@type": "AdministrativeArea", name: "Isère" },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
TSX
echo "  ok  $JSONLD"

python3 - "$HOME_" "$INFOS" "$B" <<'PY'
import sys, pathlib, re
HOME_, INFOS, B = sys.argv[1], sys.argv[2], sys.argv[3]

def ensure_metadata_import(s: str) -> str:
    if re.search(r'import\s+type\s+\{[^}]*\bMetadata\b', s):
        return s
    lines = s.splitlines(keepends=True)
    # fin du bloc d'imports initial : dernière ligne qui TERMINE un import
    last = -1; depth = 0; inimp = False
    for i, ln in enumerate(lines):
        st = ln.strip()
        if not inimp and st.startswith("import"): inimp = True
        if inimp:
            depth += ln.count("{") - ln.count("}")
            if depth <= 0 and st.endswith(";"): last = i; inimp = False; depth = 0
    lines.insert(last + 1, 'import type { Metadata } from "next";\n')
    return "".join(lines)

# ---------- ACCUEIL ----------
p = pathlib.Path(HOME_); s = p.read_text(encoding="utf-8")
assert "generateMetadata" not in s and "export const metadata" not in s, "accueil a déjà des metadata"
s = ensure_metadata_import(s)
# import du composant JSON-LD après l'import HomeCarousel
imp_hc = 'import HomeCarousel from "@features/app-shell/HomeCarousel";'
assert s.count(imp_hc) == 1, "ancre import HomeCarousel"
s = s.replace(imp_hc, imp_hc + '\nimport { LocalBusinessJsonLd } from "@features/seo/LocalBusinessJsonLd";')
# metadata (titre ABSOLU : ignore le template pour la home)
m = re.search(r'\nexport default async function ', s)
assert m, "accueil : export default async introuvable"
meta = '''
export const metadata: Metadata = {
  title: {
    absolute:
      "AKFC — Association Kung-Fu Chambéry : taï-chi, kali & arts martiaux",
  },
  description:
    "AKFC (Association Kung-Fu Chambéry) : cours de kung-fu, taï-chi, kali et arts martiaux chinois à la MJC de Chambéry (Savoie), pour tous publics.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AKFC — Association Kung-Fu Chambéry",
    description:
      "Cours de kung-fu, taï-chi, kali et arts martiaux chinois à la MJC de Chambéry (Savoie).",
  },
};
'''
s = s[:m.start()] + "\n" + meta.rstrip() + "\n" + s[m.start():]
# montage du JSON-LD juste avant HomeCarousel
mount = "      <HomeCarousel />"
assert s.count(mount) == 1, "ancre <HomeCarousel />"
s = s.replace(mount, "      <LocalBusinessJsonLd />\n" + mount)
p.write_text(s, encoding="utf-8")
print(f"  ok  {HOME_} (metadata + JSON-LD)")

# ---------- /infos/[slug] ----------
p = pathlib.Path(INFOS); s = p.read_text(encoding="utf-8")
if "generateMetadata" in s:
    print(f"  — {INFOS} : generateMetadata déjà présent")
else:
    s = ensure_metadata_import(s)
    m = re.search(r'\nexport default async function ', s)
    assert m, "infos : export default async introuvable"
    gm = '''
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.sitePage
    .findUnique({ where: { slug }, select: { title: true } })
    .catch(() => null);
  const title = page?.title ?? "Information";
  return {
    title,
    description: `${title} — AKFC, Association Kung-Fu Chambéry (Savoie).`,
    alternates: { canonical: `/infos/${slug}` },
  };
}
'''
    s = s[:m.start()] + "\n" + gm.rstrip() + "\n" + s[m.start():]
    p.write_text(s, encoding="utf-8")
    print(f"  ok  {INFOS} (generateMetadata)")

# ---------- pages statiques : titre court (tolérant) ----------
STATIC = [
    ("gallery/page.tsx", "Galeries"),
    ("contacts/page.tsx", "Contacts"),
    ("agenda/page.tsx", "Agenda"),
    ("about/page.tsx", "L'association"),
    ("about/instructeurs/page.tsx", "Nos instructeurs"),
]
for rel, label in STATIC:
    fp = pathlib.Path(B) / rel
    if not fp.exists():
        print(f"  · {rel} : absent, ignoré"); continue
    s = fp.read_text(encoding="utf-8")
    head = "\n".join(s.splitlines()[:3])
    if '"use client"' in head or "'use client'" in head:
        # page client → on pose le titre via un layout serveur du même segment
        lay = fp.parent / "layout.tsx"
        if lay.exists():
            print(f"  · {rel} : CLIENT et layout déjà présent, ignoré"); continue
        lbl = label.replace('"', '\\"')
        lay.write_text(
            'import type { Metadata } from "next";\n'
            'import type { ReactNode } from "react";\n\n'
            f'export const metadata: Metadata = {{ title: "{lbl}" }};\n\n'
            'export default function SegmentLayout({ children }: { children: ReactNode }) {\n'
            '  return children;\n'
            '}\n',
            encoding="utf-8",
        )
        print(f"  ok  {rel} : CLIENT → layout.tsx (title « {label} »)"); continue
    if "generateMetadata" in s or re.search(r'export const metadata\b', s):
        print(f"  · {rel} : metadata déjà présent, ignoré"); continue
    m = re.search(r'\nexport default (async )?function ', s)
    if not m:
        print(f"  · {rel} : pas d'export default function, ignoré"); continue
    s = ensure_metadata_import(s)
    m = re.search(r'\nexport default (async )?function ', s)  # recalc après import
    lbl = label.replace('"', '\\"')
    block = f'\nexport const metadata: Metadata = {{ title: "{lbl}" }};\n'
    s = s[:m.start()] + block + s[m.start():]
    fp.write_text(s, encoding="utf-8")
    print(f"  ok  {rel} (title « {label} »)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(seo): JSON-LD LocalBusiness + titres/descriptions (accueil, infos, pages statiques)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }