#!/usr/bin/env bash
# Espaces collaboratifs : un espace garde son dossier quand le groupe est renommé
# (nom affiché = nom du groupe ; aucun fichier déplacé). Doc à jour.
# Prérequis : apply-commentaire-destinations.sh.
# Usage (racine du repo) : bash apply-espace-dossier-stable.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/content/docs/dev/membres/espaces-collaboratifs.mdx" 2>/dev/null | grep -qF "Un espace a **un seul dossier pour toute sa vie**"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "Le dossier de dépôt lui-même n" "packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-commentaire-destinations.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/membres/espaces-collaboratifs.mdx" "packages/backend/src/modules/media/services/resolveGroupBaseFolder.service.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Un espace a **un seul dossier pour toute sa vie**" "apps/web/content/docs/dev/membres/espaces-collaboratifs.mdx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/content/docs/dev/membres/espaces-collaboratifs.mdx', 'YGBgdHMKLy8gcGFja2FnZXMvYmFja2VuZC9zcmMvbW9kdWxlcy9tZWRpYS9zZXJ2aWNlcy9yZXNvbHZlR3JvdXBCYXNlRm9sZGVyLnNlcnZpY2UudHMgKGV4dHJhaXQpCmNvbnN0IGdyb3VwU2x1ZyA9IHNsdWcoZ3JvdXAubmFtZSkgfHwgYGdyb3VwLSR7Z3JvdXBJZH1gOwoKcmV0dXJuIGAke2FwcFJvb3R9L2NvbGxhYm9yYXRpdmUtZ3JvdXAtc3BhY2VzLyR7Z3JvdXBTbHVnfS0ke2dyb3VwSWR9YDsKYGBgCgpMZSBjaGVtaW4gc2UgdGVybWluZSBwYXIgbCdpZGVudGlmaWFudCBkdSBncm91cGUuIExlIG5vbSBsaXNpYmxlIGF1IGTDqWJ1dCBzZXJ0IMOgIHMneSByZXRyb3V2ZXIgZGFucyBsZSBzdG9ja2FnZSwgbWFpcyBjJ2VzdCBsJ2lkZW50aWZpYW50IHF1aSBjb21wdGUgOiB0b3V0ZXMgbGVzIHbDqXJpZmljYXRpb25zIGRlIGRyb2l0cyBsZSBsaXNlbnQsIGV0IGxlIGZpbmRlciBhZmZpY2hlIGxlIG5vbSBkdSBncm91cGUgw6AgbGEgcGxhY2UgZHUgc2VnbWVudCB0ZWNobmlxdWUuCgojIyBMZWN0ZXVyIG91IMOpZGl0ZXVyCg==',
    'YGBgdHMKLy8gcGFja2FnZXMvYmFja2VuZC9zcmMvbW9kdWxlcy9tZWRpYS9zZXJ2aWNlcy9yZXNvbHZlR3JvdXBCYXNlRm9sZGVyLnNlcnZpY2UudHMgKGV4dHJhaXQpCmNvbnN0IGNvbnRhaW5lciA9IGAke2FwcFJvb3R9L2NvbGxhYm9yYXRpdmUtZ3JvdXAtc3BhY2VzL2A7CmNvbnN0IGV4aXN0aW5nID0gYXdhaXQgcHJpc21hLmZvbGRlci5maW5kTWFueSh7CiAgd2hlcmU6IHsgYXBwUm9vdCwgZnVsbFBhdGg6IHsgc3RhcnRzV2l0aDogY29udGFpbmVyLCBlbmRzV2l0aDogYC0ke2dyb3VwSWR9YCB9IH0sCiAgb3JkZXJCeTogeyBjcmVhdGVkQXQ6ICJhc2MiIH0sCiAgc2VsZWN0OiB7IGZ1bGxQYXRoOiB0cnVlIH0sCn0pOwovLyBVbiBlc3BhY2UgZXN0IHVuIGVuZmFudCBESVJFQ1QgZHUgY29udGVuZXVyIChwYXMgdW4gc291cy1kb3NzaWVyIGhvbW9ueW1lKS4KY29uc3Qgc3BhY2UgPSBleGlzdGluZy5maW5kKChmKSA9PiAhZi5mdWxsUGF0aC5zbGljZShjb250YWluZXIubGVuZ3RoKS5pbmNsdWRlcygiLyIpKTsKaWYgKHNwYWNlKSByZXR1cm4gc3BhY2UuZnVsbFBhdGg7Cgpjb25zdCBncm91cFNsdWcgPSBzbHVnKGdyb3VwLm5hbWUpIHx8IGBncm91cC0ke2dyb3VwSWR9YDsKCnJldHVybiBgJHtjb250YWluZXJ9JHtncm91cFNsdWd9LSR7Z3JvdXBJZH1gOwpgYGAKCkxlIGNoZW1pbiBzZSB0ZXJtaW5lIHBhciBsJ2lkZW50aWZpYW50IGR1IGdyb3VwZS4gQydlc3QgbHVpIHF1aSBjb21wdGUgOiB0b3V0ZXMgbGVzIHbDqXJpZmljYXRpb25zIGRlIGRyb2l0cyBsZSBsaXNlbnQsIGV0IGxlIGZpbmRlciBhZmZpY2hlIGxlIG5vbSBkdSBncm91cGUgw6AgbGEgcGxhY2UgZHUgc2VnbWVudCB0ZWNobmlxdWUuCgpVbiBlc3BhY2UgYSAqKnVuIHNldWwgZG9zc2llciBwb3VyIHRvdXRlIHNhIHZpZSoqLiBMZSBub20gbGlzaWJsZSBhdSBkw6lidXQgZHUgY2hlbWluIGVzdCBjZWx1aSBkdSBncm91cGUgw6AgbGEgY3LDqWF0aW9uIGRlIGwnZXNwYWNlLCBldCBpbCBuZSBjaGFuZ2UgcGx1cyA6IHNpIGxlIGRvc3NpZXIgZXhpc3RlIGTDqWrDoCwgbGEgZm9uY3Rpb24gbGUgcmVudm9pZSB0ZWwgcXVlbC4gUmVub21tZXIgbGUgZ3JvdXBlIHJlbm9tbWUgbCdlc3BhY2UgcG91ciB0b3V0IGxlIG1vbmRlLCBwYXIgbGUgbm9tIGFmZmljaMOpLCBzYW5zIGTDqXBsYWNlciB1biBzZXVsIGZpY2hpZXIuIExlIGZpbmRlciByZWZ1c2UgcGFyIGFpbGxldXJzIGRlIHJlbm9tbWVyIGRpcmVjdGVtZW50IGxlIGRvc3NpZXIgZCd1biBlc3BhY2UgOiBzb24gbm9tIG5lIGNoYW5nZSBxdWUgcGFyIGNlbHVpIGR1IGdyb3VwZS4KCiMjIExlY3RldXIgb3Ugw6lkaXRldXIK')
sub('packages/backend/src/modules/media/services/resolveGroupBaseFolder.service.ts', 'Ci8qKgogKiBSw6lzb3V0IGxlIGRvc3NpZXIgUkFDSU5FIGRlIGwnZXNwYWNlIGQndW4gZ3JvdXBlIENPTExBQk9SQVRJRiwgU0FOUwogKiBzb3VzLWRvc3NpZXIgZGUgbcOpZGlhIOKAlCBtw6ptZSBsb2dpcXVlIHF1ZSBgcmVzb2x2ZVBlcnNvQmFzZUZvbGRlcmAsIG1haXMKICogZMOpcml2w6llIGR1IGdyb3VwZS4gTGUgc2VnbWVudCBgLSR7Z3JvdXBJZH1gIGFzc3VyZSBsJ3VuaWNpdMOpIGV0IHJlc3RlIFNUQUJMRQogKiBtw6ptZSBzaSBsZSBub20gKGRvbmMgbGUgc2x1ZykgY2hhbmdlLgogKgogKiAgIOKGkiBgJHthcHBSb290fS9ncm91cHMvJHtncm91cFNsdWd9LSR7Z3JvdXBJZH1gCiAqCiAqIEzDqHZlIHNpIGxlIGdyb3VwZSBuJ2V4aXN0ZSBwYXMgb3Ugbidlc3QgcGFzIGNvbGxhYm9yYXRpZiAodW5lIGxpc3RlIGRlCiAqIGRpZmZ1c2lvbiBuJ2EgcGFzIGQnZXNwYWNlKS4gUGFzIGVuY29yZSBicmFuY2jDqSBzdXIgbCd1cGxvYWQgOiBjZSBzZXJhCiAqIGwnaW5jcsOpbWVudCAxYiAoZGVzdGluYXRpb24gKyBnYXJkZXMgZGUgZMOpcMO0dC9zdXBwcmVzc2lvbi9jb25zdWx0YXRpb24pLgogKi8KZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVHcm91cEJhc2VGb2xkZXIocGFyYW1zOiB7Cg==',
    'Ci8qKgogKiBSw6lzb3V0IGxlIGRvc3NpZXIgUkFDSU5FIGRlIGwnZXNwYWNlIGQndW4gZ3JvdXBlIENPTExBQk9SQVRJRiA6CiAqCiAqICAg4oaSIGAke2FwcFJvb3R9L2NvbGxhYm9yYXRpdmUtZ3JvdXAtc3BhY2VzLyR7Z3JvdXBTbHVnfS0ke2dyb3VwSWR9YAogKgogKiBVbiBlc3BhY2UgbidhIHF1J1VOIGRvc3NpZXIgcG91ciB0b3V0ZSBzYSB2aWUuIFMnaWwgZXhpc3RlIGTDqWrDoCAobGlnbmUgYEZvbGRlcmAgZG9udCBsZQogKiBjaGVtaW4gc2UgdGVybWluZSBwYXIgYC0ke2dyb3VwSWR9YCksIGMnZXN0IGx1aSBxdWkgZXN0IHJlbnZvecOpLCBtw6ptZSBzaSBsZSBncm91cGUgYSDDqXTDqQogKiByZW5vbW3DqSBkZXB1aXMgOiByZW5vbW1lciBsZSBncm91cGUgcmVub21tZSBsJ2VzcGFjZSBwYXIgbGUgTk9NIEFGRklDSMOJIChjZWx1aSBkdSBncm91cGUsCiAqIHBhcnRvdXQgZGFucyBsZSBmaW5kZXIpLCBzYW5zIGTDqXBsYWNlciBhdWN1biBmaWNoaWVyLiBMZSBub20gdGVjaG5pcXVlIGR1IGRvc3NpZXIgZ2FyZGUKICogbGUgc2x1ZyBkJ29yaWdpbmUuIExlIHBsdXMgYW5jaWVuIGdhZ25lIHNpIHVuIHJlbm9tbWFnZSBwYXNzw6kgZW4gYSBjcsOpw6kgdW4gc2Vjb25kLgogKiBVbiBub3V2ZWF1IGRvc3NpZXIgbidlc3QgY2FsY3Vsw6kgKHNsdWcgZHUgbm9tIGFjdHVlbCkgcXVlIHBvdXIgdW4gZ3JvdXBlIHF1aSBuJ2VuIGEKICogZW5jb3JlIGphbWFpcyBldS4KICoKICogTMOodmUgc2kgbGUgZ3JvdXBlIG4nZXhpc3RlIHBhcyBvdSBuJ2VzdCBwYXMgY29sbGFib3JhdGlmICh1bmUgbGlzdGUgZGUgZGlmZnVzaW9uIG4nYQogKiBwYXMgZCdlc3BhY2UpLgogKi8KZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc29sdmVHcm91cEJhc2VGb2xkZXIocGFyYW1zOiB7Cg==')
sub('packages/backend/src/modules/media/services/resolveGroupBaseFolder.service.ts', 'ICB9CgogIGNvbnN0IGdyb3VwU2x1ZyA9IHNsdWcoZ3JvdXAubmFtZSkgfHwgYGdyb3VwLSR7Z3JvdXBJZH1gOwoKICByZXR1cm4gYCR7YXBwUm9vdH0vY29sbGFib3JhdGl2ZS1ncm91cC1zcGFjZXMvJHtncm91cFNsdWd9LSR7Z3JvdXBJZH1gOwp9Cg==',
    'ICB9CgogIGNvbnN0IGNvbnRhaW5lciA9IGAke2FwcFJvb3R9L2NvbGxhYm9yYXRpdmUtZ3JvdXAtc3BhY2VzL2A7CiAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBwcmlzbWEuZm9sZGVyLmZpbmRNYW55KHsKICAgIHdoZXJlOiB7IGFwcFJvb3QsIGZ1bGxQYXRoOiB7IHN0YXJ0c1dpdGg6IGNvbnRhaW5lciwgZW5kc1dpdGg6IGAtJHtncm91cElkfWAgfSB9LAogICAgb3JkZXJCeTogeyBjcmVhdGVkQXQ6ICJhc2MiIH0sCiAgICBzZWxlY3Q6IHsgZnVsbFBhdGg6IHRydWUgfSwKICB9KTsKICAvLyBVbiBlc3BhY2UgZXN0IHVuIGVuZmFudCBESVJFQ1QgZHUgY29udGVuZXVyIChwYXMgdW4gc291cy1kb3NzaWVyIGhvbW9ueW1lKS4KICBjb25zdCBzcGFjZSA9IGV4aXN0aW5nLmZpbmQoKGYpID0+ICFmLmZ1bGxQYXRoLnNsaWNlKGNvbnRhaW5lci5sZW5ndGgpLmluY2x1ZGVzKCIvIikpOwogIGlmIChzcGFjZSkgcmV0dXJuIHNwYWNlLmZ1bGxQYXRoOwoKICBjb25zdCBncm91cFNsdWcgPSBzbHVnKGdyb3VwLm5hbWUpIHx8IGBncm91cC0ke2dyb3VwSWR9YDsKCiAgcmV0dXJuIGAke2NvbnRhaW5lcn0ke2dyb3VwU2x1Z30tJHtncm91cElkfWA7Cn0K')
print("  édits ok (3 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm --filter backend typecheck && pnpm typecheck"
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
git add "${MODIFIED[@]}" "${CREATED[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
espaces collaboratifs : un seul dossier par espace, quel que soit le nom actuel du groupe

resolveGroupBaseFolder renvoie le dossier existant terminé par -<groupId> (le
plus ancien) ; un nouveau n'est calculé que pour un groupe sans espace. Renommer
le groupe renomme l'espace par le nom affiché, sans déplacer de fichier.
Doc : chapitre « Les espaces collaboratifs » à jour.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG