"use client";

import { useEffect, useState, type CSSProperties, type JSX } from "react";
import { useRouter } from "next/navigation";

import { trpc } from "@/core/trpc/trpcClient";

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
  /**
   * Identifiant de la zone d'aperçu que ce réglage modifie. Cliquer le
   * libellé y amène la colonne de droite — un réglage dont on ne voit pas
   * l'effet ne se règle pas.
   */
  anchor: string;
};

/**
 * Amène une zone de l'aperçu à l'écran.
 *
 * `scrollIntoView` remonte de lui-même jusqu'au premier ancêtre défilant —
 * la colonne d'aperçu — sans référence à lui passer ni position à
 * recalculer quand la mise en page change.
 * `center` et non `start` : la cible arrive au milieu, avec son contexte
 * au-dessus et en dessous. C'est le point du geste — comparer.
 */
function scrollToAnchor(id: string): void {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
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

/** Les valeurs initiales reprennent celles de `:root` dans globals.css. */
const KNOBS: Knob[] = [
  { key: "--akfc-leading", label: "Interlignage", min: 1, max: 2.4, step: 0.05, unit: "", initial: 1.65, anchor: "lab-texte" },
  { key: "--akfc-para-gap", label: "Écart entre paragraphes", min: 0, max: 3, step: 0.05, unit: "em", initial: 1, anchor: "lab-texte" },
  { key: "--akfc-heading-gap", label: "Écart avant un titre", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.8, anchor: "lab-titres" },
  { key: "--akfc-list-gap", label: "Écart entre puces", min: 0, max: 1.5, step: 0.05, unit: "em", initial: 0.35, anchor: "lab-listes" },
  { key: "--akfc-list-indent", label: "Retrait des puces", min: 0, max: 4, step: 0.1, unit: "em", initial: 1.5, anchor: "lab-listes" },
  { key: "--akfc-block-gap-max", label: "Écart entre blocs (max)", min: 1, max: 8, step: 0.25, unit: "rem", initial: 4, anchor: "lab-blocs" },
  { key: "--akfc-h1", label: "Taille h1", min: 1, max: 4, step: 0.05, unit: "em", initial: 2, anchor: "lab-titres" },
  { key: "--akfc-h2", label: "Taille h2", min: 1, max: 3, step: 0.05, unit: "em", initial: 1.5, anchor: "lab-titres" },
  { key: "--akfc-h3", label: "Taille h3", min: 0.9, max: 2.5, step: 0.05, unit: "em", initial: 1.25, anchor: "lab-titres" },
  { key: "--akfc-h4", label: "Taille h4", min: 0.8, max: 2, step: 0.05, unit: "em", initial: 1.05, anchor: "lab-titres-bas" },
  { key: "--akfc-h5", label: "Taille h5", min: 0.7, max: 1.6, step: 0.05, unit: "em", initial: 1, anchor: "lab-titres-bas" },
  { key: "--akfc-h6", label: "Taille h6", min: 0.6, max: 1.4, step: 0.05, unit: "em", initial: 0.875, anchor: "lab-titres-bas" },
  { key: "--akfc-page-max-width", label: "Largeur maximale de page", min: 48, max: 96, step: 1, unit: "rem", initial: 68, anchor: "lab-colonnes" },
  { key: "--akfc-base-max", label: "Taille du texte (grand écran)", min: 1, max: 1.5, step: 0.05, unit: "rem", initial: 1.25, anchor: "lab-texte" },
  { key: "--akfc-measure", label: "Justification (caractères)", min: 45, max: 90, step: 1, unit: "ch", initial: 68, anchor: "lab-pleine-largeur" },
  { key: "--akfc-column-gap", label: "Gouttière entre colonnes", min: 0, max: 8, step: 0.25, unit: "rem", initial: 2.5, anchor: "lab-colonnes" },
  { key: "--akfc-rule-width", label: "Épaisseur des filets", min: 0, max: 6, step: 1, unit: "px", initial: 0, anchor: "lab-blocs" },
  // Ces trois-là manquaient : les blocs de collection figuraient dans
  // l'aperçu sans qu'aucun curseur ne les atteigne.
  { key: "--akfc-item-gap", label: "Écart entre éléments (collections)", min: 0, max: 3, step: 0.05, unit: "rem", initial: 0.75, anchor: "lab-collections" },
  { key: "--akfc-card-padding", label: "Rembourrage des cartes", min: 0, max: 2.5, step: 0.05, unit: "rem", initial: 0.75, anchor: "lab-collections" },
  { key: "--akfc-caption-size", label: "Taille des légendes", min: 0.6, max: 1.2, step: 0.025, unit: "rem", initial: 0.875, anchor: "lab-collections" },
];

const INITIAL: Record<string, number> = Object.fromEntries(
  KNOBS.map((k) => [k.key, k.initial]),
);

export function BlockStyleLab(): JSX.Element {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [side, setSide] = useState<"left" | "right">("left");
  const [ratioIndex, setRatioIndex] = useState(1);
  const [previewWidth, setPreviewWidth] = useState<string>("100%");

  // Le réglage enregistré, s'il existe, devient le point de départ des
  // curseurs — sinon on repartirait des valeurs de repli à chaque visite et
  // on croirait avoir perdu son travail.
  const router = useRouter();
  const saved = trpc.siteStyle.get.useQuery();
  const utils = trpc.useUtils();
  const saveMutation = trpc.siteStyle.save.useMutation({
    onSuccess: () => {
      void utils.siteStyle.get.invalidate();

      // Le layout racine injecte la surcharge : une page déjà rendue la
      // porterait figée. On demande sa régénération.
      //
      // Sans `await` et sans `catch` bloquant, délibérément : l'invalidation
      // est un confort, pas une condition de succès. Si elle échoue, le
      // réglage est enregistré quand même et une régénération ordinaire le
      // rattrapera — inutile d'annoncer un échec pour ça.
      void fetch("/api/admin/revalidate-style", { method: "POST" })
        .then(() => {
          // APRÈS l'invalidation serveur, jamais avant : `router.refresh()`
          // vide le cache de routeur et redemande le rendu — s'il partait
          // en premier, il rapporterait la version périmée.
          //
          // Nécessaire parce qu'un layout n'est PAS re-rendu lors d'une
          // navigation côté client : la surcharge, injectée par le layout
          // racine, resterait celle du chargement initial jusqu'à ce qu'on
          // recharge la page à la main.
          router.refresh();
        })
        .catch(() => undefined);
    },
  });

  useEffect(() => {
    const stored = saved.data;
    if (!stored) return;
    setValues((current) => {
      const next = { ...current };
      for (const knob of KNOBS) {
        const raw = stored[knob.key];
        if (raw === undefined) continue;
        // La base stocke « 1.65 » ou « 2.5rem » : on retire l'unité, le
        // curseur ne manipule que le nombre.
        const parsed = Number.parseFloat(raw);
        if (!Number.isNaN(parsed)) next[knob.key] = parsed;
      }
      return next;
    });
  }, [saved.data]);

  // Les propriétés personnalisées ne sont pas dans le type CSSProperties de
  // React : le cast est la voie prévue pour les passer en style inline.
  const ratio = RATIOS[ratioIndex];

  const styleOverrides = {
    ...Object.fromEntries(KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`])),
    "--akfc-media-col": ratio.media,
    "--akfc-text-col": ratio.text,
  } as CSSProperties;

  const cssSnippet = [
    ":root {",
    ...KNOBS.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`),
    `  --akfc-media-col: ${ratio.media};`,
    `  --akfc-text-col: ${ratio.text};`,
    "}",
  ].join("\n");

  return (
    <div className="grid gap-6 lg:h-full lg:min-h-0 lg:grid-cols-[280px_1fr]">
      {/* ─── Réglages ─────────────────────────────────────────────── */}
      {/* `min-h-0` puis `overflow-y-auto` : le premier autorise la colonne à
          être plus courte que son contenu, le second lui donne sa barre.
          L'un sans l'autre ne produit rien. */}
      <aside className="space-y-4 rounded-md border border-border p-4 lg:min-h-0 lg:overflow-y-auto">
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

        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() =>
            saveMutation.mutate({
              variables: {
                ...Object.fromEntries(
                  KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
                ),
                "--akfc-media-col": ratio.media,
                "--akfc-text-col": ratio.text,
              },
            })
          }
          className="w-full rounded border border-foreground px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
        >
          {saveMutation.isPending
            ? "Enregistrement…"
            : "Appliquer au site"}
        </button>

        {saveMutation.isSuccess && (
          <p className="text-xs text-muted-foreground">
            Réglage enregistré. Rechargez une page du site pour le voir
            appliqué&nbsp;: la surcharge est injectée au rendu serveur.
          </p>
        )}
        {saveMutation.isError && (
          <p className="text-xs text-destructive">
            Échec de l&apos;enregistrement : {saveMutation.error.message}
          </p>
        )}

        <p className="text-[10px] leading-snug text-muted-foreground">
          Cliquez le nom d&apos;un réglage pour amener l&apos;aperçu à
          l&apos;endroit où il se voit.
        </p>

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

        <div className="space-y-1">
          <span className="flex justify-between text-xs">
            <button
              type="button"
              onClick={() => scrollToAnchor("lab-colonnes")}
              title="Aller à l'endroit où ce réglage se voit"
              className="text-left text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
            >
              Ratio média / texte
            </button>
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

        {KNOBS.map((k) => (
          <label key={k.key} className="block space-y-1">
            <span className="flex justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => scrollToAnchor(k.anchor)}
                title="Aller à l'endroit où ce réglage se voit"
                className="truncate text-left text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
              >
                {k.label}
              </button>
              <span className="shrink-0 font-mono">
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
            Équivalent CSS (pour figer ces valeurs comme repli dans
            globals.css)
          </span>
          <pre className="max-h-56 overflow-auto rounded bg-muted p-2 text-[10px] leading-snug">
            {cssSnippet}
          </pre>
        </div>
      </aside>

      {/* ─── Aperçu ───────────────────────────────────────────────── */}
      {/* La largeur est bridée par `maxWidth` et non par une simulation
          d'écran : les blocs réagissent à la largeur de leur CONTENEUR
          (container query), donc rétrécir ce cadre reproduit fidèlement ce
          qui se passera sur un écran de cette taille. Un iframe ou une
          fausse fenêtre n'aurait rien montré de plus. */}
      {/* Colonne d'aperçu : le sélecteur de largeur reste fixe en tête
          (`shrink-0`), seul le contenu défile — sinon il disparaîtrait dès
          qu'on descend, alors qu'on le compare en permanence. */}
      <div className="flex flex-col gap-3 lg:min-h-0">
        <div className="flex shrink-0 items-center gap-2 text-xs">
          <span className="text-muted-foreground">Largeur d&apos;aperçu</span>
          {(
            [
              { label: "Téléphone", w: "24rem" },
              { label: "Tablette", w: "48rem" },
              { label: "Portable", w: "64rem" },
              { label: "Large", w: "100%" },
            ] as const
          ).map((v) => (
            <button
              key={v.label}
              type="button"
              onClick={() => setPreviewWidth(v.w)}
              className={
                previewWidth === v.w
                  ? "rounded border border-foreground px-2 py-1"
                  : "rounded border px-2 py-1 hover:bg-muted"
              }
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* `akfc-page` sur le cadre d'aperçu : le laboratoire montre le
            puits AVEC ses marges, sinon on réglerait leur largeur sans
            jamais les voir. */}
        <div
          style={{ ...styleOverrides, maxWidth: previewWidth }}
          className="border-l border-dashed border-border pl-3 transition-[max-width] lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
        >
          {/* `space-y-8` ignorait la variable : le curseur d'écart entre
              blocs aurait bougé sans rien changer à l'écran. */}
          <div
            className="akfc-page flex flex-col"
            style={{ gap: "var(--akfc-block-gap)" }}
          >
        <section id="lab-colonnes" className="akfc-block-scope">
        <div
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
        </div>
        </section>

        {/* Les trois blocs de collection. Ils lisent les mêmes variables que
            le reste depuis que leurs vues ont cessé de coder leurs
            espacements en dur — sans quoi les curseurs n'auraient eu aucune
            prise sur eux et le laboratoire aurait montré du faux. */}
        {/* Ce bloc PERD son filet, volontairement : il faut au moins une
            frontière nue pour lire l'écart entre blocs seul. Le suivant
            garde le sien, et montre l'autre cas. */}
        <section id="lab-blocs" className="space-y-6">
          <div>
            <h3
              id="lab-collections"
              className="mb-2 text-xs uppercase tracking-wide text-muted-foreground"
            >
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

        <section id="lab-pleine-largeur" className="akfc-rule-h">
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
      <h1 id="lab-titres">Titre de niveau 1</h1>
      <p id="lab-texte">
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
      <ul id="lab-listes">
        <li>Premier élément de liste</li>
        <li>
          Deuxième élément, un peu plus long pour voir le retour à la ligne
          {/* Une sous-liste : c'est là qu'on voit si le retrait et l'écart
              se composent proprement sur deux niveaux. */}
          <ul>
            <li>Sous-élément</li>
            <li>Autre sous-élément</li>
          </ul>
        </li>
        <li>Troisième élément</li>
      </ul>
      <ol>
        <li>Élément numéroté</li>
        <li>Deuxième élément numéroté</li>
      </ol>
      <blockquote>
        Une citation, pour vérifier que son retrait et son interlignage
        suivent le reste du texte.
      </blockquote>
      <h4 id="lab-titres-bas">Titre de niveau 4</h4>
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
