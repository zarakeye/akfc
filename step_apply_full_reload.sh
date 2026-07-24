#!/usr/bin/env bash
#
# step_apply_full_reload.sh
#
# « Appliquer au site » fait désormais tout le travail, jusqu'au rechargement.
#
# ─── La chaîne complète, dans l'ordre ──────────────────────────────────────
#
#   1. `siteStyle.save`                   la ligne en base
#   2. `POST /api/admin/revalidate-style` le rendu serveur des pages
#   3. rechargement du document           tout le reste
#
# L'ordre n'est pas négociable : chaque étape ne sert à rien si la précédente
# n'a pas abouti. D'où `mutateAsync` et un `await` sur l'invalidation, là où
# la version précédente laissait filer les trois en parallèle.
#
# ─── Pourquoi un rechargement, et pas seulement `router.refresh()` ─────────
#
# `router.refresh()` refait le rendu côté serveur mais ne touche pas au cache
# HTTP du navigateur. Un rechargement complet, lui, repart de zéro : cache de
# routeur vidé, layout racine ré-exécuté, document redemandé.
#
# ─── Pourquoi une URL différente et pas `location.reload()` ────────────────
#
# `location.reload()` est exactement ce que fait Cmd+R — et Cmd+R ne
# suffisait pas. Une URL que le navigateur n'a jamais vue ne peut pas sortir
# de son cache : c'est le seul moyen d'en avoir la certitude sans dépendre
# d'en-têtes qu'on ne maîtrise pas partout.
#
# Le paramètre est retiré de la barre d'adresse au montage suivant, par
# `history.replaceState` — sans nouvelle entrée d'historique, pour que le
# bouton « précédent » ne ramène pas sur une URL jetable.
#
# ─── Ce qu'on perd, et pourquoi c'est acceptable ───────────────────────────
#
# Le rechargement remet les curseurs sur les valeurs enregistrées. C'est sans
# conséquence : on vient précisément de les enregistrer. Et le laboratoire
# relit la base au montage, donc il rouvre sur l'état réel du site — ce qui
# vaut mieux qu'un état local qui prétendrait le contraire.
#
# Usage :
#   bash step_apply_full_reload.sh
#   AKFC_APPLY_ONLY=1 bash step_apply_full_reload.sh
#
set -euo pipefail

LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Garde anti-double-application (AVANT les prérequis) ────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
[ -f "$LAB" ] || { echo "✗ introuvable : $LAB"; exit 1; }

if grep -q "applyAndReload" "$LAB"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAB) — rien à faire"
  exit 0
fi

grep -q "router.refresh" "$LAB" || {
  echo "✗ step_style_refresh.sh doit être appliqué d'abord"; exit 1; }

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

LAB = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/6 : le paramètre jetable, nommé une seule fois ─────────────────────
edit(LAB, """function scrollToAnchor(id: string): void {""",
"""/**
 * Paramètre jetable ajouté à l'URL au moment du rechargement.
 *
 * Une URL que le navigateur n'a jamais vue ne peut pas sortir de son cache.
 * `location.reload()` ne suffit pas : c'est exactement ce que fait Cmd+R, et
 * Cmd+R ne suffisait pas.
 */
const RELOAD_PARAM = "_applied";

function scrollToAnchor(id: string): void {""")

# ── 2/6 : le rechargement, isolé du composant ────────────────────────────
edit(LAB, """export function BlockStyleLab(): JSX.Element {""",
"""/**
 * Recharge le document sur une URL neuve.
 *
 * `replace` et non `assign` : sans nouvelle entrée d'historique, pour que le
 * bouton « précédent » ne ramène pas sur une URL jetable.
 */
function reloadWithFreshDocument(): void {
  const url = new URL(window.location.href);
  url.searchParams.set(RELOAD_PARAM, String(Date.now()));
  window.location.replace(url.toString());
}

export function BlockStyleLab(): JSX.Element {""")

# ── 3/6 : nettoyer la barre d'adresse au montage ─────────────────────────
edit(LAB, """  const router = useRouter();
  const saved = trpc.siteStyle.get.useQuery();""",
"""  const router = useRouter();
  const saved = trpc.siteStyle.get.useQuery();

  // Le paramètre jetable a fait son office au chargement : on le retire de
  // la barre d'adresse. `replaceState` plutôt que `pushState` — il ne s'agit
  // pas d'une navigation, seulement d'un nettoyage.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(RELOAD_PARAM)) return;
    url.searchParams.delete(RELOAD_PARAM);
    window.history.replaceState(null, "", url.toString());
  }, []);""")

# ── 4/6 : la chaîne devient séquentielle ─────────────────────────────────
edit(LAB, """  const saveMutation = trpc.siteStyle.save.useMutation({
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
  });""",
"""  const saveMutation = trpc.siteStyle.save.useMutation();
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  /**
   * Enregistre, invalide, recharge — dans cet ordre.
   *
   * Chaque étape est sans effet si la précédente n'a pas abouti, d'où les
   * `await` : la version précédente lançait les trois en parallèle et
   * pouvait recharger avant que le serveur n'ait le nouveau réglage.
   *
   * `router.refresh()` a disparu : le rechargement complet fait tout ce
   * qu'il faisait, et davantage.
   */
  async function applyAndReload(): Promise<void> {
    setApplyError(null);
    try {
      await saveMutation.mutateAsync({
        variables: {
          ...Object.fromEntries(
            KNOBS.map((k) => [k.key, `${values[k.key]}${k.unit}`]),
          ),
          "--akfc-media-col": ratio.media,
          "--akfc-text-col": ratio.text,
        },
      });

      // Contrairement à l'enregistrement, un échec ici n'est pas fatal : le
      // réglage est en base, une régénération ordinaire le rattrapera. On
      // continue donc vers le rechargement.
      await fetch("/api/admin/revalidate-style", { method: "POST" }).catch(
        () => undefined,
      );

      setIsReloading(true);
      reloadWithFreshDocument();
    } catch (error) {
      setApplyError(
        error instanceof Error ? error.message : "Échec de l'enregistrement",
      );
    }
  }""")

# ── 5/6 : le bouton appelle la chaîne ────────────────────────────────────
edit(LAB, """        <button
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
        </button>""",
"""        <button
          type="button"
          disabled={saveMutation.isPending || isReloading}
          onClick={() => {
            void applyAndReload();
          }}
          className="w-full rounded border border-foreground px-2 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
        >
          {isReloading
            ? "Rechargement…"
            : saveMutation.isPending
              ? "Enregistrement…"
              : "Appliquer au site"}
        </button>""")

# ── 6/8 : `router` et `utils` n'ont plus d'emploi ────────────────────────
# `router.refresh()` et l'invalidation du cache tRPC sont tous deux absorbés
# par le rechargement complet. Les laisser déclarés vaudrait un avertissement
# ESLint et, surtout, laisserait croire à un mécanisme encore actif.
edit(LAB, """import { useEffect, useState, type CSSProperties, type JSX } from "react";
import { useRouter } from "next/navigation";""",
"""import { useEffect, useState, type CSSProperties, type JSX } from "react";""")

edit(LAB, """  const router = useRouter();
  const saved = trpc.siteStyle.get.useQuery();""",
"""  const saved = trpc.siteStyle.get.useQuery();""")

edit(LAB, """  const utils = trpc.useUtils();
""", "")

# ── 8/8 : les messages suivent (DERNIER bloc écrit) ──────────────────────
edit(LAB, """        {saveMutation.isSuccess && (
          <p className="text-xs text-muted-foreground">
            Réglage enregistré. Rechargez une page du site pour le voir
            appliqué&nbsp;: la surcharge est injectée au rendu serveur.
          </p>
        )}
        {saveMutation.isError && (
          <p className="text-xs text-destructive">
            Échec de l&apos;enregistrement : {saveMutation.error.message}
          </p>
        )}""",
"""        {/* Pas de message de succès : la page se recharge, il ne serait
            visible qu'un instant. L'échec, lui, laisse la page en place. */}
        {applyError && (
          <p className="text-xs text-destructive">
            Échec de l&apos;enregistrement : {applyError}
          </p>
        )}""")
PY

echo "✓ 9 substitutions appliquées"

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
git commit -m "feat(design-lab): Appliquer enchaine enregistrement, invalidation et rechargement

Les trois etapes s'enchainent desormais avec await : chacune est sans
effet si la precedente n'a pas abouti, et la version precedente
pouvait recharger avant que le serveur n'ait le nouveau reglage.

Le rechargement se fait sur une URL portant un parametre jetable :
location.reload() est exactement ce que fait Cmd+R, qui ne suffisait
pas. Une URL jamais vue ne peut pas sortir du cache du navigateur.

Le parametre est retire de la barre d'adresse au montage suivant, par
replaceState -- pas de nouvelle entree d'historique."

echo "✓ commité"
git log -1 --oneline