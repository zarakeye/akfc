#!/usr/bin/env bash
#
# step_blocks_shared_vars.sh
#
# Les cinq types de blocs lisent désormais les mêmes variables, et le
# laboratoire les couvre tous.
#
# ─── L'état de départ ──────────────────────────────────────────────────────
#
# Seul `media-text` consommait `--akfc-*`. Les trois autres vues codaient
# leurs espacements en dur : `gap-3` pour la galerie et l'audio, `gap-2` et
# `p-3` pour les documents, `text-sm` pour les légendes. Les afficher dans le
# laboratoire sans les brancher aurait produit une maquette que les curseurs
# ne pilotent pas — un laboratoire qui ment est pire qu'un laboratoire
# incomplet.
#
# ─── Le ratio média / texte devient réglable ──────────────────────────────
#
# `md:grid-cols-2` imposait 50/50. Il cède la place à deux variables de
# colonnes, posées EN LIGNE par le bloc et lues par une règle sous media
# query — un style inline ne peut pas porter de point de rupture, alors
# qu'une variable inline traverse très bien une media query.
#
# L'inversion gauche/droite se fait en échangeant les DEUX variables, pas en
# jouant sur `order` : avec des colonnes de largeurs différentes, `order`
# déplacerait le contenu sans déplacer les largeurs, et le média se
# retrouverait dans la colonne du texte.
#
# Usage :
#   bash step_blocks_shared_vars.sh
#   AKFC_APPLY_ONLY=1 bash step_blocks_shared_vars.sh
#
set -euo pipefail

B="apps/web/src/features/page-builder/blocks"
GLOBALS="apps/web/src/app/globals.css"
VIEW="$B/media-text/view.server.tsx"
PREVIEW="$B/media-text/MediaTextPreview.tsx"
GALLERY="$B/image-gallery/view.server.tsx"
AUDIO="$B/audio-collection/view.server.tsx"
DOCS="$B/document-list/view.server.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$VIEW" "$PREVIEW" "$GALLERY" "$AUDIO" "$DOCS" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
grep -q "akfc-block-columns" "$GLOBALS" || {
  echo "✗ step_design_lab.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "akfc-media-col" "$LAB"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAB) — rien à faire"
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

B       = "apps/web/src/features/page-builder/blocks"
GLOBALS = "apps/web/src/app/globals.css"
VIEW    = "%s/media-text/view.server.tsx" % B
PREVIEW = "%s/media-text/MediaTextPreview.tsx" % B
GALLERY = "%s/image-gallery/view.server.tsx" % B
AUDIO   = "%s/audio-collection/view.server.tsx" % B
DOCS    = "%s/document-list/view.server.tsx" % B
LAB     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/12 globals : les variables manquantes ───────────────────────────────
edit(GLOBALS, """  --akfc-column-gap: 2.5rem;""",
"""  --akfc-column-gap: 2.5rem;

  /* Largeurs des deux colonnes d'un bloc media-text, en parts de grille.
     Le bloc les pose EN LIGNE selon le côté du média (cf. view.server) ;
     ces valeurs ne sont que le repli. Exprimées en `fr` et non en
     pourcentage : la gouttière est alors retirée avant le partage, sinon
     le total dépasse la largeur disponible. */
  --akfc-col-1: 1fr;
  --akfc-col-2: 1fr;

  /* Blocs de collection : galerie, audio, documents. */
  --akfc-item-gap: 0.75rem;
  --akfc-card-padding: 0.75rem;
  --akfc-caption-size: 0.875rem;""")

edit(GLOBALS, """@media (min-width: 768px) {
  .akfc-block-columns {
    background-image: linear-gradient(""",
"""@media (min-width: 768px) {
  .akfc-block-columns {
    /* Le ratio vit ICI et non en style inline : un style inline ne peut pas
       porter de point de rupture, alors qu'une variable posée en inline
       traverse sans peine une media query. En dessous de 768px, la règle ne
       s'applique pas et la grille reste à une seule colonne. */
    grid-template-columns: var(--akfc-col-1) var(--akfc-col-2);
    background-image: linear-gradient(""")

# ── 2/12 media-text, vue publique ─────────────────────────────────────────
edit(VIEW, """    <div
      className="akfc-block-columns grid items-start md:grid-cols-2"
      style={{ gap: "var(--akfc-column-gap)" }}
    >""",
"""    <div
      className="akfc-block-columns grid items-start"
      style={
        {
          gap: "var(--akfc-column-gap)",
          // L'inversion gauche/droite échange les LARGEURS, elle ne joue pas
          // sur `order` : avec des colonnes inégales, `order` déplacerait le
          // contenu sans déplacer les largeurs — le média atterrirait dans
          // la colonne taillée pour le texte.
          "--akfc-col-1":
            mediaSide === "left"
              ? "var(--akfc-media-col)"
              : "var(--akfc-text-col)",
          "--akfc-col-2":
            mediaSide === "left"
              ? "var(--akfc-text-col)"
              : "var(--akfc-media-col)",
        } as CSSProperties
      }
    >""")

edit(VIEW, """  // Deux parties → deux colonnes, côté médias selon l'alternance.""",
"""  // Deux parties → deux colonnes, côté médias selon l'alternance.
  // `order` disparaît : les largeurs étant portées par les variables, c'est
  // l'ORDRE DU DOM qui décide, et il suffit de le construire dans le bon
  // sens (cf. plus bas).""")

# ── 3/12 media-text : l'ordre DOM remplace `order` ────────────────────────
edit(VIEW, """      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}""",
"""      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}""")

# ── 4/12 media-text : l'import du type ────────────────────────────────────
edit(VIEW, """import { generateHTML } from "@tiptap/html";""",
"""import type { CSSProperties } from "react";
import { generateHTML } from "@tiptap/html";""")

# ── 5/12 aperçu du builder : le même traitement ───────────────────────────
edit(PREVIEW, """    <div
      className="akfc-block-columns grid items-start md:grid-cols-2"
      style={{ gap: "var(--akfc-column-gap)" }}
    >""",
"""    <div
      className="akfc-block-columns grid items-start"
      style={
        {
          gap: "var(--akfc-column-gap)",
          "--akfc-col-1":
            mediaSide === "left"
              ? "var(--akfc-media-col)"
              : "var(--akfc-text-col)",
          "--akfc-col-2":
            mediaSide === "left"
              ? "var(--akfc-text-col)"
              : "var(--akfc-media-col)",
        } as CSSProperties
      }
    >""")

edit(PREVIEW, """      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div className="md:order-2">{MediaColumn}</div>
          <div className="md:order-1">{TextColumn}</div>
        </>
      )}""",
"""      {mediaSide === "left" ? (
        <>
          <div>{MediaColumn}</div>
          <div>{TextColumn}</div>
        </>
      ) : (
        <>
          <div>{TextColumn}</div>
          <div>{MediaColumn}</div>
        </>
      )}""")

edit(PREVIEW, """import { useEffect, useState, type JSX } from "react";""",
"""import { useEffect, useState, type CSSProperties, type JSX } from "react";""")

# ── 6/12 galerie ──────────────────────────────────────────────────────────
edit(GALLERY, """        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">""",
"""        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "var(--akfc-item-gap)" }}
        >""")

edit(GALLERY, """        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">""",
"""        <div
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2"
          style={{ gap: "var(--akfc-item-gap)" }}
        >""")

edit(GALLERY, """        <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {items.map(({ item, media }) => (
            <div key={item.mediaId} className="mb-3 break-inside-avoid">""",
"""        <div
          className="columns-1 sm:columns-2 lg:columns-3"
          style={{ gap: "var(--akfc-item-gap)" }}
        >
          {items.map(({ item, media }) => (
            <div
              key={item.mediaId}
              className="break-inside-avoid"
              style={{ marginBottom: "var(--akfc-item-gap)" }}
            >""")

edit(GALLERY, """        <figcaption className="mt-1 text-sm text-muted-foreground">""",
"""        <figcaption
          className="mt-1 text-muted-foreground"
          style={{ fontSize: "var(--akfc-caption-size)" }}
        >""")

# ── 7/12 audio ────────────────────────────────────────────────────────────
edit(AUDIO, """    <ul className="flex flex-col gap-3">
      {items.map(({ item, media }) => (
        <li
          key={item.mediaId}
          className="rounded-md border border-border bg-card p-3"
        >""",
"""    <ul
      className="flex flex-col"
      style={{ gap: "var(--akfc-item-gap)" }}
    >
      {items.map(({ item, media }) => (
        <li
          key={item.mediaId}
          className="rounded-md border border-border bg-card"
          style={{ padding: "var(--akfc-card-padding)" }}
        >""")

# ── 8/12 documents ────────────────────────────────────────────────────────
edit(DOCS, """    <ul className="flex flex-col gap-2">""",
"""    <ul
      className="flex flex-col"
      style={{ gap: "var(--akfc-item-gap)" }}
    >""")

edit(DOCS, """            className="flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted\"""",
"""            className="flex items-center gap-3 rounded-md border border-border bg-card transition-colors hover:bg-muted"
            style={{ padding: "var(--akfc-card-padding)" }}""")

# ── 9/12 laboratoire : le ratio en préréglages ────────────────────────────
edit(LAB, """/** Les valeurs initiales reprennent celles de `:root` dans globals.css. */""",
"""/**
 * Ratio média / texte, en parts de grille.
 *
 * Des PRÉRÉGLAGES et non un curseur au pourcent : sur cent et une valeurs,
 * quatre ou cinq sont bonnes, et les autres ne font que désaligner les pages
 * les unes par rapport aux autres. Un site tient sa cohérence d'une grille
 * commune, pas d'un réglage fin par bloc.
 *
 * Les parts sont exprimées en douzièmes — la trame la plus courante en
 * édition, divisible par 2, 3, 4 et 6.
 */
const RATIOS: { label: string; media: string; text: string; hint: string }[] = [
  { label: "1/3 – 2/3", media: "4fr", text: "8fr", hint: "texte dominant" },
  { label: "5/12 – 7/12", media: "5fr", text: "7fr", hint: "texte légèrement dominant" },
  { label: "1/2 – 1/2", media: "6fr", text: "6fr", hint: "symétrique" },
  { label: "7/12 – 5/12", media: "7fr", text: "5fr", hint: "média légèrement dominant" },
  { label: "2/3 – 1/3", media: "8fr", text: "4fr", hint: "média dominant" },
];

/** Les valeurs initiales reprennent celles de `:root` dans globals.css. */""")

edit(LAB, """  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [side, setSide] = useState<"left" | "right">("left");""",
"""  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [side, setSide] = useState<"left" | "right">("left");
  const [ratioIndex, setRatioIndex] = useState(1);""")

edit(LAB, """  const styleOverrides = Object.fromEntries(
    KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
  ) as CSSProperties;""",
"""  const ratio = RATIOS[ratioIndex];

  const styleOverrides = {
    ...Object.fromEntries(KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`])),
    "--akfc-media-col": ratio.media,
    "--akfc-text-col": ratio.text,
  } as CSSProperties;""")

edit(LAB, """  const cssSnippet = [
    ":root {",
    ...KNOBS.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`),
    "}",
  ].join("\\n");""",
"""  const cssSnippet = [
    ":root {",
    ...KNOBS.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`),
    `  --akfc-media-col: ${ratio.media};`,
    `  --akfc-text-col: ${ratio.text};`,
    "}",
  ].join("\\n");""")

edit(LAB, """            saveMutation.mutate({
              variables: Object.fromEntries(
                KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
              ),
            })""",
"""            saveMutation.mutate({
              variables: {
                ...Object.fromEntries(
                  KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
                ),
                "--akfc-media-col": ratio.media,
                "--akfc-text-col": ratio.text,
              },
            })""")

# ── 10/12 laboratoire : le sélecteur de ratio ─────────────────────────────
edit(LAB, """        {KNOBS.map((k) => (""",
"""        <div className="space-y-1">
          <span className="flex justify-between text-xs">
            <span className="text-muted-foreground">Ratio média / texte</span>
            <span className="font-mono">{ratio.label}</span>
          </span>
          <input
            type="range"
            min={0}
            max={RATIOS.length - 1}
            step={1}
            value={ratioIndex}
            onChange={(e) => setRatioIndex(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-[10px] text-muted-foreground">{ratio.hint}</span>
        </div>

        {KNOBS.map((k) => (""")

# ── 11/12 laboratoire : le ratio pilote l'aperçu ──────────────────────────
edit(LAB, """        <section
          className="akfc-block-columns grid items-start md:grid-cols-2"
          style={{ gap: "var(--akfc-column-gap)" }}
        >
          <div className={side === "right" ? "md:order-2" : undefined}>
            <FakeMedia />
          </div>
          <div className={side === "right" ? "md:order-1" : undefined}>
            <article className="akfc-prose prose max-w-none">
              <SampleText />
            </article>
          </div>
        </section>""",
"""        <section
          className="akfc-block-columns grid items-start"
          style={
            {
              gap: "var(--akfc-column-gap)",
              "--akfc-col-1":
                side === "left"
                  ? "var(--akfc-media-col)"
                  : "var(--akfc-text-col)",
              "--akfc-col-2":
                side === "left"
                  ? "var(--akfc-text-col)"
                  : "var(--akfc-media-col)",
            } as CSSProperties
          }
        >
          {side === "left" ? (
            <>
              <FakeMedia />
              <article className="akfc-prose prose max-w-none">
                <SampleText />
              </article>
            </>
          ) : (
            <>
              <article className="akfc-prose prose max-w-none">
                <SampleText />
              </article>
              <FakeMedia />
            </>
          )}
        </section>""")

# ── 12/12 laboratoire : les trois autres blocs (DERNIER écrit) ────────────
edit(LAB, """        <section className="akfc-rule-h">
          <article className="akfc-prose prose max-w-none">
            <h2>Bloc pleine largeur</h2>""",
"""        {/* Les trois blocs de collection. Ils lisent les mêmes variables que
            le reste depuis que leurs vues ont cessé de coder leurs
            espacements en dur — sans quoi les curseurs n'auraient eu aucune
            prise sur eux et le laboratoire aurait montré du faux. */}
        <section className="akfc-rule-h space-y-6">
          <div>
            <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Galerie d&apos;images
            </h3>
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3"
              style={{ gap: "var(--akfc-item-gap)" }}
            >
              {[0, 1, 2].map((i) => (
                <figure key={i} className="m-0">
                  <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    image {i + 1}
                  </div>
                  <figcaption
                    className="mt-1 text-muted-foreground"
                    style={{ fontSize: "var(--akfc-caption-size)" }}
                  >
                    Légende de l&apos;image {i + 1}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Collection audio
            </h3>
            <ul
              className="flex flex-col"
              style={{ gap: "var(--akfc-item-gap)" }}
            >
              {[0, 1].map((i) => (
                <li
                  key={i}
                  className="rounded-md border border-border bg-card"
                  style={{ padding: "var(--akfc-card-padding)" }}
                >
                  <p className="mb-2 text-sm font-medium">Piste {i + 1}</p>
                  <div className="h-8 rounded bg-muted" />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Liste de documents
            </h3>
            <ul
              className="flex flex-col"
              style={{ gap: "var(--akfc-item-gap)" }}
            >
              {[0, 1].map((i) => (
                <li key={i}>
                  <span
                    className="flex items-center gap-3 rounded-md border border-border bg-card"
                    style={{ padding: "var(--akfc-card-padding)" }}
                  >
                    <span className="h-5 w-5 shrink-0 rounded bg-muted" />
                    <span className="flex-1 text-sm">
                      Document {i + 1}.pdf
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="akfc-rule-h">
          <article className="akfc-prose prose max-w-none">
            <h2>Bloc pleine largeur</h2>""")
PY

echo "✓ 20 substitutions appliquées"

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
git commit -m "feat(design-lab): les cinq types de blocs lisent les memes variables

Galerie, audio et documents codaient leurs espacements en dur : les
montrer dans le laboratoire sans les brancher aurait affiche une
maquette que les curseurs ne pilotent pas.

Le ratio media/texte cesse d'etre fige a 50/50. Il passe par deux
variables de colonnes posees en ligne et lues sous media query -- un
style inline ne peut pas porter de point de rupture, une variable
inline traverse la media query sans peine.

L'inversion gauche/droite echange les LARGEURS et non plus l'ordre
CSS : avec des colonnes inegales, order deplacerait le contenu sans
deplacer les largeurs."

echo "✓ commité"
git log -1 --oneline