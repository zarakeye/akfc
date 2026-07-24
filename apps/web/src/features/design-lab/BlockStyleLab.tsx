"use client";

import { useEffect, useState, type CSSProperties, type JSX } from "react";

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

  // Le réglage enregistré, s'il existe, devient le point de départ des
  // curseurs — sinon on repartirait des valeurs de repli à chaque visite et
  // on croirait avoir perdu son travail.
  const saved = trpc.siteStyle.get.useQuery();
  const utils = trpc.useUtils();
  const saveMutation = trpc.siteStyle.save.useMutation({
    onSuccess: () => {
      void utils.siteStyle.get.invalidate();
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
  const styleOverrides = Object.fromEntries(
    KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
  ) as CSSProperties;

  const cssSnippet = [
    ":root {",
    ...KNOBS.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`),
    "}",
  ].join("\n");

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

        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() =>
            saveMutation.mutate({
              variables: Object.fromEntries(
                KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
              ),
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
            Équivalent CSS (pour figer ces valeurs comme repli dans
            globals.css)
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
