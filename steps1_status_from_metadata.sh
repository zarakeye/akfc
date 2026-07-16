#!/usr/bin/env bash
###############################################################################
# S1 — Le statut circule depuis la MÉTADONNÉE (et non plus depuis le chemin)
#
# Première étape du chantier « supprimer la strate de statut ». Purement
# ADDITIVE : le segment de chemin existe toujours, les moves aussi. On ajoute
# seulement une source de vérité alternative, et on commence à s'en servir.
#
#   1. MediaMeta : + `status` (depuis MediaAsset.status).
#   2. media.getByPaths : expose le statut (la row est déjà chargée).
#   3. useMediaAssetEnrichment : merge le statut + CORRIGE son garde
#      `hasNewData`, qui ne comparait que `createdAt` — un changement de
#      statut seul n'aurait déclenché aucun re-render.
#   4. StatusRadioGroup : dérive de `meta.status`, fallback sur le chemin
#      tant que tous les assets ne sont pas trackés en DB.
#
# Rien ne casse : `statusFromPath` reste en place et sert de filet.
# La suite (S2) : badge « En attente » + colonne statut en vue tableau.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

META="packages/contracts/src/finder/meta.types.ts"
test -f "$META" || { echo "ERREUR: $META introuvable."; exit 1; }
if grep -q "status?: LifecycleStatus\|status?: 'pending'" "$META" 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. MediaMeta : + status                                                     #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/contracts/src/finder/meta.types.ts"
s = open(p, encoding="utf-8").read()
a = '''  // ─── Enrichissement Phase 1 (depuis MediaAsset DB) ──────────────────────
  /** Date d'upload du fichier (ISO 8601). Pour le tri/groupage par Date. */
  createdAt?: string;'''
b = '''  // ─── Enrichissement Phase 1 (depuis MediaAsset DB) ──────────────────────
  /**
   * Statut de cycle de vie, depuis `MediaAsset.status` en DB.
   *
   * C'est la source de vérité VISÉE : à terme le statut ne sera plus déduit
   * du chemin (`statusFromPath`), qui encode aujourd'hui la même information
   * dans le path — d'où les moves physiques à chaque publication.
   *
   * `undefined` = pas de row MediaAsset (fichier antérieur au tracking) : les
   * consommateurs retombent alors sur `statusFromPath`.
   */
  status?: 'pending' | 'published' | 'bin';
  /** Date d'upload du fichier (ISO 8601). Pour le tri/groupage par Date. */
  createdAt?: string;'''
assert s.count(a) == 1, f"[1] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] meta.types.ts : MediaMeta.status OK")
PY

# --------------------------------------------------------------------------- #
# 2. media.getByPaths : expose le statut                                      #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/media/router.ts"
s = open(p, encoding="utf-8").read()

a = '''      const byPath: Record<
        string,
        {
          createdAt: string;
          uploadedBy: string;'''
b = '''      const byPath: Record<
        string,
        {
          status: string;
          createdAt: string;
          uploadedBy: string;'''
assert s.count(a) == 1, f"[2.type] : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''        byPath[inputPath] = {
          createdAt: asset.uploadedAt.toISOString(),'''
b = '''        byPath[inputPath] = {
          // Source de vérité visée du statut (cf. MediaMeta.status).
          status: asset.status,
          createdAt: asset.uploadedAt.toISOString(),'''
assert s.count(a) == 1, f"[2.map] : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [2] media/router.ts : getByPaths expose status OK")
PY

# --------------------------------------------------------------------------- #
# 3. useMediaAssetEnrichment : merge + correction du garde                    #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/finder-core/hooks/useMediaAssetEnrichment.ts"
s = open(p, encoding="utf-8").read()

a = '''      // Si on a déjà appliqué cette createdAt, pas la peine de refaire.
      return f.meta?.createdAt !== meta.createdAt;'''
b = '''      // `createdAt` ne bouge jamais après l'upload : le comparer seul
      // laisserait passer un changement de STATUT (publication), et le
      // rendu ne se rafraîchirait pas. On compare donc les deux.
      return (
        f.meta?.createdAt !== meta.createdAt || f.meta?.status !== meta.status
      );'''
assert s.count(a) == 1, f"[3.guard] : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''        meta: {
          ...f.meta,
          createdAt: meta.createdAt,'''
b = '''        meta: {
          ...f.meta,
          status: meta.status as 'pending' | 'published' | 'bin',
          createdAt: meta.createdAt,'''
assert s.count(a) == 1, f"[3.merge] : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [3] useMediaAssetEnrichment : merge status + garde corrigé OK")
PY

# --------------------------------------------------------------------------- #
# 4. StatusRadioGroup : dérive de la métadonnée                               #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/finder-core/components/StatusRadioGroup.tsx"
s = open(p, encoding="utf-8").read()
a = '''    const distinct = new Set(selectedNodes.map((n) => statusFromPath(n.path)));'''
b = '''    // Le statut vient de la MÉTADONNÉE (`MediaAsset.status`). Fallback sur le
    // chemin uniquement pour les fichiers sans row DB (antérieurs au
    // tracking) — ce fallback disparaîtra avec la strate de statut.
    const distinct = new Set(
      selectedNodes.map((n) => n.meta?.status ?? statusFromPath(n.path)),
    );'''
assert s.count(a) == 1, f"[4] : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [4] StatusRadioGroup : dérive de meta.status OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web (serveur arrêté + .next vidé recommandé) =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(finder): expose MediaAsset.status as node metadata (status no longer derived from path)"
echo "OK — S1 commité."