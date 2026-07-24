#!/usr/bin/env bash
#
# step_mediatext_align_headings.sh
#
# Incrément 1 sur 2. Deux changements sûrs, sans inconnue.
#
# ─── A. Le média s'aligne sur la première ligne de texte ───────────────────
#
# `items-center` centrait les deux colonnes l'une par rapport à l'autre :
# avec un texte plus haut que l'image, celle-ci flottait à mi-hauteur, et le
# haut du bloc s'ouvrait sur un vide asymétrique. C'est l'inverse de la
# convention éditoriale — en presse comme en revue, l'illustration et le
# premier mot partagent la même ligne de tête.
#
# `items-start` sur le rendu public ET sur l'aperçu du builder : les deux
# doivent montrer la même chose.
#
# ─── B. Titres jusqu'à h6 ──────────────────────────────────────────────────
#
# Le menu déroulant n'offrait que quatre niveaux (`levels={[1, 2, 3, 4]}`),
# et le SCSS n'en stylait que quatre. StarterKit, lui, accepte déjà 1 à 6 :
# rien à activer côté extension, seulement à exposer et à styler.
#
# ⚠️ h5 et h6 posent un vrai problème de rendu public : `@tailwindcss/
# typography` ne les style PAS (la classe `prose` s'arrête à h4). Sans
# règle, un h5 se rendrait dans la page publique comme du texte courant, en
# gras — indiscernable d'un paragraphe. On les style donc explicitement des
# deux côtés : SCSS pour l'éditeur, `prose-h5:` / `prose-h6:` pour la vue.
#
# Usage :
#   bash step_mediatext_align_headings.sh
#   AKFC_APPLY_ONLY=1 bash step_mediatext_align_headings.sh
#
set -euo pipefail

MT="apps/web/src/features/page-builder/blocks/media-text"
VIEW="$MT/view.server.tsx"
PREVIEW="$MT/MediaTextPreview.tsx"
EDITOR="apps/web/src/features/page-builder/blocks/tiptap/builder-tiptap-editor.tsx"
HEADING="apps/web/src/features/editor-tiptap/node/heading-node/heading-node.scss"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$VIEW" "$PREVIEW" "$EDITOR" "$HEADING"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "h5" "$HEADING"; then
  echo "✓ déjà appliqué (marqueur présent dans $HEADING) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

MT      = "apps/web/src/features/page-builder/blocks/media-text"
VIEW    = "%s/view.server.tsx" % MT
PREVIEW = "%s/MediaTextPreview.tsx" % MT
EDITOR  = "apps/web/src/features/page-builder/blocks/tiptap/builder-tiptap-editor.tsx"
HEADING = "apps/web/src/features/editor-tiptap/node/heading-node/heading-node.scss"

ALIGN_COMMENT = """  // `items-start` et non `items-center` : le média s'aligne sur la PREMIÈRE
  // LIGNE du texte, comme en édition imprimée. Centrer les colonnes faisait
  // flotter l'image à mi-hauteur dès que le texte était plus long qu'elle, et
  // ouvrait le bloc sur un vide asymétrique."""

# ── 1/5 rendu public : aligner en haut ────────────────────────────────────
edit(VIEW, """  // Deux parties → deux colonnes, côté médias selon l'alternance.
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">""",
"""  // Deux parties → deux colonnes, côté médias selon l'alternance.
""" + ALIGN_COMMENT + """
  return (
    <div className="grid items-start gap-10 md:grid-cols-2">""")

# ── 2/5 aperçu du builder : la même chose ─────────────────────────────────
edit(PREVIEW, """  // Deux parties → deux colonnes, côté médias selon l'alternance, gouttière nette.
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">""",
"""  // Deux parties → deux colonnes, côté médias selon l'alternance, gouttière nette.
""" + ALIGN_COMMENT + """
  return (
    <div className="grid items-start gap-10 md:grid-cols-2">""")

# ── 3/5 rendu public : styler h5 et h6, que `prose` ignore ────────────────
edit(VIEW, """      className="tiptap-rendered prose max-w-none\"""",
"""      // `prose` s'arrête à h4 : sans ces deux variantes, un h5 ou un h6 se
      // rendrait comme du texte courant en gras, indiscernable d'un
      // paragraphe. On les pose explicitement.
      className="tiptap-rendered prose max-w-none prose-h5:text-base prose-h5:font-semibold prose-h5:mt-6 prose-h6:text-sm prose-h6:font-semibold prose-h6:uppercase prose-h6:tracking-wide prose-h6:mt-6\"""")

# ── 4/5 barre d'outils : exposer les six niveaux ──────────────────────────
edit(EDITOR, """            <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={false} />""",
"""            {/* StarterKit accepte déjà 1 à 6 — il n'y avait qu'à les
                exposer. Les styles suivent dans heading-node.scss (éditeur)
                et via les variantes `prose-h5:` / `prose-h6:` (vue). */}
            <HeadingDropdownMenu levels={[1, 2, 3, 4, 5, 6]} portal={false} />""")

# ── 5/5 éditeur : styler h5 et h6 (DERNIER fichier écrit) ─────────────────
edit(HEADING, """.tiptap.ProseMirror {
  h1,
  h2,
  h3,
  h4 {""",
""".tiptap.ProseMirror {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {""")

edit(HEADING, """  h4 {
    font-size: 1em;""",
"""  // h5 et h6 : sous la taille du texte courant, ils ne se distinguent plus
  // par l'échelle mais par la graisse et, pour h6, la casse — la convention
  // des sous-titres de rubrique en presse.
  h5 {
    font-size: 1em;
    font-weight: 600;
    margin-top: 1.5em;
  }

  h6 {
    font-size: 0.875em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 1.5em;
  }

  h4 {
    font-size: 1em;""")
PY

echo "✓ 6 substitutions appliquées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(page-builder): media aligne en tete de texte, titres jusqu'a h6

items-start remplace items-center dans le bloc media-text, cote vue
publique comme cote apercu : le media partage sa ligne de tete avec
le premier mot, convention de l'edition imprimee.

Le menu de titres expose les six niveaux (StarterKit les acceptait
deja). h5 et h6 sont styles explicitement des deux cotes -- la
classe prose de @tailwindcss/typography s'arrete a h4."

echo "✓ commité"
git log -1 --oneline