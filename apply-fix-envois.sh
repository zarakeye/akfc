#!/usr/bin/env bash
# Envois : le logo du site contrôlé comme ceux des partenaires (SVG sans script ni ressource externe),
# une reprise du dépôt membre qui ne renvoie plus ce qui est arrivé, et la partie « Les envois de fichiers »
# dans la navigation de la doc.
# Prérequis : apply-docs-finder.sh. Pas de migration.
# Usage (racine du repo) : bash apply-fix-envois.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/docs/lib/docs.navigation.ts" 2>/dev/null | grep -qF "Les envois de fichiers"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "L’explorateur de fichiers, en quatre chapitres" "apps/web/content/docs/dev/index.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-doc-finder.sh puis apply-docs-finder.sh"; exit 1; }
MODIFIED=("apps/web/src/features/common-repository/CommonRepositoryUpload.tsx" "apps/web/src/features/admin/perso/PersoPhotoUploader.tsx" "packages/backend/src/modules/siteSettings/router.ts" "apps/web/src/features/docs/lib/docs.navigation.ts")
CREATED=("e2e/logos.spec.ts")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Les envois de fichiers" "apps/web/src/features/docs/lib/docs.navigation.ts" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

mkdir -p "e2e"
base64 -d > "e2e/logos.spec.ts" <<'B64'
aW1wb3J0IHsgZXhwZWN0LCB0ZXN0IH0gZnJvbSAiQHBsYXl3cmlnaHQvdGVzdCI7CgppbXBvcnQg
eyBsb2dpbkFzLCB0cnBjTXV0YXRpb24gfSBmcm9tICIuL2hlbHBlcnMiOwppbXBvcnQgeyBVU0VS
UyB9IGZyb20gIi4vZGF0YS5tanMiOwoKLyoqIFVuIFNWRyBtaW5pbWFsLCBlbmNvZMOpIGNvbW1l
IGxlIGZhaXQgbGUgZm9ybXVsYWlyZSBkZXMgcsOpZ2xhZ2VzIChiYXNlNjQgZHUgZmljaGllciku
ICovCmNvbnN0IHN2ZyA9IChib2R5OiBzdHJpbmcpID0+CiAgQnVmZmVyLmZyb20oYDxzdmcgeG1s
bnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMTAgMTAiPiR7Ym9k
eX08L3N2Zz5gLCAidXRmOCIpLnRvU3RyaW5nKCJiYXNlNjQiKTsKCnRlc3QuZGVzY3JpYmUoIkxv
Z28gZHUgc2l0ZSIsICgpID0+IHsKICB0ZXN0KCJ1biBTVkcgcXVpIGNvbnRpZW50IHVuIHNjcmlw
dCBlc3QgcmVmdXPDqSDDoCBsJ2Vudm9pIiwgYXN5bmMgKHsgcGFnZSB9KSA9PiB7CiAgICBhd2Fp
dCBsb2dpbkFzKHBhZ2UsIFVTRVJTLmFkbWluLmVtYWlsKTsKICAgIGNvbnN0IHsgc3RhdHVzLCBl
cnJvciB9ID0gYXdhaXQgdHJwY011dGF0aW9uKHBhZ2UucmVxdWVzdCwgInNpdGVTZXR0aW5ncy51
cGxvYWRMb2dvIiwgewogICAgICBkYXRhQmFzZTY0OiBzdmcoIjxzY3JpcHQ+YWxlcnQoMSk8L3Nj
cmlwdD4iKSwKICAgICAgbWltZVR5cGU6ICJpbWFnZS9zdmcreG1sIiwKICAgIH0pOwogICAgZXhw
ZWN0KHN0YXR1cykudG9CZSg0MDApOwogICAgZXhwZWN0KGVycm9yPy5tZXNzYWdlKS50b0NvbnRh
aW4oImNvbnRlbnUgYWN0aWYiKTsKICB9KTsKCiAgdGVzdCgidW4gU1ZHIHF1aSBjaGFyZ2UgdW5l
IHJlc3NvdXJjZSBleHRlcm5lIGVzdCByZWZ1c8OpIiwgYXN5bmMgKHsgcGFnZSB9KSA9PiB7CiAg
ICBhd2FpdCBsb2dpbkFzKHBhZ2UsIFVTRVJTLmFkbWluLmVtYWlsKTsKICAgIGNvbnN0IHsgc3Rh
dHVzLCBlcnJvciB9ID0gYXdhaXQgdHJwY011dGF0aW9uKHBhZ2UucmVxdWVzdCwgInNpdGVTZXR0
aW5ncy51cGxvYWRMb2dvIiwgewogICAgICBkYXRhQmFzZTY0OiBzdmcoJzxpbWFnZSBocmVmPSJo
dHRwczovL2V4ZW1wbGUudGVzdC94LnBuZyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIi8+JyksCiAg
ICAgIG1pbWVUeXBlOiAiaW1hZ2Uvc3ZnK3htbCIsCiAgICB9KTsKICAgIGV4cGVjdChzdGF0dXMp
LnRvQmUoNDAwKTsKICAgIGV4cGVjdChlcnJvcj8ubWVzc2FnZSkudG9Db250YWluKCJyZXNzb3Vy
Y2UgZXh0ZXJuZSIpOwogIH0pOwoKICB0ZXN0KCJ1biBmaWNoaWVyIHF1aSBuJ2VzdCBwYXMgdW4g
U1ZHIGVzdCByZWZ1c8OpIiwgYXN5bmMgKHsgcGFnZSB9KSA9PiB7CiAgICBhd2FpdCBsb2dpbkFz
KHBhZ2UsIFVTRVJTLmFkbWluLmVtYWlsKTsKICAgIGNvbnN0IHsgc3RhdHVzLCBlcnJvciB9ID0g
YXdhaXQgdHJwY011dGF0aW9uKHBhZ2UucmVxdWVzdCwgInNpdGVTZXR0aW5ncy51cGxvYWRMb2dv
IiwgewogICAgICBkYXRhQmFzZTY0OiBCdWZmZXIuZnJvbSgicGFzIHVuZSBpbWFnZSIsICJ1dGY4
IikudG9TdHJpbmcoImJhc2U2NCIpLAogICAgICBtaW1lVHlwZTogImltYWdlL3N2Zyt4bWwiLAog
ICAgfSk7CiAgICBleHBlY3Qoc3RhdHVzKS50b0JlKDQwMCk7CiAgICBleHBlY3QoZXJyb3I/Lm1l
c3NhZ2UpLnRvQ29udGFpbigicGFzIHVuIFNWRyIpOwogIH0pOwp9KTsK
B64

python3 - <<'PY'
import base64
spec_skip_done = False
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    if s.count(old) == 0 and s.count(new) == 1 and spec_skip_done: return  # déjà fait par un script précédent
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('apps/web/src/features/common-repository/CommonRepositoryUpload.tsx', 'ICAgIHNldFN0YXRlKCJ1cGxvYWRpbmciKTsKICAgIHNldE1lc3NhZ2UobnVsbCk7CiAgICB0cnkgewogICAgICBmb3IgKGNvbnN0IGl0IG9mIGl0ZW1zKSBhd2FpdCB1cGxvYWRSMihpdCk7CgogICAgICAvLyBMaWJlbGzDqSBodW1haW4gc2V1bGVtZW50IHBvdXIgbGUgRMOpcMO0dCBjb21tdW4gKGxlcyBlbnRpdMOpcyBvbnQgbGV1ciBub20pLgo=',
    'ICAgIHNldFN0YXRlKCJ1cGxvYWRpbmciKTsKICAgIHNldE1lc3NhZ2UobnVsbCk7CiAgICAvLyBVbiBwYXIgdW4sIGV0IGNoYXF1ZSBmaWNoaWVyIGFycml2w6kgcXVpdHRlIGF1c3NpdMO0dCBsYSBsaXN0ZSA6IHNpIGwnZW52b2kgcydhcnLDqnRlIGVuIHJvdXRlLAogICAgLy8gaWwgbmUgcmVzdGUgcXVlIGNldXggcXVpIG4nb250IHBhcyBhYm91dGksIGV0IMKrIETDqXBvc2VyIMK7IG5lIHJlbnZvaWUgcGFzIGxlcyBhdXRyZXMgKGxlCiAgICAvLyBzZXJ2ZXVyIGxlcyByZWZ1c2VyYWl0IDogdW4gbWVtYnJlIG5lIHJlbXBsYWNlIHBhcyB1biBmaWNoaWVyIGTDqWrDoCBkw6lwb3PDqSkuCiAgICBsZXQgc2VudCA9IDA7CiAgICB0cnkgewogICAgICBmb3IgKGNvbnN0IGl0IG9mIGl0ZW1zKSB7CiAgICAgICAgYXdhaXQgdXBsb2FkUjIoaXQpOwogICAgICAgIHNlbnQgKz0gMTsKICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKGl0LnByZXZpZXdVcmwpOwogICAgICAgIHNldEl0ZW1zKChwcmV2KSA9PiBwcmV2LmZpbHRlcigoeCkgPT4geC5pZCAhPT0gaXQuaWQpKTsKICAgICAgfQoKICAgICAgLy8gTGliZWxsw6kgaHVtYWluIHNldWxlbWVudCBwb3VyIGxlIETDqXDDtHQgY29tbXVuIChsZXMgZW50aXTDqXMgb250IGxldXIgbm9tKS4K')
sub('apps/web/src/features/common-repository/CommonRepositoryUpload.tsx', 'ICAgICAgfQogICAgICBzZXRTdGF0ZSgiZG9uZSIpOwogICAgICBzZXRNZXNzYWdlKGAke2l0ZW1zLmxlbmd0aH0gZmljaGllcihzKSBkw6lwb3PDqShzKS5gKTsKICAgICAgaXRlbXMuZm9yRWFjaCgoaXQpID0+IFVSTC5yZXZva2VPYmplY3RVUkwoaXQucHJldmlld1VybCkpOwogICAgICBzZXRJdGVtcyhbXSk7CiAgICAgIHNldENvbnRhaW5lck5hbWUoIiIpOwogICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgIHNldFN0YXRlKCJlcnJvciIpOwogICAgICBzZXRNZXNzYWdlKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAiw4ljaGVjIGR1IGTDqXDDtHQuIik7CiAgICB9CiAgfTsK',
    'ICAgICAgfQogICAgICBzZXRTdGF0ZSgiZG9uZSIpOwogICAgICBzZXRNZXNzYWdlKGAke3NlbnR9IGZpY2hpZXIocykgZMOpcG9zw6kocykuYCk7CiAgICAgIHNldENvbnRhaW5lck5hbWUoIiIpOwogICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgIHNldFN0YXRlKCJlcnJvciIpOwogICAgICBjb25zdCByZWFzb24gPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogIsOJY2hlYyBkdSBkw6lww7R0LiI7CiAgICAgIHNldE1lc3NhZ2Uoc2VudCA+IDAgPyBgJHtzZW50fSBmaWNoaWVyKHMpIGTDqXBvc8OpKHMpLCBwdWlzIDogJHtyZWFzb259YCA6IHJlYXNvbik7CiAgICB9CiAgfTsK')
sub('apps/web/src/features/admin/perso/PersoPhotoUploader.tsx', 'ICB9OwoKICAvKiAtLS0tIFVwbG9hZCA6IGF1dG9yaXNhdGlvbiDihpIgUE9TVCBuYXZpZ2F0ZXVyIOKGkiByZWdpc3RlciAtLS0tICovCiAgY29uc3QgdXBsb2FkID0gYXN5bmMgKCkgPT4gewogICAgY29uc3QgdG9VcGxvYWQgPSBpdGVtcy5maWx0ZXIoKGl0KSA9PiBpdC5zdGF0dXMgPT09ICdwZW5kaW5nJyk7Cg==',
    'ICB9OwoKICAvKiAtLS0tIFVwbG9hZCA6IGF1dG9yaXNhdGlvbiDihpIgUFVUIGR1IG5hdmlnYXRldXIg4oaSIHJlZ2lzdGVyIC0tLS0gKi8KICBjb25zdCB1cGxvYWQgPSBhc3luYyAoKSA9PiB7CiAgICBjb25zdCB0b1VwbG9hZCA9IGl0ZW1zLmZpbHRlcigoaXQpID0+IGl0LnN0YXR1cyA9PT0gJ3BlbmRpbmcnKTsK')
sub('packages/backend/src/modules/siteSettings/router.ts', 'aW1wb3J0IHsgeiB9IGZyb20gInpvZCI7CmltcG9ydCB7IFRSUENFcnJvciB9IGZyb20gIkB0cnBjL3NlcnZlciI7CgppbXBvcnQgeyByb3V0ZXIsIHB1YmxpY1Byb2NlZHVyZSwgcHJvdGVjdGVkUHJvY2VkdXJlIH0gZnJvbSAiQGJhY2tlbmQvdHJwYy9jb3JlIjsKaW1wb3J0IHsgaXNBZG1pbiB9IGZyb20gIkBiYWNrZW5kL3RycGMvbWlkZGxld2FyZSI7CmltcG9ydCB7IHNhdmVTaXRlQ29udGFjdFNjaGVtYSB9IGZyb20gIkBjb250cmFjdHMvc2l0ZUNvbnRhY3Qvc2l0ZUNvbnRhY3Quc2NoZW1hIjsKaW1wb3J0IHsgY29tcGFjdElkLCBzYXZlTGVnYWxTZXR0aW5nc1NjaGVtYSB9IGZyb20gIkBjb250cmFjdHMvbGVnYWwvbGVnYWxTZXR0aW5ncy5zY2hlbWEiOwo=',
    'aW1wb3J0IHsgeiB9IGZyb20gInpvZCI7CgppbXBvcnQgeyByb3V0ZXIsIHB1YmxpY1Byb2NlZHVyZSwgcHJvdGVjdGVkUHJvY2VkdXJlIH0gZnJvbSAiQGJhY2tlbmQvdHJwYy9jb3JlIjsKaW1wb3J0IHsgaXNBZG1pbiB9IGZyb20gIkBiYWNrZW5kL3RycGMvbWlkZGxld2FyZSI7CmltcG9ydCB7IHZhbGlkYXRlTG9nbyB9IGZyb20gIkBiYWNrZW5kL21vZHVsZXMvc2l0ZVBhcnRuZXJzL3NpdGVQYXJ0bmVycy5zZXJ2aWNlIjsKaW1wb3J0IHsgc2F2ZVNpdGVDb250YWN0U2NoZW1hIH0gZnJvbSAiQGNvbnRyYWN0cy9zaXRlQ29udGFjdC9zaXRlQ29udGFjdC5zY2hlbWEiOwppbXBvcnQgeyBjb21wYWN0SWQsIHNhdmVMZWdhbFNldHRpbmdzU2NoZW1hIH0gZnJvbSAiQGNvbnRyYWN0cy9sZWdhbC9sZWdhbFNldHRpbmdzLnNjaGVtYSI7Cg==')
sub('packages/backend/src/modules/siteSettings/router.ts', 'ICAgIC5tdXRhdGlvbihhc3luYyAoeyBjdHgsIGlucHV0IH0pID0+IHsKICAgICAgY29uc3QgYnVmID0gQnVmZmVyLmZyb20oaW5wdXQuZGF0YUJhc2U2NCwgImJhc2U2NCIpOwogICAgICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkgewogICAgICAgIHRocm93IG5ldyBUUlBDRXJyb3IoeyBjb2RlOiAiQkFEX1JFUVVFU1QiLCBtZXNzYWdlOiAiRmljaGllciB2aWRlLiIgfSk7CiAgICAgIH0KICAgICAgaWYgKGJ1Zi5sZW5ndGggPiA1MTIgKiAxMDI0KSB7CiAgICAgICAgdGhyb3cgbmV3IFRSUENFcnJvcih7CiAgICAgICAgICBjb2RlOiAiQkFEX1JFUVVFU1QiLAogICAgICAgICAgbWVzc2FnZTogIkxvZ28gdHJvcCB2b2x1bWluZXV4IChtYXggNTEyIEtvKS4iLAogICAgICAgIH0pOwogICAgICB9CiAgICAgIGF3YWl0IHB1dFNpdGVMb2dvKGJ1ZiwgaW5wdXQubWltZVR5cGUpOwogICAgICBhd2FpdCBjdHgucHJpc21hLnNpdGVTZXR0aW5ncy51cHNlcnQoewo=',
    'ICAgIC5tdXRhdGlvbihhc3luYyAoeyBjdHgsIGlucHV0IH0pID0+IHsKICAgICAgY29uc3QgYnVmID0gQnVmZmVyLmZyb20oaW5wdXQuZGF0YUJhc2U2NCwgImJhc2U2NCIpOwogICAgICAvLyBNw6ptZXMgY29udHLDtGxlcyBxdWUgbGVzIGxvZ29zIGRlcyBwYXJ0ZW5haXJlcyA6IHRhaWxsZSwgZXQgdW4gU1ZHIHNhbnMgc2NyaXB0LCBzYW5zCiAgICAgIC8vIMOpdsOpbmVtZW50LCBzYW5zIHJlc3NvdXJjZSBleHRlcm5lLiBMYSByb3V0ZSBxdWkgbGUgc2VydCBsJ2VuZmVybWUgZMOpasOgIChzYW5kYm94LCBub3NuaWZmKSA7CiAgICAgIC8vIG9uIG5lIHN0b2NrZSBwYXMgcG91ciBhdXRhbnQgY2UgcXUnZWxsZSBkZXZyYWl0IG5ldXRyYWxpc2VyLgogICAgICB2YWxpZGF0ZUxvZ28oYnVmLCBpbnB1dC5taW1lVHlwZSk7CiAgICAgIGF3YWl0IHB1dFNpdGVMb2dvKGJ1ZiwgaW5wdXQubWltZVR5cGUpOwogICAgICBhd2FpdCBjdHgucHJpc21hLnNpdGVTZXR0aW5ncy51cHNlcnQoewo=')
sub('apps/web/src/features/docs/lib/docs.navigation.ts', 'ICAiU3RvY2thZ2UgZXQgbcOpZGlhcyIsCiAgIkxlIGZpbmRlciIsCiAgIkNvbnRlbnUgw6lkaXRvcmlhbCIsCiAgIkRvbWFpbmUgZHUgY2x1YiIsCg==',
    'ICAiU3RvY2thZ2UgZXQgbcOpZGlhcyIsCiAgIkxlIGZpbmRlciIsCiAgIkxlcyBlbnZvaXMgZGUgZmljaGllcnMiLAogICJDb250ZW51IMOpZGl0b3JpYWwiLAogICJEb21haW5lIGR1IGNsdWIiLAo=')
print("  édits ok (6 substitutions, 1 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && node scripts/check-doc-snippets.mjs && pnpm typecheck && pnpm lint"
else
  CHECK="pnpm check"
fi
if ! bash -c "$CHECK" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ check ÉCHOUÉ :"
  grep -nE "error TS|✗ |ERR_|Error:|EACCES|Permission denied" /tmp/akfc_tc.log | head -12
  echo "  … fin du journal :"; grep -v '^[[:space:]]*$' /tmp/akfc_tc.log | tail -15
  restore; exit 1
fi
echo "  ✅ check OK"
git add -- "${MODIFIED[@]}" "${CREATED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
Envois : logo du site contrôlé comme ceux des partenaires, reprise du dépôt membre

- siteSettings.uploadLogo passe par validateLogo : un SVG avec script,
  événement ou ressource externe est refusé à l'envoi (e2e/logos.spec.ts).
- /deposer : chaque fichier arrivé quitte la liste ; une reprise après
  échec ne renvoie plus ce qui a déjà été déposé.
- Partie « Les envois de fichiers » dans la navigation de la doc.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Pas de migration. Ensuite : apply-docs-envois.sh."