#!/usr/bin/env bash
#
# ═══════════════════════════════════════════════════════════════════════════
#  AKFC — T4 : montage de la vue logique dans le router, derrière un flag
# ═══════════════════════════════════════════════════════════════════════════
#
#  T2 a écrit la vue de lecture pliée, T3 la projection des intentions de
#  move. Les deux étaient inertes. Ce script les branche — mais SEULEMENT
#  quand l'appelant le demande, via `logical: true`.
#
#  Aucun appelant ne le demande encore : `finderStorageAdapter` est le seul
#  consommateur de `storage.getTree` / `getMetadata` / `move`, et il ne passe
#  pas le flag. Le comportement actuel est donc STRICTEMENT préservé. Le
#  basculement est l'incrément suivant, et il tient en un booléen — donc le
#  retour arrière aussi.
#
#  CE QUE FAIT CE SCRIPT
#  ---------------------
#   1. `logical?: boolean` sur list / getTree / getNode / getMetadata / move.
#   2. Les 4 lectures enveloppent l'adapter dans `StatusFoldingReadView`
#      quand le flag est levé.
#   3. `move` projette l'intention via `toPhysicalMoveIntents`, planifie
#      chaque intention physique, réunit les opérations, passe L'UNION aux
#      gardes, puis exécute.
#
#  AUCUNE migration Prisma. `git revert` suffit.
#
#  PRÉREQUIS : T2 et T3.
#
#  USAGE
#  -----
#     bash step_t4_mount_logical_view.sh
#     AKFC_APPLY_ONLY=1 bash step_t4_mount_logical_view.sh   # usage Claude
#
set -euo pipefail

MARKER="input.logical"

echo "▶ AKFC — T4 : montage de la vue logique (derrière un flag, inerte)"

if [ ! -f "pnpm-workspace.yaml" ] || [ ! -d "packages/backend" ]; then
  echo "✗ À lancer depuis la RACINE du monorepo AKFC."
  exit 1
fi

ROUTER="packages/backend/src/modules/storage/router.ts"
[ -f "$ROUTER" ] || { echo "✗ Fichier introuvable : $ROUTER"; exit 1; }

for f in "packages/backend/src/modules/storage/statusFoldingReadView.ts" \
         "packages/backend/src/modules/storage/toPhysicalMoveIntents.service.ts"; do
  [ -f "$f" ] || { echo "✗ $f absent — lance T2 puis T3 d'abord."; exit 1; }
done

if grep -q "$MARKER" "$ROUTER"; then
  echo "✓ Déjà appliqué (flag présent dans le router). Rien à faire."
  exit 0
fi

python3 - <<'PYEOF'
import io

def sub_once(path, old, new, label):
    with io.open(path, encoding="utf-8") as f:
        s = f.read()
    n = s.count(old)
    assert n == 1, f"[{label}] ancre trouvée {n} fois dans {path} (attendu 1)"
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(s.replace(old, new, 1))
    print(f"  ✓ {label}")

R = "packages/backend/src/modules/storage/router.ts"

# ── 1. Imports ────────────────────────────────────────────────────────────
sub_once(
    R,
    'import { VirtualStorage } from "@backend/modules/storage/virtualStorage";',
    'import { VirtualStorage } from "@backend/modules/storage/virtualStorage";\n'
    'import { StatusFoldingReadView } from "@backend/modules/storage/statusFoldingReadView";\n'
    'import { toPhysicalMoveIntents } from "@backend/modules/storage/toPhysicalMoveIntents.service";',
    "imports (vue pliée + projection des intentions)",
)

# ── 2. list ───────────────────────────────────────────────────────────────
old = '''  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      return reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),'''

new = '''  /**
   * ═══ Le flag `logical` — chantier « arbre sans strate de statut » ═══════
   *
   * Levé, il enveloppe l'adapter dans `StatusFoldingReadView` : le nœud
   * logique `AKFC/cours/x` fusionne alors les physiques
   * `AKFC/pending/cours/x` et `AKFC/published/cours/x`, et le statut cesse
   * d'être un lieu pour redevenir ce qu'il aurait toujours dû être — une
   * métadonnée (`MediaAsset.status`, déjà exposée en `MediaMeta.status`).
   *
   * Baissé (le défaut), rien ne change : l'appelant voit l'arbre physique,
   * exactement comme avant ce chantier.
   *
   * ─── Pourquoi un flag plutôt qu'une bascule sèche ─────────────────────
   *
   * Le pliage change ce que voit l'admin dans sa bibliothèque. Un flag
   * découple la mise en place (backend, inerte, vérifiable) du basculement
   * (front, visible) — et surtout, il rend le retour arrière instantané :
   * un booléen, pas un revert en catastrophe un soir de démo.
   *
   * ⚠️ Un appelant qui lève `logical` sur une lecture DOIT le lever aussi
   * sur `move` : les chemins qu'il reçoit sont logiques, et le pipeline de
   * move ne sait travailler qu'en physique (cf. `toPhysicalMoveIntents`).
   * Les mélanger, c'est envoyer des chemins logiques à `resolveTargetPath`,
   * qui lève. En pratique il n'y a qu'un seul appelant
   * (`finderStorageAdapter`), donc un seul endroit à tenir cohérent.
   *
   * ─── Durée de vie ─────────────────────────────────────────────────────
   *
   * Transitoire. À l'étape 5 du chantier, tous les binaires vivent à plat,
   * le pliage devient l'identité, et le flag disparaît avec les trois
   * modules qu'il commande.
   */
  list: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        cursor: z.string().optional(),
        limit: z.number().int().positive().optional(),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      const reader = input.logical
        ? new StatusFoldingReadView(backend, ctx.appRoot)
        : backend;
      return reader.list({
        path: input.path,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),'''
sub_once(R, old, new, "list + doc du flag")

# ── 3. getTree ────────────────────────────────────────────────────────────
old = '''  getTree: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        depth: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      return reader.getTree({ path: input.path, depth: input.depth });
    }),'''

new = '''  getTree: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        depth: z.number().int().positive().optional(),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      const reader = input.logical
        ? new StatusFoldingReadView(backend, ctx.appRoot)
        : backend;
      return reader.getTree({ path: input.path, depth: input.depth });
    }),'''
sub_once(R, old, new, "getTree")

# ── 4. getNode ────────────────────────────────────────────────────────────
old = '''  getNode: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      if (!reader.getNode) {'''

new = '''  getNode: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      const reader = input.logical
        ? new StatusFoldingReadView(backend, ctx.appRoot)
        : backend;
      if (!reader.getNode) {'''
sub_once(R, old, new, "getNode")

# ── 5. getMetadata ────────────────────────────────────────────────────────
old = '''  getMetadata: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const reader = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      if (!reader.getMetadata) {'''

new = '''  getMetadata: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        path: z.string().min(1),
        logical: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const backend = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);
      const reader = input.logical
        ? new StatusFoldingReadView(backend, ctx.appRoot)
        : backend;
      if (!reader.getMetadata) {'''
sub_once(R, old, new, "getMetadata")

# ── 6. move ───────────────────────────────────────────────────────────────
old = '''  move: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        intent: storageMoveIntentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      const operations = await planMoveOperations({
        adapter,
        appRoot: ctx.appRoot,
        intent: input.intent,
      });

      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        operations,
        ctx.appRoot,
      );

      await executeMoveOperations(adapter, operations);

      return { operations };
    }),'''

new = '''  move: protectedProcedure
    .input(
      z.object({
        provider: storageProviderSchema.optional(),
        intent: storageMoveIntentSchema,
        /**
         * L'intention est exprimée en chemins LOGIQUES (cf. `list`).
         *
         * Un appelant qui lit en `logical` DOIT lever ce flag ici aussi :
         * les chemins qu'il détient viennent de la vue pliée.
         */
        logical: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deps = { prisma: ctx.prisma, appRoot: ctx.appRoot };

      // ⚠️ L'adapter reste PHYSIQUE, toujours. On n'enveloppe JAMAIS le
      // pipeline de move dans `StatusFoldingReadView` : `planMoveOperations`
      // lit la source via cet adapter puis calcule la cible avec
      // `resolveTargetPath`, qui exige un segment de statut en position 1 et
      // lève sinon. Lui donner des chemins logiques casserait la
      // publication. La traduction se fait en amont, sur l'INTENTION.
      const adapter = input.provider
        ? getAdapter(input.provider, deps)
        : new VirtualStorage(deps);

      // Une intention logique peut recouvrir plusieurs emplacements réels
      // (un dossier logique vit dans 1..N strates). `toPhysicalMoveIntents`
      // les résout contre la DB et n'émet que des intentions RÉELLES — pas
      // de spéculation, donc pas de tolérance à installer ici.
      const intents = input.logical
        ? await toPhysicalMoveIntents({
            prisma: ctx.prisma,
            appRoot: ctx.appRoot,
            intent: input.intent,
          })
        : [input.intent];

      // On planifie TOUT avant de garder, et on garde sur l'UNION.
      //
      // C'est le point non négociable de cet enchaînement :
      // `assertOperationsDontUnpublishReferencedAssets` doit voir l'ensemble
      // des opérations. La faire tourner par intention la laisserait
      // raisonner sur un sous-ensemble — et une garde qui juge sur une
      // partie du geste ne garde rien.
      const plans = await Promise.all(
        intents.map((intent) =>
          planMoveOperations({ adapter, appRoot: ctx.appRoot, intent }),
        ),
      );
      const operations = plans.flat();

      await assertOperationsDontUnpublishReferencedAssets(
        ctx.prisma,
        operations,
        ctx.appRoot,
      );

      // Exécution séquentielle, comme avant : Cloudinary n'aime pas les
      // opérations concurrentes sur des préfixes voisins.
      await executeMoveOperations(adapter, operations);

      return { operations };
    }),'''
sub_once(R, old, new, "move (projection + garde sur l'union)")
PYEOF

echo "✓ Édits appliqués."

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "⏭  AKFC_APPLY_ONLY=1 → typecheck et commit sautés."
  exit 0
fi

echo "▶ pnpm --filter backend typecheck"
pnpm --filter backend typecheck

echo "▶ pnpm typecheck (web)"
pnpm typecheck

git add -A
git commit -m "feat(storage): monte la vue logique derrière un flag \`logical\` (inerte)

T2 (vue de lecture pliée) et T3 (projection des intentions de move) étaient
inertes. Ce commit les branche, mais seulement quand l'appelant le demande.

- list / getTree / getNode / getMetadata acceptent \`logical?: boolean\` et
  enveloppent l'adapter dans StatusFoldingReadView quand il est levé.
- move projette l'intention via toPhysicalMoveIntents, planifie chaque
  intention physique, réunit les opérations, passe L'UNION aux gardes, puis
  exécute séquentiellement.
- l'adapter du move reste physique en toutes circonstances : la vue pliée
  n'est jamais passée à planMoveOperations, car resolveTargetPath lèverait
  sur un chemin logique.

Aucun appelant ne lève le flag : finderStorageAdapter est le seul
consommateur de ces procédures et ne le passe pas. Le comportement est donc
strictement préservé. La bascule est l'incrément suivant — et tient en un
booléen, donc le retour arrière aussi."

echo "✅ T4 appliqué, typechecké et commité."