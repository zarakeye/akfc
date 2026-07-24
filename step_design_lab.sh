#!/usr/bin/env bash
#
# step_design_lab.sh
#
# Laboratoire de réglage du rendu des blocs — `/dashboard/design-lab`.
#
# ─── Le principe ───────────────────────────────────────────────────────────
#
# Un seul jeu de variables CSS gouverne TOUT le contenu produit par le
# builder. La vue publique, l'aperçu du builder et le laboratoire lisent les
# mêmes. Le laboratoire ne simule donc rien : il surcharge ces variables en
# style inline sur son conteneur, et la cascade fait le reste. Ce qu'on y
# voit est ce que la page publique rendra.
#
# Une fois le réglage trouvé, le laboratoire affiche le bloc CSS à recopier
# dans `globals.css`. Aucune persistance : le laboratoire sert à CHERCHER
# des valeurs, pas à les stocker — sinon deux sources de vérité, et la
# question « pourquoi la page ne ressemble pas au labo ? » deviendrait
# insoluble.
#
# ─── Deux partis pris de conception ────────────────────────────────────────
#
# 1. Tout l'espacement vertical passe par `margin-top`, jamais `margin-bottom`
#    (que la feuille remet à zéro). Avec les deux, la marge basse d'un
#    élément et la marge haute du suivant s'additionnent ou fusionnent selon
#    le contexte, et un curseur devient imprévisible.
#
# 2. Le filet vertical entre colonnes est peint en dégradé sur le conteneur,
#    pas en bordure sur une colonne. Une bordure suivrait l'ordre du DOM et
#    se retrouverait du mauvais côté quand `mediaSide` vaut « right »
#    (l'alternance inverse l'ordre visuel, pas l'ordre du DOM). Le dégradé,
#    lui, tombe toujours au milieu de la gouttière.
#
# ─── Spécificité ───────────────────────────────────────────────────────────
#
# `.akfc-prose` se pose EN PLUS de `prose`. Ses sélecteurs pèsent 0,1,1 — une
# classe et un élément — là où @tailwindcss/typography enveloppe les siens
# dans `:where()`, de spécificité nulle. Nos règles l'emportent donc sans un
# seul `!important`.
#
# Usage :
#   bash step_design_lab.sh
#   AKFC_APPLY_ONLY=1 bash step_design_lab.sh
#
set -euo pipefail

GLOBALS="apps/web/src/app/globals.css"
VIEW="apps/web/src/features/page-builder/blocks/media-text/view.server.tsx"
PREVIEW="apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"
PAGE="apps/web/src/app/(admin)/dashboard/design-lab/page.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$GLOBALS" "$VIEW" "$PREVIEW"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if [ -f "$PAGE" ]; then
  echo "✓ déjà appliqué ($PAGE existe) — rien à faire"
  exit 0
fi

mkdir -p "$(dirname "$LAB")" "$(dirname "$PAGE")"

python3 - <<'PY'
import io, os

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

def create(path, content):
    assert not os.path.exists(path), "existe déjà : %s" % path
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(content)
    print("  + %s" % path.rsplit('/', 1)[-1])

GLOBALS = "apps/web/src/app/globals.css"
VIEW    = "apps/web/src/features/page-builder/blocks/media-text/view.server.tsx"
PREVIEW = "apps/web/src/features/page-builder/blocks/media-text/MediaTextPreview.tsx"
LAB     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"
PAGE    = "apps/web/src/app/(admin)/dashboard/design-lab/page.tsx"

# ─────────────────────────────────────────────────────────────────────────
#  1/5  globals.css — les variables et la feuille commune
# ─────────────────────────────────────────────────────────────────────────
CSS = """

/* ── Rendu uniforme des blocs du builder ────────────────────────────────
   Un seul jeu de variables pour TOUT le contenu produit par le builder :
   la vue publique, l'aperçu du builder et le laboratoire de réglage
   (/dashboard/design-lab) lisent les mêmes. Régler ici, c'est régler
   partout.

   Les valeurs vivent sur `:root` pour qu'un conteneur intermédiaire
   puisse les surcharger par cascade — c'est exactement ce que fait le
   laboratoire, en style inline, sans toucher à ce fichier. */
:root {
  --akfc-leading: 1.65;
  --akfc-para-gap: 1em;
  --akfc-heading-gap: 1.8em;
  --akfc-h1: 2em;
  --akfc-h2: 1.5em;
  --akfc-h3: 1.25em;
  --akfc-h4: 1.05em;
  --akfc-h5: 1em;
  --akfc-h6: 0.875em;
  --akfc-column-gap: 2.5rem;
  --akfc-rule-width: 0px;
  --akfc-rule-color: color-mix(in oklch, currentColor 20%, transparent);
}

/* `.akfc-prose` se pose EN PLUS de `prose`. Ses sélecteurs pèsent 0,1,1
   quand @tailwindcss/typography enveloppe les siens dans `:where()`, de
   spécificité nulle : nos règles l'emportent sans aucun `!important`. */
.akfc-prose {
  line-height: var(--akfc-leading);
}

/* Modèle à UNE SEULE direction : tout l'espacement vertical passe par
   `margin-top`. Avec les deux marges, celle du bas d'un élément et celle
   du haut du suivant s'additionnent ou fusionnent selon le contexte, et
   un réglage au curseur devient imprévisible. */
.akfc-prose
  :is(p, ul, ol, blockquote, pre, figure, hr, h1, h2, h3, h4, h5, h6) {
  margin-bottom: 0;
}

.akfc-prose :is(p, ul, ol, blockquote, pre, figure) {
  margin-top: var(--akfc-para-gap);
}

.akfc-prose :is(h1, h2, h3, h4, h5, h6) {
  margin-top: var(--akfc-heading-gap);
  line-height: 1.2;
}

/* Le premier élément ne pousse rien : un bloc commence au ras de son
   conteneur, sans quoi le média et le texte cesseraient de partager leur
   ligne de tête. */
.akfc-prose > :first-child {
  margin-top: 0;
}

.akfc-prose h1 { font-size: var(--akfc-h1); }
.akfc-prose h2 { font-size: var(--akfc-h2); }
.akfc-prose h3 { font-size: var(--akfc-h3); }
.akfc-prose h4 { font-size: var(--akfc-h4); }
.akfc-prose h5 { font-size: var(--akfc-h5); }
.akfc-prose h6 { font-size: var(--akfc-h6); }

.akfc-prose hr {
  margin-top: var(--akfc-heading-gap);
  border-top-width: max(1px, var(--akfc-rule-width));
  border-color: var(--akfc-rule-color);
}

/* Filet vertical entre les deux colonnes d'un bloc media-text.
   PEINT SUR LE CONTENEUR, pas posé en bordure sur une colonne : une
   bordure suivrait l'ordre du DOM et se retrouverait du mauvais côté dès
   que `mediaSide` vaut « right », l'alternance inversant l'ordre visuel
   (`md:order-1` / `md:order-2`) mais pas l'ordre du DOM. Le dégradé, lui,
   tombe toujours au milieu de la gouttière.
   Épaisseur 0 par défaut : le filet ne s'affiche que si on le demande. */
@media (min-width: 768px) {
  .akfc-block-columns {
    background-image: linear-gradient(
      to right,
      var(--akfc-rule-color),
      var(--akfc-rule-color)
    );
    background-size: var(--akfc-rule-width) 100%;
    background-position: center top;
    background-repeat: no-repeat;
  }
}

/* Filet horizontal, à poser entre deux blocs successifs. */
.akfc-rule-h {
  border-top: max(1px, var(--akfc-rule-width)) solid var(--akfc-rule-color);
  padding-top: var(--akfc-heading-gap);
}
"""

with io.open(GLOBALS, 'a', encoding='utf-8') as fh:
    fh.write(CSS)
print("  ~ globals.css (feuille commune ajoutée)")

# ─────────────────────────────────────────────────────────────────────────
#  2/5  view.server.tsx — la vue publique consomme les variables
# ─────────────────────────────────────────────────────────────────────────
edit(VIEW, """      className="tiptap-rendered prose max-w-none prose-h5:""",
"""      className="akfc-prose tiptap-rendered prose max-w-none prose-h5:""")

edit(VIEW, """  return (
    <div className="grid items-start gap-10 md:grid-cols-2">""",
"""  return (
    // La gouttière passe par la variable : le laboratoire la règle, et le
    // filet vertical facultatif se peint au milieu (cf. globals.css).
    <div
      className="akfc-block-columns grid items-start md:grid-cols-2"
      style={{ gap: "var(--akfc-column-gap)" }}
    >""")

# ─────────────────────────────────────────────────────────────────────────
#  3/5  MediaTextPreview.tsx — l'aperçu consomme les MÊMES
# ─────────────────────────────────────────────────────────────────────────
# `prose-sm` disparaît : un aperçu qui rend le texte plus petit que la page
# publique n'est pas un aperçu. Les deux lisent désormais les mêmes tailles.
edit(PREVIEW, """      className="prose prose-sm max-w-none\"""",
"""      className="akfc-prose prose max-w-none\"""")

edit(PREVIEW, """  return (
    <div className="grid items-start gap-10 md:grid-cols-2">""",
"""  return (
    <div
      className="akfc-block-columns grid items-start md:grid-cols-2"
      style={{ gap: "var(--akfc-column-gap)" }}
    >""")

# ─────────────────────────────────────────────────────────────────────────
#  4/5  Le laboratoire
# ─────────────────────────────────────────────────────────────────────────
create(LAB, '''"use client";

import { useState, type CSSProperties, type JSX } from "react";

/**
 * Laboratoire de réglage du rendu des blocs.
 *
 * Les curseurs écrivent dans les VRAIES variables CSS du rendu
 * (`--akfc-*`, cf. globals.css), surchargées en style inline sur le
 * conteneur d'aperçu. Ce qu'on voit ici est donc ce que la page publique
 * rendra — aucune simulation, aucune feuille parallèle.
 *
 * Rien n'est persisté, délibérément. Le laboratoire sert à CHERCHER des
 * valeurs ; on les recopie ensuite dans `globals.css`, qui reste la seule
 * source de vérité. Deux sources rendraient insoluble la question
 * « pourquoi la page ne ressemble pas au labo ? ».
 */

type Knob = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  initial: number;
};

/** Les valeurs initiales reprennent celles de `:root` dans globals.css. */
const KNOBS: Knob[] = [
  { key: "--akfc-leading", label: "Interlignage", min: 1, max: 2.4, step: 0.05, unit: "", initial: 1.65 },
  { key: "--akfc-para-gap", label: "Écart entre paragraphes", min: 0, max: 3, step: 0.05, unit: "em", initial: 1 },
  { key: "--akfc-heading-gap", label: "Écart avant un titre", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.8 },
  { key: "--akfc-h1", label: "Taille h1", min: 1, max: 4, step: 0.05, unit: "em", initial: 2 },
  { key: "--akfc-h2", label: "Taille h2", min: 1, max: 3, step: 0.05, unit: "em", initial: 1.5 },
  { key: "--akfc-h3", label: "Taille h3", min: 0.9, max: 2.5, step: 0.05, unit: "em", initial: 1.25 },
  { key: "--akfc-h4", label: "Taille h4", min: 0.8, max: 2, step: 0.05, unit: "em", initial: 1.05 },
  { key: "--akfc-h5", label: "Taille h5", min: 0.7, max: 1.6, step: 0.05, unit: "em", initial: 1 },
  { key: "--akfc-h6", label: "Taille h6", min: 0.6, max: 1.4, step: 0.05, unit: "em", initial: 0.875 },
  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5 },
  { key: "--akfc-rule-width", label: "Épaisseur des filets", min: 0, max: 6, step: 1, unit: "px", initial: 0 },
];

const INITIAL: Record<string, number> = Object.fromEntries(
  KNOBS.map((k) => [k.key, k.initial]),
);

export function BlockStyleLab(): JSX.Element {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [side, setSide] = useState<"left" | "right">("left");

  // Les propriétés personnalisées ne sont pas dans le type CSSProperties de
  // React : le cast est la voie prévue pour les passer en style inline.
  const styleOverrides = Object.fromEntries(
    KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
  ) as CSSProperties;

  const cssSnippet = [
    ":root {",
    ...KNOBS.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`),
    "}",
  ].join("\\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* ─── Réglages ─────────────────────────────────────────────── */}
      <aside className="space-y-4 rounded-md border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Réglages</h2>
          <button
            type="button"
            onClick={() => setValues(INITIAL)}
            className="rounded border px-2 py-1 text-xs hover:bg-muted"
          >
            Réinitialiser
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Côté du média</span>
          <div className="flex gap-2">
            {(["left", "right"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={
                  side === s
                    ? "flex-1 rounded border border-foreground px-2 py-1 text-xs"
                    : "flex-1 rounded border px-2 py-1 text-xs hover:bg-muted"
                }
              >
                {s === "left" ? "Gauche" : "Droite"}
              </button>
            ))}
          </div>
        </div>

        {KNOBS.map((k) => (
          <label key={k.key} className="block space-y-1">
            <span className="flex justify-between text-xs">
              <span className="text-muted-foreground">{k.label}</span>
              <span className="font-mono">
                {values[k.key]}
                {k.unit}
              </span>
            </span>
            <input
              type="range"
              min={k.min}
              max={k.max}
              step={k.step}
              value={values[k.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [k.key]: Number(e.target.value) }))
              }
              className="w-full"
            />
          </label>
        ))}

        <div className="space-y-1 pt-2">
          <span className="text-xs text-muted-foreground">
            À recopier dans globals.css
          </span>
          <pre className="max-h-56 overflow-auto rounded bg-muted p-2 text-[10px] leading-snug">
            {cssSnippet}
          </pre>
        </div>
      </aside>

      {/* ─── Aperçu ───────────────────────────────────────────────── */}
      <div style={styleOverrides} className="space-y-8">
        <section
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
        </section>

        <section className="akfc-rule-h">
          <article className="akfc-prose prose max-w-none">
            <h2>Bloc pleine largeur</h2>
            <p>
              Ce second bloc est séparé du premier par un filet horizontal, et
              montre le rendu du texte sans colonne — le cas d&apos;un bloc
              tiptap seul.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non
              risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing
              nec, ultricies sed, dolor. Cras elementum ultrices diam.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}

/**
 * Rectangle neutre plutôt qu&apos;une vraie image : le laboratoire règle la
 * typographie et les espacements, pas le contenu. Un média réel ferait
 * dépendre l&apos;essai d&apos;un asset particulier et de sa disponibilité.
 */
function FakeMedia(): JSX.Element {
  return (
    <figure className="m-0">
      <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
        média
      </div>
      <figcaption className="mt-1 text-xs text-muted-foreground">
        Légende du média
      </figcaption>
    </figure>
  );
}

function SampleText(): JSX.Element {
  return (
    <>
      <h1>Titre de niveau 1</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
        odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
        quis sem at nibh elementum imperdiet.
      </p>
      <h2>Titre de niveau 2</h2>
      <p>
        Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue
        semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class
        aptent taciti sociosqu ad litora torquent per conubia nostra.
      </p>
      <p>
        Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.
        Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem
        at dolor. Maecenas mattis.
      </p>
      <h3>Titre de niveau 3</h3>
      <ul>
        <li>Premier élément de liste</li>
        <li>Deuxième élément, un peu plus long pour voir le retour à la ligne</li>
        <li>Troisième élément</li>
      </ul>
      <blockquote>
        Une citation, pour vérifier que son retrait et son interlignage
        suivent le reste du texte.
      </blockquote>
      <h4>Titre de niveau 4</h4>
      <p>
        Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet
        nec, imperdiet iaculis, ipsum.
      </p>
      <h5>Titre de niveau 5</h5>
      <p>Sed aliquam ultrices mauris. Integer ante arcu, accumsan a.</p>
      <h6>Titre de niveau 6</h6>
      <p>Consectetuer eget, posuere ut, mauris. Praesent adipiscing.</p>
      <hr />
      <p>Après un filet horizontal.</p>
    </>
  );
}
''')

# ─────────────────────────────────────────────────────────────────────────
#  5/5  La route (DERNIER fichier écrit — c'est lui que teste la garde)
# ─────────────────────────────────────────────────────────────────────────
create(PAGE, '''import type { JSX } from "react";

import { BlockStyleLab } from "@features/design-lab/BlockStyleLab";

/**
 * /dashboard/design-lab
 *
 * Outil interne : régler la typographie et les espacements du rendu des
 * blocs sur un contenu lorem ipsum, sans avoir à créer une page de test ni
 * à recharger après chaque essai.
 *
 * Les curseurs pilotent les VRAIES variables du rendu (`--akfc-*`), donc ce
 * qui est réglé ici vaut pour la vue publique comme pour l'aperçu du builder.
 */
export default function DesignLabPage(): JSX.Element {
  return (
    <div className="space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Laboratoire de rendu</h1>
        <p className="text-sm text-muted-foreground">
          Les curseurs modifient les variables CSS réellement utilisées par le
          rendu des blocs. Rien n&apos;est enregistré&nbsp;: une fois le
          réglage trouvé, recopiez le bloc CSS affiché dans{" "}
          <code className="rounded bg-muted px-1">globals.css</code>.
        </p>
      </header>

      <BlockStyleLab />
    </div>
  );
}
''')
PY

echo "✓ laboratoire créé, feuille commune posée"

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
git commit -m "feat(design-lab): laboratoire de reglage du rendu des blocs

Un seul jeu de variables CSS (--akfc-*) gouverne le contenu produit par
le builder : vue publique, apercu et laboratoire lisent les memes. Le
laboratoire les surcharge en inline, donc ce qu'il montre est ce que la
page rendra.

Tout l'espacement vertical passe par margin-top, jamais margin-bottom :
avec les deux, les marges s'additionnent ou fusionnent selon le contexte
et un curseur devient imprevisible.

Le filet vertical est peint en degrade sur le conteneur, pas en bordure
sur une colonne -- une bordure suivrait l'ordre du DOM et tomberait du
mauvais cote quand mediaSide vaut right.

L'apercu perd prose-sm : un apercu qui rend le texte plus petit que la
page publique n'en est pas un."

echo "✓ commité"
git log -1 --oneline
echo
echo "→ /dashboard/design-lab"