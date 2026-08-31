#!/usr/bin/env bash
#
# AKFC — Baseline des migrations (LOCAL) v2 : répare `migrate dev`.
#
# Remplace les 38 migrations (dont l'ordre gallery cassé) par UNE migration
# `0_init` reflétant le schéma actuel, et marque la base LOCALE comme « déjà à ce
# point » (sans rejouer le SQL — la donnée n'est pas touchée). Après ça, le replay
# shadow de `migrate dev` ne porte plus que sur `0_init` → il fonctionne.
#
# NE TOUCHE QUE LE LOCAL. La prod se fait après, à la main (séquence guidée).
#
# Étapes :
#   1. archive les 38 migrations hors du repo (~/akfc_migrations_old_DATE) ;
#   2. génère prisma/migrations/0_init/migration.sql (from-empty → schéma, offline) ;
#   3. vide _prisma_migrations LOCALE puis `resolve --applied 0_init` ;
#   4. `migrate status`.
#
# Prérequis : branche dédiée (pas main) ; base locale à l'état final propre
# (confirmé : schéma sans Role, seule dérive = FK MediaAsset, bénigne).
#
# Usage : bash baseline-migrations-local-v2.sh
#
set -euo pipefail

MIGDIR="prisma/migrations"
ARCHIVE="$HOME/akfc_migrations_old_$(date +%Y%m%d_%H%M)"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -d "$MIGDIR" ]      || { echo "ERREUR: $MIGDIR introuvable." >&2; exit 1; }

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "⚠️  Tu es sur '$BRANCH' — fais-le sur chore/baseline-migrations." >&2; exit 1
fi
[ -d "$MIGDIR/0_init" ] && { echo "0_init existe déjà — baseline déjà amorcé ?" >&2; exit 1; }

# ── 1. Archive des 38 migrations (hors repo, récupérables ; git garde l'histo) ─
mkdir -p "$ARCHIVE"; count=0
for d in "$MIGDIR"/*/; do
  name="$(basename "$d")"; [ "$name" = "0_init" ] && continue
  mv "$d" "$ARCHIVE/"; count=$((count+1))
done
echo "→ $count migrations archivées dans $ARCHIVE"
[ -f "$MIGDIR/migration_lock.toml" ] && echo "  migration_lock.toml conservé ✓" || echo "  ⚠️ migration_lock.toml absent"

# ── 2. Génération du baseline (offline : pas de DB, pas de shadow) ────────────
mkdir -p "$MIGDIR/0_init"
if ! pnpm prisma migrate diff --from-empty \
      --to-schema-datamodel prisma/schema.prisma --script \
      > "$MIGDIR/0_init/migration.sql" 2>/tmp/akfc_diff.log; then
  echo "génération baseline KO :"; cat /tmp/akfc_diff.log
  echo "→ restaure : mv \"$ARCHIVE\"/* \"$MIGDIR\"/ ; rmdir \"$MIGDIR/0_init\""; exit 1
fi
lines=$(wc -l < "$MIGDIR/0_init/migration.sql")
if [ "$lines" -lt 50 ]; then
  echo "⚠️ baseline suspicieusement court ($lines lignes) — inspecte avant de continuer." >&2
  echo "→ restaure : mv \"$ARCHIVE\"/* \"$MIGDIR\"/ ; rmdir \"$MIGDIR/0_init\""; exit 1
fi
echo "→ baseline généré ($lines lignes). Vérifie qu'il crée bien Gallery :"
grep -n 'CREATE TABLE "Gallery"' "$MIGDIR/0_init/migration.sql" | head -1 || echo "  ⚠️ Gallery non trouvée — anormal, inspecte le fichier"

# ── 3. Reset historique LOCAL + resolve ──────────────────────────────────────
echo "→ reset _prisma_migrations (LOCAL) + resolve 0_init…"
printf 'DELETE FROM "_prisma_migrations";\n' > /tmp/akfc_reset.sql
pnpm prisma db execute --file /tmp/akfc_reset.sql --schema prisma/schema.prisma
pnpm prisma migrate resolve --applied 0_init
echo "  OK"

# ── 4. Statut ────────────────────────────────────────────────────────────────
echo "→ migrate status :"; pnpm prisma migrate status || true

cat <<'EOF'

════════ VALIDATION (à faire toi-même) ════════
1) LE test : `migrate dev` doit ENFIN marcher. Sans rien appliquer :
     pnpm prisma migrate dev --name check_baseline --create-only
   → il ne doit PLUS échouer sur la shadow DB (P3006 / Gallery).
   → il proposera la micro-dérive FK MediaAsset_categoryId_fkey. Si c'est
     SEULEMENT ça, tu peux la garder (relance sans --create-only pour l'appliquer)
     ou supprimer le dossier généré. Montre-moi le SQL si doute.
2) Lance l'app en local : tout doit fonctionner (le schéma n'a pas changé).
3) Commit (PAS de push/merge encore — la prod doit être rebaselée en même temps) :
     git add -A
     git commit -m "chore(db): baseline des migrations (0_init) — repare migrate dev"

Puis dis-moi que le local est validé : je te donne la séquence PROD
(backup → reset _prisma_migrations prod → resolve 0_init → merge + pull).
EOF