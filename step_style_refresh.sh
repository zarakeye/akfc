#!/usr/bin/env bash
#
# step_style_refresh.sh
#
# Deux mécanismes retiennent l'ancienne feuille après un enregistrement.
# Chacun explique à lui seul le besoin de rechargement forcé, et chacun se
# corrige indépendamment.
#
# ─── 1. React déduplique sur `href` ────────────────────────────────────────
#
# La balise hissée porte `href="akfc-site-style"`, une valeur FIXE. Or React
# considère que deux feuilles de même `href` sont la même feuille : il garde
# celle déjà insérée et ignore la nouvelle, dont seul le contenu a changé.
# C'est le comportement documenté du hissage, et il est raisonnable — un
# `href` désigne normalement une ressource immuable.
#
# Le `href` dérive donc désormais de `updatedAt` : un enregistrement produit
# une clé neuve, donc une feuille que React accepte comme distincte. Une
# valeur temporelle plutôt qu'un compteur, parce que la colonne existe déjà
# et change exactement quand il faut.
#
# ─── 2. Le cache de routeur côté client ────────────────────────────────────
#
# La surcharge est injectée par le layout RACINE, et un layout n'est PAS
# re-rendu lors d'une navigation côté client : quitter le laboratoire pour
# une page publique conserve la balise du chargement initial. `revalidatePath`
# a bien rafraîchi le serveur, mais rien n'a demandé au client d'aller
# rechercher quoi que ce soit.
#
# `router.refresh()` vide ce cache et refait la demande. Appelé APRÈS
# l'invalidation serveur, sans quoi il rapporterait la version périmée.
#
# ─── Ce que ce script ne peut pas corriger ─────────────────────────────────
#
# Si le rechargement simple (Cmd+R) ne suffisait toujours pas, alors le
# document lui-même sort du cache HTTP du navigateur, et cela se règle par un
# en-tête, pas par du code React. L'onglet Réseau le dira : la requête du
# document affiche « from disk cache », ou son `Cache-Control` autorise la
# mise en cache.
#
# Usage :
#   bash step_style_refresh.sh
#   AKFC_APPLY_ONLY=1 bash step_style_refresh.sh
#
set -euo pipefail

LAYOUT="apps/web/src/app/layout.tsx"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Garde anti-double-application (AVANT les prérequis) ────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$LAYOUT" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

if grep -q "router.refresh" "$LAB"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAB) — rien à faire"
  exit 0
fi

grep -q "revalidate-style" "$LAB" || {
  echo "✗ step_cache_ergonomics.sh doit être appliqué d'abord"; exit 1; }

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

LAYOUT = "apps/web/src/app/layout.tsx"
LAB    = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/3 : une clé qui change quand le réglage change ─────────────────────
edit(LAYOUT, """  const styleOverride =
    siteStyle && siteStyle.variables
      ? serializeSiteStyle(siteStyle.variables as Record<string, string>)
      : null;""",
"""  const styleOverride =
    siteStyle && siteStyle.variables
      ? serializeSiteStyle(siteStyle.variables as Record<string, string>)
      : null;

  // ⚠️ `href` doit CHANGER quand le réglage change.
  //
  // React considère que deux feuilles de même `href` sont la même feuille :
  // avec une valeur fixe, il gardait celle déjà insérée et ignorait la
  // nouvelle, dont seul le contenu avait bougé. C'est le comportement
  // documenté du hissage, et il est raisonnable — un `href` désigne
  // normalement une ressource immuable.
  //
  // `updatedAt` fait une clé naturelle : la colonne existe déjà et change
  // exactement quand il le faut.
  const styleKey = siteStyle
    ? `akfc-site-style-${siteStyle.updatedAt.getTime()}`
    : "akfc-site-style";""")

edit(LAYOUT, """          <style href="akfc-site-style" precedence="high">""",
"""          <style href={styleKey} precedence="high">""")

# ── 2/3 : le laboratoire redemande le rendu ──────────────────────────────
edit(LAB, """import { useEffect, useState, type CSSProperties, type JSX } from "react";""",
"""import { useEffect, useState, type CSSProperties, type JSX } from "react";
import { useRouter } from "next/navigation";""")

edit(LAB, """  const saved = trpc.siteStyle.get.useQuery();""",
"""  const router = useRouter();
  const saved = trpc.siteStyle.get.useQuery();""")

# ── 3/3 : l'ordre compte (DERNIER fichier écrit) ─────────────────────────
edit(LAB, """      void fetch("/api/admin/revalidate-style", { method: "POST" }).catch(
        () => undefined,
      );""",
"""      void fetch("/api/admin/revalidate-style", { method: "POST" })
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
        .catch(() => undefined);""")
PY

echo "✓ 5 substitutions appliquées"

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
git commit -m "fix(design-lab): le reglage s'applique sans rechargement force

Deux mecanismes retenaient l'ancienne feuille.

React deduplique les balises hissees sur href : avec une valeur fixe,
il gardait la feuille deja inseree et ignorait la nouvelle, dont seul
le contenu avait change. Le href derive desormais de updatedAt.

Un layout n'est pas re-rendu lors d'une navigation cote client : la
surcharge, injectee par le layout racine, restait celle du chargement
initial. router.refresh() vide le cache de routeur -- appele apres
l'invalidation serveur, sans quoi il rapporterait la version perimee."

echo "✓ commité"
git log -1 --oneline