#!/usr/bin/env bash
# Membres : un compte supprimé emporte son avatar, publication de documents et suppression de groupe robustes.
# Prérequis : apply-fix-avatars.sh. Aucune migration. Usage (racine du repo) : bash apply-fix-membres.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"packages/backend/src/modules/memberDocuments/router.ts" 2>/dev/null | grep -qF "Destinataire ou groupe inconnu"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "assertOutsideAvatars" "packages/backend/src/modules/storage/mediaPaths.ts" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-avatars.sh"; exit 1; }
MODIFIED=("packages/backend/src/modules/avatar/avatar.service.ts" "packages/backend/src/modules/memberDocuments/router.ts" "packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts" "packages/backend/src/modules/users/router.ts")
EXPECT=("54a63976c132:packages/backend/src/modules/avatar/avatar.service.ts" "9532891f948d:packages/backend/src/modules/memberDocuments/router.ts" "9bb4f4a5e455:packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts" "691fd575a84e:packages/backend/src/modules/users/router.ts")
DIFF=0; for e in "${EXPECT[@]}"; do h=${e%%:*}; f=${e#*:}; c=$(git rev-parse "HEAD:$f" 2>/dev/null | cut -c1-12); if [ "$c" != "$h" ]; then [ $DIFF = 0 ] && echo "❌ ces fichiers ne sont pas dans l'état attendu (rien n'a été touché) :"; echo "   $f"; DIFF=1; fi; done; [ $DIFF = 0 ] || exit 1
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Destinataire ou groupe inconnu" "packages/backend/src/modules/memberDocuments/router.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('packages/backend/src/modules/avatar/avatar.service.ts', 'Ci8qKiBTdXBwcmltZSB1biBmaWNoaWVyIGQnYXZhdGFyIGV0IHNlcyB2aWduZXR0ZXMgKG1laWxsZXVyIGVmZm9ydCwgamFtYWlzIGJsb3F1YW50KS4gKi8KYXN5bmMgZnVuY3Rpb24gcmVtb3ZlQXZhdGFyRmlsZSh2YWx1ZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7CiAgdHJ5IHsKICAgIGF3YWl0IGdldFIyQ2xpZW50KCkuc2VuZChuZXcgRGVsZXRlT2JqZWN0Q29tbWFuZCh7IEJ1Y2tldDogZ2V0UjJCdWNrZXQoKSwgS2V5OiB2YWx1ZSB9KSk7Cg==',
    'Ci8qKiBTdXBwcmltZSB1biBmaWNoaWVyIGQnYXZhdGFyIGV0IHNlcyB2aWduZXR0ZXMgKG1laWxsZXVyIGVmZm9ydCwgamFtYWlzIGJsb3F1YW50KS4gKi8KZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZUF2YXRhckZpbGUodmFsdWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gewogIHRyeSB7CiAgICBhd2FpdCBnZXRSMkNsaWVudCgpLnNlbmQobmV3IERlbGV0ZU9iamVjdENvbW1hbmQoeyBCdWNrZXQ6IGdldFIyQnVja2V0KCksIEtleTogdmFsdWUgfSkpOwo=')
sub('packages/backend/src/modules/memberDocuments/router.ts', 'ICAgICAgICB9KTsKICAgICAgfQoKICAgICAgY29uc3QgZG9jID0gYXdhaXQgY3R4LnByaXNtYS5tZW1iZXJEb2N1bWVudC5jcmVhdGUoewogICAgICAgIGRhdGE6IHsKICAgICAgICAgIG1lZGlhQXNzZXRJZDogYXNzZXQuaWQsCg==',
    'ICAgICAgICB9KTsKICAgICAgfQoKICAgICAgLy8gRGVzdGluYXRhaXJlcyBldCBncm91cGVzIHbDqXJpZmnDqXMgZW4gYmFzZSA6IHVuIGlkZW50aWZpYW50IGluY29ubnUgKHVuIG1lbWJyZSBzdXBwcmltw6kKICAgICAgLy8gcGVuZGFudCBxdWUgbGEgYm/DrnRlIGRlIGRpYWxvZ3VlIMOpdGFpdCBvdXZlcnRlKSBkb25uZSB1biBtZXNzYWdlLCBwYXMgdW5lIGVycmV1ciBpbnRlcm5lLgogICAgICBjb25zdCBba25vd25Vc2Vycywga25vd25Hcm91cHNdID0gYXdhaXQgUHJvbWlzZS5hbGwoWwogICAgICAgIGN0eC5wcmlzbWEudXNlci5jb3VudCh7IHdoZXJlOiB7IGlkOiB7IGluOiByZWNpcGllbnRJZHMgfSB9IH0pLAogICAgICAgIGN0eC5wcmlzbWEubWVtYmVyR3JvdXAuY291bnQoeyB3aGVyZTogeyBpZDogeyBpbjogZ3JvdXBJZHMgfSB9IH0pLAogICAgICBdKTsKICAgICAgaWYgKGtub3duVXNlcnMgIT09IG5ldyBTZXQocmVjaXBpZW50SWRzKS5zaXplIHx8IGtub3duR3JvdXBzICE9PSBuZXcgU2V0KGdyb3VwSWRzKS5zaXplKSB7CiAgICAgICAgdGhyb3cgbmV3IFRSUENFcnJvcih7IGNvZGU6ICJCQURfUkVRVUVTVCIsIG1lc3NhZ2U6ICJEZXN0aW5hdGFpcmUgb3UgZ3JvdXBlIGluY29ubnUgOiByZWNoYXJnZXogbGEgcGFnZS4iIH0pOwogICAgICB9CgogICAgICBjb25zdCBkb2MgPSBhd2FpdCBjdHgucHJpc21hLm1lbWJlckRvY3VtZW50LmNyZWF0ZSh7CiAgICAgICAgZGF0YTogewogICAgICAgICAgbWVkaWFBc3NldElkOiBhc3NldC5pZCwK')
sub('packages/backend/src/modules/memberDocuments/router.ts', 'ICAgICAgICAgIGF1ZGllbmNlOiBpbnB1dC5hdWRpZW5jZSwKICAgICAgICAgIHB1Ymxpc2hlZEJ5SWQ6IGN0eC5zZXNzaW9uQ2xpZW50LnVzZXIuaWQsCiAgICAgICAgICByZWNpcGllbnRzOiB7IGNyZWF0ZTogcmVjaXBpZW50SWRzLm1hcCgoaWQpID0+ICh7IHVzZXJJZDogaWQgfSkpIH0sCiAgICAgICAgICBncm91cHM6IHsgY3JlYXRlOiBncm91cElkcy5tYXAoKGlkKSA9PiAoeyBncm91cElkOiBpZCB9KSkgfSwKICAgICAgICB9LAogICAgICAgIHNlbGVjdDogeyBpZDogdHJ1ZSB9LAo=',
    'ICAgICAgICAgIGF1ZGllbmNlOiBpbnB1dC5hdWRpZW5jZSwKICAgICAgICAgIHB1Ymxpc2hlZEJ5SWQ6IGN0eC5zZXNzaW9uQ2xpZW50LnVzZXIuaWQsCiAgICAgICAgICByZWNpcGllbnRzOiB7IGNyZWF0ZTogWy4uLm5ldyBTZXQocmVjaXBpZW50SWRzKV0ubWFwKChpZCkgPT4gKHsgdXNlcklkOiBpZCB9KSkgfSwKICAgICAgICAgIGdyb3VwczogeyBjcmVhdGU6IFsuLi5uZXcgU2V0KGdyb3VwSWRzKV0ubWFwKChpZCkgPT4gKHsgZ3JvdXBJZDogaWQgfSkpIH0sCiAgICAgICAgfSwKICAgICAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSwK')
sub('packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts', 'aW1wb3J0IHsgcmVzb2x2ZUdyb3VwQmFzZUZvbGRlciB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvcmVzb2x2ZUdyb3VwQmFzZUZvbGRlci5zZXJ2aWNlIjsKaW1wb3J0IHsgaXNTcGFjZUVtcHR5IH0gZnJvbSAiQGJhY2tlbmQvbW9kdWxlcy9zdG9yYWdlL2lzU3BhY2VFbXB0eS5zZXJ2aWNlIjsKCi8qKgo=',
    'aW1wb3J0IHsgcmVzb2x2ZUdyb3VwQmFzZUZvbGRlciB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvcmVzb2x2ZUdyb3VwQmFzZUZvbGRlci5zZXJ2aWNlIjsKaW1wb3J0IHsgaXNTcGFjZUVtcHR5IH0gZnJvbSAiQGJhY2tlbmQvbW9kdWxlcy9zdG9yYWdlL2lzU3BhY2VFbXB0eS5zZXJ2aWNlIjsKaW1wb3J0IHsgZ3JvdXBJZEZyb21Mb2dpY2FsUGF0aCB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVtYmVyR3JvdXBzL2Fzc2VydENhblRyYXNoUGF0aHMuc2VydmljZSI7CgovKioK')
sub('packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts', 'ICB9KTsKICBjb25zdCBzcGFjZVBhdGhzID0gbmV3IFNldDxzdHJpbmc+KAogICAgcmVnaXN0ZXJlZC5tYXAoKHIpID0+IHIuZnVsbFBhdGgpLmZpbHRlcigoZnApID0+IGZwLmluY2x1ZGVzKCIvY29sbGFib3JhdGl2ZS1ncm91cC1zcGFjZXMvIikpLAogICk7CiAgaWYgKHNwYWNlUGF0aHMuc2l6ZSA9PT0gMCAmJiBncm91cC5pc0NvbGxhYm9yYXRpdmUpIHsK',
    'ICB9KTsKICBjb25zdCBzcGFjZVBhdGhzID0gbmV3IFNldDxzdHJpbmc+KAogICAgLy8gTCdlc3BhY2UgbHVpLW3Dqm1lLCBsdSBwYXIgcG9zaXRpb24gOiBgPHJhY2luZT4vY29sbGFib3JhdGl2ZS1ncm91cC1zcGFjZXMvPHNsdWc+LTxncm91cElkPmAKICAgIC8vICh0cm9pcyBzZWdtZW50cykuIFVuIGRvc3NpZXIgaG9tb255bWUgcmFuZ8OpIGFpbGxldXJzLCBvdSB1biBzb3VzLWRvc3NpZXIsIG4nZW4gZXN0IHBhcyB1bi4KICAgIHJlZ2lzdGVyZWQKICAgICAgLm1hcCgocikgPT4gci5mdWxsUGF0aCkKICAgICAgLmZpbHRlcigoZnApID0+IGdyb3VwSWRGcm9tTG9naWNhbFBhdGgoZnApID09PSBncm91cElkICYmIGZwLnNwbGl0KCIvIikuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aCA9PT0gMyksCiAgKTsKICBpZiAoc3BhY2VQYXRocy5zaXplID09PSAwICYmIGdyb3VwLmlzQ29sbGFib3JhdGl2ZSkgewo=')
sub('packages/backend/src/modules/memberGroups/deleteGroupWithSpace.service.ts', 'ICB9CgogIC8vIFJlLXBhcmVudGUgbGVzIGVuZmFudHMgdmVycyBsZSBwYXJlbnQgKEFWQU5UIGxlIGRlbGV0ZSkuCiAgYXdhaXQgcHJpc21hLm1lbWJlckdyb3VwLnVwZGF0ZU1hbnkoewogICAgd2hlcmU6IHsgcGFyZW50R3JvdXBJZDogZ3JvdXBJZCB9LAogICAgZGF0YTogeyBwYXJlbnRHcm91cElkOiBncm91cC5wYXJlbnRHcm91cElkIH0sCiAgfSk7CgogIC8vIFN1cHByaW1lIGxlcyBsaWduZXMgZGUgcmVnaXN0cmUgZGUgbCdlc3BhY2UgKHZpZGUpLgogIGlmIChzcGFjZVBhdGhzLnNpemUgPiAwKSB7CiAgICBhd2FpdCBwcmlzbWEuZm9sZGVyLmRlbGV0ZU1hbnkoewogICAgICB3aGVyZTogeyBhcHBSb290LCBmdWxsUGF0aDogeyBpbjogWy4uLnNwYWNlUGF0aHNdIH0gfSwKICAgIH0pOwogIH0KCiAgLy8gU3VwcHJpbWUgbGUgZ3JvdXBlIChjYXNjYWRlIERCIDogbWVtYmVyc2hpcHMgKyBsaWVucyBkb2N1bWVudHMpLgogIGF3YWl0IHByaXNtYS5tZW1iZXJHcm91cC5kZWxldGUoeyB3aGVyZTogeyBpZDogZ3JvdXBJZCB9IH0pOwp9Cg==',
    'ICB9CgogIC8vIExlcyB0cm9pcyDDqWNyaXR1cmVzIGVuc2VtYmxlIDogZGVzIGVuZmFudHMgcmUtcGFyZW50w6lzIHZlcnMgdW4gZ3JvdXBlIHF1aSBuJ2F1cmFpdCBmaW5hbGVtZW50CiAgLy8gcGFzIMOpdMOpIHN1cHByaW3DqSwgb3UgdW4gZ3JvdXBlIHN1cHByaW3DqSBhdmVjIHNlcyBlbmZhbnRzIHJhdHRhY2jDqXMgw6AgcmllbiwgbmUgZG9pdmVudCBwYXMgZXhpc3Rlci4KICBhd2FpdCBwcmlzbWEuJHRyYW5zYWN0aW9uKFsKICAgIC8vIFJlLXBhcmVudGUgbGVzIGVuZmFudHMgdmVycyBsZSBwYXJlbnQgKEFWQU5UIGxlIGRlbGV0ZSkuCiAgICBwcmlzbWEubWVtYmVyR3JvdXAudXBkYXRlTWFueSh7CiAgICAgIHdoZXJlOiB7IHBhcmVudEdyb3VwSWQ6IGdyb3VwSWQgfSwKICAgICAgZGF0YTogeyBwYXJlbnRHcm91cElkOiBncm91cC5wYXJlbnRHcm91cElkIH0sCiAgICB9KSwKICAgIC8vIFN1cHByaW1lIGxlcyBsaWduZXMgZGUgcmVnaXN0cmUgZGUgbCdlc3BhY2UgKHZpZGUpLgogICAgcHJpc21hLmZvbGRlci5kZWxldGVNYW55KHsKICAgICAgd2hlcmU6IHsgYXBwUm9vdCwgZnVsbFBhdGg6IHsgaW46IFsuLi5zcGFjZVBhdGhzXSB9IH0sCiAgICB9KSwKICAgIC8vIFN1cHByaW1lIGxlIGdyb3VwZSAoY2FzY2FkZSBEQiA6IG1lbWJlcnNoaXBzICsgbGllbnMgZG9jdW1lbnRzKS4KICAgIHByaXNtYS5tZW1iZXJHcm91cC5kZWxldGUoeyB3aGVyZTogeyBpZDogZ3JvdXBJZCB9IH0pLAogIF0pOwp9Cg==')
sub('packages/backend/src/modules/users/router.ts', 'aW1wb3J0IHsgcGFnZUNvbnRlbnRTY2hlbWFWMSB9IGZyb20gIkBjb250cmFjdHMvcGFnZSI7CmltcG9ydCB7IGFzc2VydEJpb01lZGlhQWxsb3dlZCwgaXNJbnN0cnVjdG9yVXNlciB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvdXNlcnMvaW5zdHJ1Y3RvckJpby5zZXJ2aWNlIjsKaW1wb3J0IHsgcmVzb2x2ZVBlcnNvQmFzZUZvbGRlciB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvcmVzb2x2ZVBlcnNvQmFzZUZvbGRlci5zZXJ2aWNlIjsKaW1wb3J0IHsgYXNzZXJ0T3duQXZhdGFycyB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvYXNzZXJ0T3duQXZhdGFycy5zZXJ2aWNlIjsK',
    'aW1wb3J0IHsgcGFnZUNvbnRlbnRTY2hlbWFWMSB9IGZyb20gIkBjb250cmFjdHMvcGFnZSI7CmltcG9ydCB7IGFzc2VydEJpb01lZGlhQWxsb3dlZCwgaXNJbnN0cnVjdG9yVXNlciB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvdXNlcnMvaW5zdHJ1Y3RvckJpby5zZXJ2aWNlIjsKaW1wb3J0IHsgcmVtb3ZlQXZhdGFyRmlsZSB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvYXZhdGFyL2F2YXRhci5zZXJ2aWNlIjsKaW1wb3J0IHsgcmVzb2x2ZVBlcnNvQmFzZUZvbGRlciB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvcmVzb2x2ZVBlcnNvQmFzZUZvbGRlci5zZXJ2aWNlIjsKaW1wb3J0IHsgYXNzZXJ0T3duQXZhdGFycyB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvbWVkaWEvc2VydmljZXMvYXNzZXJ0T3duQXZhdGFycy5zZXJ2aWNlIjsK')
sub('packages/backend/src/modules/users/router.ts', 'ICAgICAgICB0aHJvdyBuZXcgVFJQQ0Vycm9yKHsgY29kZTogIkZPUkJJRERFTiIsIG1lc3NhZ2U6ICJWb3VzIG5lIHBvdXZleiBwYXMgc3VwcHJpbWVyIHZvdHJlIHByb3ByZSBjb21wdGUuIiB9KTsKICAgICAgfQogICAgICByZXR1cm4gY3R4LnByaXNtYS4kdHJhbnNhY3Rpb24oYXN5bmMgKHR4KSA9PiB7CiAgICAgICAgLy8gRm9ybXVsYWlyZXMgZGUgZHJvaXQgw6AgbCdpbWFnZSBzaWduw6lzIDogZ2FyZMOpcyA1IGFucyBjb21tZSBwcmV1dmUgKHB1cmdlIG5vY3R1cm5lKS4KICAgICAgICBhd2FpdCB0eC5pbWFnZUNvbnNlbnRGb3JtLnVwZGF0ZU1hbnkoeyB3aGVyZTogeyB1c2VySWQ6IGlucHV0LmlkIH0sIGRhdGE6IHsgZGV0YWNoZWRBdDogbmV3IERhdGUoKSB9IH0pOwo=',
    'ICAgICAgICB0aHJvdyBuZXcgVFJQQ0Vycm9yKHsgY29kZTogIkZPUkJJRERFTiIsIG1lc3NhZ2U6ICJWb3VzIG5lIHBvdXZleiBwYXMgc3VwcHJpbWVyIHZvdHJlIHByb3ByZSBjb21wdGUuIiB9KTsKICAgICAgfQogICAgICBjb25zdCBhdmF0YXIgPSAoYXdhaXQgY3R4LnByaXNtYS51c2VyLmZpbmRVbmlxdWUoeyB3aGVyZTogeyBpZDogaW5wdXQuaWQgfSwgc2VsZWN0OiB7IGF2YXRhcjogdHJ1ZSB9IH0pKT8uYXZhdGFyOwogICAgICBjb25zdCBkZWxldGVkID0gYXdhaXQgY3R4LnByaXNtYS4kdHJhbnNhY3Rpb24oYXN5bmMgKHR4KSA9PiB7CiAgICAgICAgLy8gRm9ybXVsYWlyZXMgZGUgZHJvaXQgw6AgbCdpbWFnZSBzaWduw6lzIDogZ2FyZMOpcyA1IGFucyBjb21tZSBwcmV1dmUgKHB1cmdlIG5vY3R1cm5lKS4KICAgICAgICBhd2FpdCB0eC5pbWFnZUNvbnNlbnRGb3JtLnVwZGF0ZU1hbnkoeyB3aGVyZTogeyB1c2VySWQ6IGlucHV0LmlkIH0sIGRhdGE6IHsgZGV0YWNoZWRBdDogbmV3IERhdGUoKSB9IH0pOwo=')
sub('packages/backend/src/modules/users/router.ts', 'ICAgICAgICB9KTsKICAgICAgfSk7CiAgICB9KSwKCg==',
    'ICAgICAgICB9KTsKICAgICAgfSk7CiAgICAgIC8vIFNvbiBwb3J0cmFpdCBwYXJ0IGF2ZWMgbGUgY29tcHRlIDogdW4gYXZhdGFyIG4nZXN0IHJhdHRhY2jDqSBxdSfDoCBsdWkgKGF1Y3VuZSBsaWduZQogICAgICAvLyBNZWRpYUFzc2V0IG5lIGxlIHJldGllbnQpLCBpbCByZXN0ZXJhaXQgc2lub24gZGFucyBsZSBzdG9ja2FnZSBzYW5zIHF1ZSByaWVuIG5lIGwnYXR0ZWlnbmUuCiAgICAgIC8vIEFwcsOocyBsYSB0cmFuc2FjdGlvbiA6IHVuIGZpY2hpZXIgbmUgc2UgcmVzdGF1cmUgcGFzIHNpIGxhIGJhc2UgYW5udWxlLgogICAgICBpZiAoYXZhdGFyKSBhd2FpdCByZW1vdmVBdmF0YXJGaWxlKGF2YXRhcik7CiAgICAgIHJldHVybiBkZWxldGVkOwogICAgfSksCgo=')
print("  édits ok (9 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && pnpm --filter backend typecheck && pnpm typecheck && pnpm lint"
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
fix(membres): un compte supprimé emporte son avatar, publication et suppression de groupe robustes

- user.delete : le fichier d'avatar est supprimé du stockage (après la transaction) ; il y restait
  sans que rien ne l'atteigne
- memberDocument.publish : destinataires et groupes vérifiés en base (un identifiant inconnu donnait
  une erreur interne), doublons écartés
- deleteGroupWithSpace : l'espace est reconnu par position (plus par « contient
  /collaborative-group-spaces/ ») ; re-parentage, registre et groupe dans une transaction

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG
echo "Aucune migration. Serveur : git pull, puis reconstruire et relancer akfc."