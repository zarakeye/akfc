#!/usr/bin/env bash
# Qualité : le lint relit aussi les paquets, le typecheck aussi la config racine ; code mort retiré.
# Prérequis : apply-fix-interface.sh. Aucune migration.
# Usage (racine du repo) : bash apply-fix-qualite.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"package.json" 2>/dev/null | grep -qF "tsc -p tsconfig.json"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "function publishedWhere(now: Date)" "apps/web/src/app/sitemap.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-interface.sh"; exit 1; }
MODIFIED=("package.json" "apps/web/tsconfig.json" "apps/web/src/features/finder-core/utils/statusFolders.ts" "packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts" "packages/contracts/src/storage/virtual-path.ts" "prisma/seed.sandbox.mjs")
EXPECT=("abca1cbea535:package.json" "ce3bb5038c14:apps/web/tsconfig.json" "b4c278f0d18d:apps/web/src/features/finder-core/utils/statusFolders.ts" "9d691b10fe04:packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts" "3fe7153b6a27:packages/contracts/src/storage/virtual-path.ts" "6ddd91c328b9:prisma/seed.sandbox.mjs")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=()
restore(){ [ -n "${DELETED+x}" ] && { git reset -q -- "${DELETED[@]}" 2>/dev/null; git checkout -q -- "${DELETED[@]}" 2>/dev/null; }; git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "tsc -p tsconfig.json" "package.json" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR


python3 - <<'PY'
import base64
spec_skip_done = False
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    if s.count(old) == 0 and s.count(new) == 1 and spec_skip_done: return  # déjà fait par un script précédent
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('package.json', 'ICAgICJidWlsZCI6ICJwbnBtIC0tZmlsdGVyIHdlYiBidWlsZCIsCiAgICAic3RhcnQiOiAicG5wbSAtLWZpbHRlciB3ZWIgc3RhcnQiLAogICAgInR5cGVjaGVjayI6ICJwbnBtIC0tZmlsdGVyIHdlYiB0eXBlY2hlY2siLAogICAgImxpbnQiOiAicG5wbSAtLWZpbHRlciB3ZWIgbGludCIsCiAgICAicG9zdGluc3RhbGwiOiAicG5wbSBwcmlzbWEgZ2VuZXJhdGUiLAogICAgImRvY3M6cHJvY2VkdXJlcyI6ICJub2RlIHNjcmlwdHMvYnVpbGQtcHJvY2VkdXJlLW1hcC5tanMgLS13cml0ZSIsCiAgICAiY2hlY2siOiAibm9kZSBzY3JpcHRzL2NoZWNrLW5leHQtY29udmVudGlvbnMubWpzICYmIG5vZGUgc2NyaXB0cy9jaGVjay10b3VyLXRhcmdldHMubWpzICYmIG5vZGUgc2NyaXB0cy9idWlsZC1wcm9jZWR1cmUtbWFwLm1qcyAmJiBub2RlIHNjcmlwdHMvY2hlY2stZG9jLWVudGl0aWVzLm1qcyAmJiBwbnBtIGNsZWFuICYmIHBucG0gLS1maWx0ZXIgYmFja2VuZCB0eXBlY2hlY2sgJiYgcG5wbSB0eXBlY2hlY2sgJiYgcG5wbSBsaW50IgogIH0sCiAgInByaXNtYSI6IHsKICAgICJzZWVkIjogIm5vZGUgcHJpc21hL3NlZWQuanMiCiAgfSwKICAiZGVwZW5kZW5jaWVzIjogewo=',
    'ICAgICJidWlsZCI6ICJwbnBtIC0tZmlsdGVyIHdlYiBidWlsZCIsCiAgICAic3RhcnQiOiAicG5wbSAtLWZpbHRlciB3ZWIgc3RhcnQiLAogICAgInR5cGVjaGVjayI6ICJwbnBtIC0tZmlsdGVyIHdlYiB0eXBlY2hlY2sgJiYgcG5wbSAtLWZpbHRlciBiYWNrZW5kIHR5cGVjaGVjayAmJiB0c2MgLXAgdHNjb25maWcuanNvbiIsCiAgICAibGludCI6ICJwbnBtIC0tZmlsdGVyIHdlYiBsaW50ICYmIGVzbGludCAtYyBhcHBzL3dlYi9lc2xpbnQuY29uZmlnLm1qcyAtLXJ1bGUgJ0BuZXh0L25leHQvbm8taHRtbC1saW5rLWZvci1wYWdlczogb2ZmJyAtLW1heC13YXJuaW5ncyAwIHBhY2thZ2VzL2JhY2tlbmQvc3JjIHBhY2thZ2VzL2NvbnRyYWN0cy9zcmMgcGFja2FnZXMvZmluZGVyLWNvcmUvc3JjIiwKICAgICJwb3N0aW5zdGFsbCI6ICJwbnBtIHByaXNtYSBnZW5lcmF0ZSIsCiAgICAiZG9jczpwcm9jZWR1cmVzIjogIm5vZGUgc2NyaXB0cy9idWlsZC1wcm9jZWR1cmUtbWFwLm1qcyAtLXdyaXRlIiwKICAgICJjaGVjayI6ICJub2RlIHNjcmlwdHMvY2hlY2stbmV4dC1jb252ZW50aW9ucy5tanMgJiYgbm9kZSBzY3JpcHRzL2NoZWNrLXRvdXItdGFyZ2V0cy5tanMgJiYgbm9kZSBzY3JpcHRzL2J1aWxkLXByb2NlZHVyZS1tYXAubWpzICYmIG5vZGUgc2NyaXB0cy9jaGVjay1kb2MtZW50aXRpZXMubWpzICYmIHBucG0gY2xlYW4gJiYgcG5wbSB0eXBlY2hlY2sgJiYgcG5wbSBsaW50IgogIH0sCiAgImRlcGVuZGVuY2llcyI6IHsK')
sub('apps/web/tsconfig.json', 'ICAiaW5jbHVkZSI6IFsKICAgICJuZXh0LWVudi5kLnRzIiwKICAgICJzcmMvZ2xvYmFsLmQudHMiLAogICAgImluc3RydW1lbnRhdGlvbi50cyIsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAic3JjIiwKICAgICJhcHAiLAogICAgImNvbXBvbmVudHMiLAogICAgImZlYXR1cmVzIiwKICAgICJob29rcyIsCiAgICAibGliIiwKICAgICJzdHlsZXMiLAogICAgInR5cGVzIiwKICAgICIqKi8qLnRzIiwKICAgICIqKi8qLnRzeCIsCiAgICAic3JjLyoqLyouZC50cyIsCiAgICAiLi4vLi4vcGFja2FnZXMvY29udHJhY3RzL3NyYy8qKi8qLnRzIiwKICAgICIuLi8uLi9wYWNrYWdlcy9jb250cmFjdHMvc3JjL2ZpbmRlciIsCiAgICAiLi4vLi4vcGFja2FnZXMvY29uZmlnIiwKICAgICIuLi8uLi9wYWNrYWdlcy9jb250cmFjdHMvc3JjL3NsdWcvc2x1Zy5zY2hlbWEudHMiLAogICAgIi4uLy4uL3BhY2thZ2VzL2ZpbmRlci1jb3JlL3NyYy8qKi8qLnRzIiwKICBdLAogICJleGNsdWRlIjogWyJub2RlX21vZHVsZXMiXQo=',
    'ICAiaW5jbHVkZSI6IFsKICAgICJuZXh0LWVudi5kLnRzIiwKICAgICJzcmMiLAogICAgIioqLyoudHMiLAogICAgIioqLyoudHN4IiwKICAgICIuLi8uLi9wYWNrYWdlcy9jb250cmFjdHMvc3JjLyoqLyoudHMiLAogICAgIi4uLy4uL3BhY2thZ2VzL2NvbmZpZyIsCiAgICAiLi4vLi4vcGFja2FnZXMvZmluZGVyLWNvcmUvc3JjLyoqLyoudHMiCiAgXSwKICAiZXhjbHVkZSI6IFsibm9kZV9tb2R1bGVzIl0K')
sub('apps/web/src/features/finder-core/utils/statusFolders.ts', 'Ci8qKgogKiBFeHRlbnNpb25zIHJlY29ubnVlcyBjb21tZSBtw6lkaWEgdmlzdWVsIChpbWFnZSAvIHZpZMOpbykuIEFsaWduw6llIHN1cgogKiBgcGlja0JhY2tlbmRCeUV4dGVuc2lvbmAgKEBjb250cmFjdHMvc3RvcmFnZSkg4oCUIG3Dqm1lIHRheG9ub21pZSBxdWUgbGUKICogZGlzcGF0Y2ggZGUgcHJvdmlkZXIuIFV0aWxpc8OpZSBzZXVsZW1lbnQgZW4gZGVybmllciByZWNvdXJzIHBhcgogKiBgaXNNZWRpYU5vZGVgLgogKi8KY29uc3QgSU1BR0VfVklERU9fRVhUUyA9IG5ldyBTZXQoWwo=',
    'Ci8qKgogKiBFeHRlbnNpb25zIHJlY29ubnVlcyBjb21tZSBtw6lkaWEgdmlzdWVsIChpbWFnZSAvIHZpZMOpbykuIFV0aWxpc8OpZQogKiBzZXVsZW1lbnQgZW4gZGVybmllciByZWNvdXJzIHBhciBgaXNNZWRpYU5vZGVgLgogKi8KY29uc3QgSU1BR0VfVklERU9fRVhUUyA9IG5ldyBTZXQoWwo=')
sub('packages/backend/src/modules/storage/adapters/r2/r2StorageAdapter.ts', 'CmltcG9ydCB7IGdldFIyQ2xpZW50LCBnZXRSMlByZXNpZ25DbGllbnQsIGdldFIyQnVja2V0IH0gZnJvbSAiQGJhY2tlbmQvbW9kdWxlcy9zdG9yYWdlL2FkYXB0ZXJzL3IyL2NsaWVudCI7CmltcG9ydCB7IHBhcnNlUGF0aFRvRGVzdGluYXRpb24gfSBmcm9tICJAYmFja2VuZC9tb2R1bGVzL21lZGlhL3NlcnZpY2VzL3BhcnNlUGF0aFRvRGVzdGluYXRpb24iOwppbXBvcnQgeyBwcm9iZU1lZGlhRGltZW5zaW9ucyB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvbWVkaWFEZXJpdmF0aXZlcy5zZXJ2aWNlIjsKCg==',
    'CmltcG9ydCB7IGdldFIyQ2xpZW50LCBnZXRSMlByZXNpZ25DbGllbnQsIGdldFIyQnVja2V0IH0gZnJvbSAiQGJhY2tlbmQvbW9kdWxlcy9zdG9yYWdlL2FkYXB0ZXJzL3IyL2NsaWVudCI7CmltcG9ydCB7IHByb2JlTWVkaWFEaW1lbnNpb25zIH0gZnJvbSAiQGJhY2tlbmQvbW9kdWxlcy9tZWRpYS9zZXJ2aWNlcy9tZWRpYURlcml2YXRpdmVzLnNlcnZpY2UiOwoK')
sub('packages/contracts/src/storage/virtual-path.ts', 'LyoqCiAqIFZpcnR1YWwgcGF0aHMgZXQgZGlzcGF0Y2ggZGUgcHJvdmlkZXIuCiAqCiAqIENlIGZpY2hpZXIgaW50cm9kdWl0IGRldXggY29uY2VwdHMgcXVpIHJlbmRlbnQgbGUgZmluZGVyIHZyYWltZW50CiAqIGluZMOpcGVuZGFudCBkdSBwcm92aWRlciBkZSBzdG9ja2FnZSA6IGxlICoqdmlydHVhbCBwYXRoKiogKGxlIHBhdGgKICogdGVsIHF1ZSB2dSBwYXIgbGEgVUkpIGV0IGxlICoqZGlzcGF0Y2hlcioqIChsYSBmb25jdGlvbiBxdWkgZMOpY2lkZQogKiBxdWVsIHByb3ZpZGVyIGjDqWJlcmdlIHF1ZWwgYXNzZXQpLgogKgogKiDilIDilIDilIAgUG91cnF1b2kgdW4gdHlwZSBgVmlydHVhbFBhdGhgIGRpc3RpbmN0IGRlIGBTdG9yYWdlUGF0aGAgPyDilIDilIDilIDilIDilIDilIDilIDilIDilIAK',
    'LyoqCiAqIFZpcnR1YWwgcGF0aHMuCiAqCiAqIENlIGZpY2hpZXIgaW50cm9kdWl0IGxlICoqdmlydHVhbCBwYXRoKiogOiBsZSBwYXRoIHRlbCBxdWUgdnUgcGFyIGxhIFVJLAogKiBxdWkgcmVuZCBsZSBmaW5kZXIgaW5kw6lwZW5kYW50IGR1IHByb3ZpZGVyIGRlIHN0b2NrYWdlLgogKgogKiDilIDilIDilIAgUG91cnF1b2kgdW4gdHlwZSBgVmlydHVhbFBhdGhgIGRpc3RpbmN0IGRlIGBTdG9yYWdlUGF0aGAgPyDilIDilIDilIDilIDilIDilIDilIDilIDilIAK')
sub('packages/contracts/src/storage/virtual-path.ts', 'ICogcHVyZS1UeXBlU2NyaXB0LCB6w6lybyBvdmVyaGVhZCBydW50aW1lLgogKi8KCmltcG9ydCB0eXBlIHsgU3RvcmFnZVByb3ZpZGVyIH0gZnJvbSAnLi9zdG9yYWdlLnR5cGVzJzsKCi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovCg==',
    'ICogcHVyZS1UeXBlU2NyaXB0LCB6w6lybyBvdmVyaGVhZCBydW50aW1lLgogKi8KCi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovCg==')
sub('packages/contracts/src/storage/virtual-path.ts', 'ICB9Cn0KCi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovCi8qICBEaXNwYXRjaGVyIDogcXVlbCBiYWNrZW5kIHBvdXIgcXVlbCBhc3NldCA/ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovCi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovCgovKioKICogUHJvdmlkZXIgZGUgc3RvY2thZ2UgZCd1biBhc3NldCA6IFIyLCBsZSBzZXVsLiBDb25zZXJ2w6kgY29tbWUgcG9pbnQKICogdW5pcXVlIGRlIGTDqWNpc2lvbiBzaSB1biBzZWNvbmQgc3RvY2thZ2UgYXJyaXZhaXQgdW4gam91ci4KICovCmV4cG9ydCBmdW5jdGlvbiBwaWNrQmFja2VuZChfbWltZVR5cGU/OiBzdHJpbmcgfCBudWxsKTogU3RvcmFnZVByb3ZpZGVyIHsKICByZXR1cm4gJ3IyJzsKfQoKLyoqIFZhcmlhbnRlIHBhciBub20gZGUgZmljaGllciAobcOqbWUgcsOoZ2xlIHF1ZSBgcGlja0JhY2tlbmRgKS4gKi8KZXhwb3J0IGZ1bmN0aW9uIHBpY2tCYWNrZW5kQnlFeHRlbnNpb24oX2ZpbGVuYW1lPzogc3RyaW5nKTogU3RvcmFnZVByb3ZpZGVyIHsKICByZXR1cm4gJ3IyJzsKfQo=',
    'ICB9Cn0K')
sub('prisma/seed.sandbox.mjs', 'IyEvdXNyL2Jpbi9lbnYgbm9kZQovLyBTZWVkIETDiURJw4kgw6AgbGEgc2FuZGJveCByZWNydXRldXJzIOKAlCBpZGVudGlmaWFudHMgQ09OTlVTLCBpZGVtcG90ZW50LgovLyBOJ2EgcmllbiDDoCB2b2lyIGF2ZWMgcHJpc21hL3NlZWQuanMgKHByb2QpLiBMYW5jw6kgcGFyIGxlIHNlcnZpY2UgYHNlZWRlcmAuCgppbXBvcnQgeyBQcmlzbWFDbGllbnQgfSBmcm9tICJAcHJpc21hL2NsaWVudCI7Cg==',
    'IyEvdXNyL2Jpbi9lbnYgbm9kZQovLyBTZWVkIETDiURJw4kgw6AgbGEgc2FuZGJveCByZWNydXRldXJzIOKAlCBpZGVudGlmaWFudHMgQ09OTlVTLCBpZGVtcG90ZW50LgovLyBMYSBwcm9kdWN0aW9uIG4nYSBwYXMgZGUgc2VlZCA6IHNlcyBkb25uw6llcyBzb250IHNhaXNpZXMgc3VyIGxlIHNpdGUuIExhbmPDqSBwYXIgbGUgc2VydmljZSBgc2VlZGVyYC4KCmltcG9ydCB7IFByaXNtYUNsaWVudCB9IGZyb20gIkBwcmlzbWEvY2xpZW50IjsK')
print("  édits ok (8 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

DELETED=("packages/backend/src/modules/media/services/parsePathToDestination.ts" "prisma/backfill-navigation.ts")
for f in "${DELETED[@]}"; do
  if [ -f "$f" ] && ! git diff --quiet HEAD -- "$f" 2>/dev/null; then
    mkdir -p "sauvegarde-avant-suppression/$(dirname "$f")"; cp "$f" "sauvegarde-avant-suppression/$f"
    echo "  ⚠ modifications locales sauvegardées : sauvegarde-avant-suppression/$f"
  fi
done
git rm -q -f --ignore-unmatch -- "${DELETED[@]}"
echo "  2 fichier(s) de code mort supprimé(s)"
[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm typecheck && pnpm lint"
else
  CHECK="pnpm check"
fi
if ! bash -c "$CHECK" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|✗ tutos|ERR_|Error:|EACCES|Permission denied" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -15
  restore; exit 1
fi
echo "  ✅ check OK"
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
chore(qualite): le lint couvre les paquets, le typecheck la config racine ; code mort retiré

- pnpm lint relit aussi packages/backend, contracts et finder-core (seul apps/web l'était) ;
  pnpm typecheck réunit le web, le backend et la configuration racine (prisma.config.ts), que
  rien ne vérifiait
- Code mort trouvé par le lint ou faute d'appelant : parsePathToDestination (son seul appelant, le
  backfill R2, a disparu avec Cloudinary), pickBackend / pickBackendByExtension (aucun appelant),
  prisma/backfill-navigation.ts (lit une colonne family absente de la base depuis 0_init)
- package.json : la clé prisma.seed visait un fichier inexistant (prisma/seed.js)
- apps/web/tsconfig.json : include réduit à ce qui existe (mêmes fichiers vérifiés, listés avant et
  après)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Serveur : git pull, puis reconstruire et relancer akfc."