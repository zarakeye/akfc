#!/usr/bin/env bash
#
# step_site_style_persist.sh
#
# Le laboratoire enregistre son réglage, et le réglage s'applique au site.
# Plus de recopie à la main.
#
# ─── Pourquoi j'avais dit l'inverse, et pourquoi j'avais tort ──────────────
#
# Ma crainte était d'avoir deux sources de vérité — le CSS d'un côté, un
# état persisté de l'autre — et de ne plus pouvoir répondre à « pourquoi la
# page ne ressemble pas au labo ? ». Cette crainte est fondée, mais elle
# n'interdit pas la persistance : elle impose de désigner UNE source.
#
# C'est la base de données. `globals.css` ne garde ses `--akfc-*` que comme
# valeurs de repli — ce que le site rend quand rien n'a jamais été
# enregistré. Dès qu'une ligne existe, elle gagne, partout et pour tout le
# monde. Une seule source, hiérarchie explicite.
#
# ─── Comment la surcharge gagne, sans `!important` ────────────────────────
#
# Le layout racine injecte un `<style>` avec le sélecteur `html:root`, qui
# pèse 0,0,2 là où le `:root` de globals.css pèse 0,0,1. La surcharge
# l'emporte donc par spécificité et non par ordre d'apparition — Next
# déplace les feuilles au gré du bundling, se fier à l'ordre serait fragile.
#
# ─── Migration ────────────────────────────────────────────────────────────
#
# Le SQL est écrit à la main : l'utilisateur Postgres du projet n'a pas
# CREATEDB, donc `prisma migrate dev` est hors de portée. À appliquer avec
# `pnpm prisma migrate deploy` puis `pnpm prisma generate`.
#
# ⚠️ Ce script NE lance PAS la migration — il l'écrit. Les typechecks
# échoueraient tant que le client Prisma n'est pas régénéré, donc la
# séquence est : lancer ce script, appliquer la migration, régénérer, puis
# relancer le script pour qu'il commite.
#
# Usage :
#   bash step_site_style_persist.sh
#   AKFC_APPLY_ONLY=1 bash step_site_style_persist.sh
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
MIGDIR="prisma/migrations/20260724000000_site_style"
ROUTER="packages/backend/src/modules/siteStyle/router.ts"
INDEX="packages/backend/src/modules/index.ts"
LAYOUT="apps/web/src/app/layout.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"
SIDEBAR="apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$SCHEMA" "$INDEX" "$LAYOUT" "$SIDEBAR"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done
[ -f "$LAB" ] || { echo "✗ step_design_lab.sh doit être appliqué d'abord"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "design-lab" "$SIDEBAR"; then
  echo "✓ déjà appliqué (marqueur présent dans $SIDEBAR) — rien à faire"
  exit 0
fi

mkdir -p "$MIGDIR" "$(dirname "$ROUTER")"

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
    print("  + %s" % path)

SCHEMA  = "prisma/schema.prisma"
MIGDIR  = "prisma/migrations/20260724000000_site_style"
ROUTER  = "packages/backend/src/modules/siteStyle/router.ts"
INDEX   = "packages/backend/src/modules/index.ts"
LAYOUT  = "apps/web/src/app/layout.tsx"
LAB     = "apps/web/src/features/design-lab/BlockStyleLab.tsx"
SIDEBAR = "apps/web/src/features/app-shell/ControlPanelSidebar.tsx"

# ── 1/7 modèle Prisma ─────────────────────────────────────────────────────
with io.open(SCHEMA, 'a', encoding='utf-8') as fh:
    fh.write('''
/// Réglage typographique du rendu des blocs du builder.
///
/// Ligne UNIQUE (id figé à 1) : ce réglage vaut pour tout le site, il n'y a
/// rien à multiplier. `variables` porte les `--akfc-*` sous forme
/// { "--akfc-leading": "1.65", … } — un JSON plutôt qu'une colonne par
/// variable, pour qu'ajouter un curseur au laboratoire ne demande pas une
/// migration.
///
/// Source de vérité : cette ligne. Les valeurs de `globals.css` ne servent
/// que de repli, tant qu'aucun réglage n'a été enregistré.
model SiteStyle {
  id        Int      @id @default(1)
  variables Json
  updatedAt DateTime @updatedAt
}
''')
print("  ~ schema.prisma (modèle SiteStyle)")

# ── 2/7 migration écrite à la main ────────────────────────────────────────
create("%s/migration.sql" % MIGDIR, '''-- Réglage typographique du site (ligne unique, id = 1).
-- Écrit à la main : l'utilisateur Postgres du projet n'a pas CREATEDB,
-- donc `prisma migrate dev` n'est pas utilisable ici.
CREATE TABLE "SiteStyle" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "variables" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStyle_pkey" PRIMARY KEY ("id")
);
''')

# ── 3/7 routeur ───────────────────────────────────────────────────────────
create(ROUTER, '''import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "@backend/trpc/core";

/**
 * Réglage typographique du rendu des blocs.
 *
 * Une seule ligne, `id = 1`. La lecture est PUBLIQUE parce que le layout
 * racine l'injecte pour tout visiteur : le réglage gouverne l'apparence du
 * site, pas des données privées. L'écriture reste protégée.
 */

/**
 * Le nom d'une propriété personnalisée CSS, contraint au préfixe du projet.
 *
 * Cette valeur finit dans une balise `<style>` : sans contrainte, un nom
 * arbitraire permettrait d'y écrire n'importe quoi. On n'accepte donc que
 * `--akfc-` suivi de minuscules et de tirets, et une valeur sans caractère
 * capable de refermer la déclaration ou la balise.
 */
const variableName = z
  .string()
  .regex(/^--akfc-[a-z0-9-]{1,40}$/, "Nom de variable non conforme");

const variableValue = z
  .string()
  .max(64)
  .regex(/^[a-zA-Z0-9 .,%()#/_-]*$/, "Valeur de variable non conforme");

export const siteStyleRouter = router({
  /** Le réglage courant, ou `null` si rien n'a jamais été enregistré. */
  get: publicProcedure.query(async ({ ctx }) => {
    const row = await ctx.prisma.siteStyle.findUnique({ where: { id: 1 } });
    return row ? (row.variables as Record<string, string>) : null;
  }),

  /**
   * Enregistre le réglage. Remplace la ligne entière plutôt que de fusionner :
   * le laboratoire envoie toujours le jeu complet, et une fusion laisserait
   * traîner des variables retirées d'une version à l'autre.
   */
  save: protectedProcedure
    .input(z.object({ variables: z.record(variableName, variableValue) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.siteStyle.upsert({
        where: { id: 1 },
        create: { id: 1, variables: input.variables },
        update: { variables: input.variables },
      });
      return { success: true };
    }),
});
''')

# ── 4/7 enregistrement dans la racine du routeur ──────────────────────────
edit(INDEX, """import { breakingNewsRouter } from "@backend/modules/breakingNews/router";""",
"""import { breakingNewsRouter } from "@backend/modules/breakingNews/router";
import { siteStyleRouter } from "@backend/modules/siteStyle/router";""")

edit(INDEX, """export const appRouter = router({
  auth: authRouter,""",
"""export const appRouter = router({
  siteStyle: siteStyleRouter,
  auth: authRouter,""")

# ── 5/7 injection dans le layout racine ───────────────────────────────────
edit(LAYOUT, """import { AppProviders } from "@app/providers\"""",
"""import { prisma } from "@backend/prisma"
import { AppProviders } from "@app/providers\"""")

edit(LAYOUT, """export default function RootLayout({
  children,
}: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>""",
"""/**
 * Sérialise le réglage enregistré en déclaration CSS.
 *
 * Sélecteur `html:root` et non `:root` : il pèse 0,0,2 contre 0,0,1, donc la
 * surcharge l'emporte par SPÉCIFICITÉ et non par ordre d'apparition. Next
 * déplace les feuilles au gré du bundling — se fier à l'ordre serait
 * fragile.
 *
 * Les noms et les valeurs sont déjà validés à l'écriture par
 * `siteStyle.save` (préfixe `--akfc-` imposé, jeu de caractères restreint) :
 * rien d'arbitraire ne peut atteindre cette balise.
 */
function serializeSiteStyle(variables: Record<string, string>): string {
  const body = Object.entries(variables)
    .map(([key, value]) => `${key}:${value};`)
    .join("");
  return `html:root{${body}}`;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<JSX.Element> {
  // Lecture directe plutôt que par tRPC : on est dans un Server Component,
  // passer par HTTP pour interroger sa propre base n'aurait aucun sens.
  // Une ligne absente est le cas NORMAL tant que rien n'a été réglé — les
  // valeurs de globals.css s'appliquent alors.
  const siteStyle = await prisma.siteStyle
    .findUnique({ where: { id: 1 } })
    .catch(() => null);

  const styleOverride =
    siteStyle && siteStyle.variables
      ? serializeSiteStyle(siteStyle.variables as Record<string, string>)
      : null;

  return (
    <html lang="fr">
      {styleOverride && (
        <style
          id="akfc-site-style"
          dangerouslySetInnerHTML={{ __html: styleOverride }}
        />
      )}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>""")

# ── 6/7 le laboratoire enregistre ─────────────────────────────────────────
edit(LAB, """import { useState, type CSSProperties, type JSX } from "react";""",
"""import { useEffect, useState, type CSSProperties, type JSX } from "react";

import { trpc } from "@/core/trpc/trpcClient";""")

edit(LAB, """export function BlockStyleLab(): JSX.Element {
  const [values, setValues] = useState<Record<string, number>>(INITIAL);
  const [side, setSide] = useState<"left" | "right">("left");""",
"""export function BlockStyleLab(): JSX.Element {
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
  }, [saved.data]);""")

edit(LAB, """          <button
            type="button"
            onClick={() => setValues(INITIAL)}
            className="rounded border px-2 py-1 text-xs hover:bg-muted"
          >
            Réinitialiser
          </button>
        </div>""",
"""          <button
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
        )}""")

edit(LAB, """        <div className="space-y-1 pt-2">
          <span className="text-xs text-muted-foreground">
            À recopier dans globals.css
          </span>""",
"""        <div className="space-y-1 pt-2">
          <span className="text-xs text-muted-foreground">
            Équivalent CSS (pour figer ces valeurs comme repli dans
            globals.css)
          </span>""")

# ── 7/7 centre de contrôle (DERNIER fichier écrit) ────────────────────────
edit(SIDEBAR, """        <li>
          <button
            className="w-full text-center mt-5"
            onClick={() => {
              router.push("/profil");
            }}
          >
            Mon profil
          </button>
        </li>""",
"""        {role.name === "ADMIN" && (
          <li>
            <button
              className="w-full pl-1 text-left cursor-pointer mt-5 transition duration-300 hover:[text-shadow:0_0_15px_#34d399,0_0_30px_#10b981,0_0_60px_#059669]"
              onClick={() => {
                router.push("/dashboard/design-lab");
              }}
            >
              Laboratoire de rendu
            </button>
          </li>
        )}

        <li>
          <button
            className="w-full text-center mt-5"
            onClick={() => {
              router.push("/profil");
            }}
          >
            Mon profil
          </button>
        </li>""")
PY

echo "✓ modèle, migration, routeur, injection, bouton et entrée de menu posés"
echo
echo "⚠️  La migration n'est PAS appliquée par ce script. Avant de commiter :"
echo "      pnpm prisma migrate deploy"
echo "      pnpm prisma generate"
echo "    puis relancer ce script — il reprendra à l'étape typecheck."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  echo "  (si l'erreur porte sur 'siteStyle', le client Prisma n'est pas régénéré)"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(design-lab): le reglage s'enregistre et s'applique au site

Le laboratoire ecrit dans une ligne unique SiteStyle ; le layout racine
l'injecte en <style> sur le selecteur html:root, qui pese 0,0,2 contre
0,0,1 pour le :root de globals.css -- la surcharge l'emporte par
specificite, pas par ordre d'apparition, que Next ne garantit pas.

Source de verite unique : la base. Les valeurs de globals.css ne
servent plus que de repli tant que rien n'a ete enregistre.

Les noms de variables sont contraints au prefixe --akfc- et les
valeurs a un jeu de caracteres restreint : elles finissent dans une
balise style.

Migration ecrite a la main (pas de CREATEDB sur l'utilisateur Postgres)."

echo "✓ commité"
git log -1 --oneline