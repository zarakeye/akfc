#!/usr/bin/env bash
#
# step_cache_ergonomics.sh
#
# Deux caches distincts te faisaient perdre du temps. Ils n'ont ni la même
# cause ni le même remède, et les confondre menait à vider le mauvais.
#
# ─── 1. Le cache de développement ──────────────────────────────────────────
#
# Turbopack et OneDrive se marchent dessus : le bundle servi n'est pas
# toujours celui du disque. C'est ce qui a fait enregistrer un réglage avec
# l'ANCIENNE liste de curseurs — six variables manquaient à l'appel dans la
# balise injectée, précisément les six ajoutées par les deux derniers
# scripts.
#
# Trois scripts pnpm, pour ne plus taper la commande de mémoire :
#
#     pnpm clean       vide les caches
#     pnpm dev:clean   vide puis démarre
#     pnpm check       vide, puis les deux typechecks
#
# `pnpm check` mérite un mot : ce projet a déjà connu trois faux typechecks
# dus à un `.next` périmé. Un typecheck qui ne nettoie pas d'abord peut
# mentir dans les deux sens, et c'est le pire des retours.
#
# ─── 2. Le cache de rendu de Next ──────────────────────────────────────────
#
# Celui-là ne se voit pas encore, mais il mordra en production. Le layout
# racine lit `SiteStyle` pour injecter la surcharge ; une page rendue
# statiquement fige cette balise au moment du rendu. Enregistrer un nouveau
# réglage ne changerait alors rien tant que la page n'est pas régénérée.
#
# `revalidatePath("/", "layout")` après chaque enregistrement, depuis une
# route dédiée. Pourquoi une route et non la mutation tRPC elle-même :
# `packages/backend` ne connaît pas Next et n'a pas à le connaître —
# y importer `next/cache` lierait le domaine au framework pour un détail
# d'infrastructure. La route vit dans `apps/web`, où Next est chez lui.
#
# L'invalidation est lancée SANS bloquer : elle est un confort, pas une
# condition de succès. Si elle échoue, le réglage est enregistré quand même,
# et une régénération ordinaire le rattrapera.
#
# Usage :
#   bash step_cache_ergonomics.sh
#   AKFC_APPLY_ONLY=1 bash step_cache_ergonomics.sh
#
set -euo pipefail

PKG="package.json"
ROUTE="apps/web/src/app/api/admin/revalidate-style/route.ts"
LAB="apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$PKG" "$LAB"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "revalidate-style" "$LAB"; then
  echo "✓ déjà appliqué (marqueur présent dans $LAB) — rien à faire"
  exit 0
fi

mkdir -p "$(dirname "$ROUTE")"

python3 - <<'PY'
import io, json, os, collections

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

PKG   = "package.json"
ROUTE = "apps/web/src/app/api/admin/revalidate-style/route.ts"
LAB   = "apps/web/src/features/design-lab/BlockStyleLab.tsx"

# ── 1/3 : les scripts pnpm ────────────────────────────────────────────────
with io.open(PKG, encoding='utf-8') as fh:
    pkg = json.load(fh, object_pairs_hook=collections.OrderedDict)

scripts = pkg["scripts"]
CLEAN = "rm -rf apps/web/.next node_modules/.cache"
assert "clean" not in scripts, "le script `clean` existe déjà"

# Insertion ordonnée : `clean` et `dev:clean` juste après `dev`, pour qu'ils
# se lisent ensemble dans le fichier comme dans `pnpm run`.
ordered = collections.OrderedDict()
for key, value in scripts.items():
    ordered[key] = value
    if key == "dev":
        ordered["clean"] = CLEAN
        ordered["dev:clean"] = "pnpm clean && pnpm dev"
ordered["check"] = (
    "pnpm clean && pnpm --filter backend typecheck && pnpm typecheck"
)
pkg["scripts"] = ordered

with io.open(PKG, 'w', encoding='utf-8') as fh:
    json.dump(pkg, fh, indent=2, ensure_ascii=False)
    fh.write("\n")
print("  ~ package.json (clean, dev:clean, check)")

# ── 2/3 : la route d'invalidation ────────────────────────────────────────
create(ROUTE, '''import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@backend/modules/auth/getSessionFromRequest";

/**
 * Invalide le rendu des pages après un enregistrement du réglage de style.
 *
 * ─── Pourquoi ici et non dans la mutation tRPC ─────────────────────────
 *
 * `packages/backend` ne connaît pas Next et n'a pas à le connaître : y
 * importer `next/cache` lierait le domaine au framework pour un détail
 * d'infrastructure. Cette route vit dans `apps/web`, où Next est chez lui.
 *
 * ─── Pourquoi le layout et non les pages ───────────────────────────────
 *
 * La surcharge est injectée par le layout RACINE, qui enveloppe tout. Une
 * invalidation page par page laisserait passer celles qu'on aurait
 * oubliées ; `revalidatePath("/", "layout")` couvre l'arbre entier.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Route d'administration : le réglage vaut pour le site entier, sa
  // régénération n'est pas une opération anonyme.
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
''')

# ── 3/3 : le laboratoire déclenche l'invalidation (DERNIER fichier écrit) ─
edit(LAB, """  const saveMutation = trpc.siteStyle.save.useMutation({
    onSuccess: () => {
      void utils.siteStyle.get.invalidate();
    },
  });""",
"""  const saveMutation = trpc.siteStyle.save.useMutation({
    onSuccess: () => {
      void utils.siteStyle.get.invalidate();

      // Le layout racine injecte la surcharge : une page déjà rendue la
      // porterait figée. On demande sa régénération.
      //
      // Sans `await` et sans `catch` bloquant, délibérément : l'invalidation
      // est un confort, pas une condition de succès. Si elle échoue, le
      // réglage est enregistré quand même et une régénération ordinaire le
      // rattrapera — inutile d'annoncer un échec pour ça.
      void fetch("/api/admin/revalidate-style", { method: "POST" }).catch(
        () => undefined,
      );
    },
  });""")
PY

echo "✓ scripts, route et déclenchement posés"

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
git commit -m "chore(dx): scripts de nettoyage et invalidation apres enregistrement

pnpm clean / dev:clean / check : le vidage de cache cesse d'etre une
commande a retaper de memoire. check nettoie avant de typechecker --
ce projet a deja connu trois faux typechecks dus a un .next perime.

Enregistrer un reglage declenche revalidatePath('/', 'layout') : le
layout racine injecte la surcharge, une page deja rendue la porterait
figee. La route vit dans apps/web plutot que dans la mutation tRPC :
packages/backend n'a pas a importer next/cache.

L'invalidation ne bloque pas -- si elle echoue, le reglage est
enregistre quand meme."

echo "✓ commité"
git log -1 --oneline