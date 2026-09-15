#!/usr/bin/env bash
#
# AKFC — SEO : generateMetadata sur les pages dynamiques publiques.
#
# Ajoute un titre + une description uniques par page (disciplines, seminars,
# events), un canonical, et l'Open Graph titre/description/url. Le `summary`
# étant du JSON PageBuilder, on templatise la description (unique par entité,
# sûr, pas de parsing fragile). Une entité NON publiée (brouillon / date future)
# renvoie une métadonnée générique `noindex` — la page fait déjà notFound().
#
# Titres : Discipline.name / Seminar.label / Event.label → « Taï-chi · AKFC »
# (via le template racine `%s · AKFC`).
#
# Périmètre : 3 fichiers page.tsx. Un typecheck.
# Usage : bash apply-seo-page-metadata.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
BASE="apps/web/src/app/(public)"
D="$BASE/disciplines/[slug]/page.tsx"
S="$BASE/seminars/[slug]/page.tsx"
E="$BASE/events/[slug]/page.tsx"
for f in "$D" "$S" "$E"; do
  [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }
done

python3 - "$D" "$S" "$E" <<'PY'
import sys, pathlib, re

D, S, E = sys.argv[1], sys.argv[2], sys.argv[3]

# Bloc generateMetadata paramétré par entité.
def block(model, field, seg, kind_fr):
    # model: prisma delegate (discipline/seminar/event)
    # field: name|label ; seg: url segment ; kind_fr: libellé humain
    return f'''
export async function generateMetadata({{
  params,
}}: {{
  params: Promise<{{ slug: string }}>;
}}): Promise<Metadata> {{
  const {{ slug }} = await params;
  const entity = await prisma.{model}
    .findUnique({{ where: {{ slug }}, select: {{ {field}: true, publicationDate: true }} }})
    .catch(() => null);

  const published =
    !!entity &&
    !!entity.publicationDate &&
    entity.publicationDate <= new Date();

  if (!published || !entity) {{
    return {{ robots: {{ index: false, follow: false }} }};
  }}

  const name = entity.{field};
  const description = `${{name}} — {kind_fr} à l'AKFC, association de kung-fu de Chambéry. Présentation, informations et actualités.`;
  const url = `/{seg}/${{slug}}`;

  return {{
    title: name,
    description,
    alternates: {{ canonical: url }},
    openGraph: {{ type: "article", url, title: name, description }},
  }};
}}
'''

def patch(path, model, field, seg, kind_fr):
    p = pathlib.Path(path)
    s = p.read_text(encoding="utf-8")
    if "generateMetadata" in s:
        print(f"  — {path} : generateMetadata déjà présent, ignoré")
        return
    # 1) garantir l'import du type Metadata
    if re.search(r'import\s+type\s+\{[^}]*\bMetadata\b', s) is None:
        # insère après le premier import (ligne 1 typiquement `import { notFound }...`)
        lines = s.splitlines(keepends=True)
        # trouver la fin du bloc d'imports initial (dernière ligne commençant par import au début)
        insert_at = 0
        for i, ln in enumerate(lines):
            if ln.startswith("import "):
                insert_at = i + 1
        lines.insert(insert_at, 'import type { Metadata } from "next";\n')
        s = "".join(lines)
    # 2) insérer le generateMetadata juste avant `export default async function`
    m = re.search(r'\nexport default async function ', s)
    assert m, f"{path} : ancre export default introuvable"
    idx = m.start()
    s = s[:idx] + "\n" + block(model, field, seg, kind_fr).rstrip() + "\n" + s[idx:]
    p.write_text(s, encoding="utf-8")
    print(f"  ok  {path}")

patch(D, "discipline", "name",  "disciplines", "discipline enseign\u00e9e")
patch(S, "seminar",    "label", "seminars",    "stage")
patch(E, "event",      "label", "events",      "\u00e9v\u00e8nement")
print("generateMetadata ajouté aux 3 pages dynamiques.")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -20 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(seo): generateMetadata par page (disciplines/seminars/events publiés)" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }