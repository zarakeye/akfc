#!/usr/bin/env bash
# Doc : une seule forme d'arborescence. Les deux dernières arborescences en texte (Le routage, Pourquoi le modèle)
# passent à <Arbre> ; le composant FileTree, plus utilisé, est retiré. Pas de migration.
# Prérequis : apply-docs-partie-docker.sh.
# Usage (racine du repo) : bash apply-docs-arbres-partout.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/mdx-components.tsx" 2>/dev/null | grep -qF "la seule forme d'arborescence de la doc"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "## Les mots de Docker" "apps/web/content/docs/dev/docker/pourquoi-docker.mdx" 2>/dev/null || { echo "lancez d'abord apply-docs-partie-docker.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/donnees/pourquoi-le-modele.mdx" "apps/web/content/docs/dev/front/routage.mdx" "apps/web/src/mdx-components.tsx" "e2e/docs-demarrer.spec.ts" "apps/web/src/features/docs/ui/FileTree.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "la seule forme d'arborescence de la doc" "apps/web/src/mdx-components.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

rm -f "apps/web/src/features/docs/ui/FileTree.tsx"

python3 - <<'PY'
import base64
spec_skip_done = False
def sub(path, old, new):
    old, new = base64.b64decode(old).decode(), base64.b64decode(new).decode()
    s = open(path, encoding="utf-8").read()
    if s.count(old) == 0 and s.count(new) == 1 and spec_skip_done: return  # déjà fait par un script précédent
    assert s.count(old) == 1, (path, old[:80], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))
sub('apps/web/content/docs/dev/donnees/pourquoi-le-modele.mdx', 'RGFucyBjZSBwcm9qZXQsIGxlIGRvc3NpZXIgYHByaXNtYS9gIHZpdCDDoCBsYSByYWNpbmUgZHUgd29ya3NwYWNlLiBDZSBjaG9peCBlc3QgbG9pbiBk4oCZw6p0cmUgYW5vZGluLiBJbCBzaWduaWZpZSBxdWUgbGUgc2Now6ltYSBkZSBkb25uw6llcyBu4oCZYXBwYXJ0aWVudCBwYXMgw6AgdW5lIHNldWxlIGFwcGxpY2F0aW9uLCBuaSDDoCB1biBzZXVsIHBhY2thZ2UgdGVjaG5pcXVlLiBJbCBhcHBhcnRpZW50IGF1IHN5c3TDqG1lIGRhbnMgc29uIGVuc2VtYmxlLgoKPENvZGVTbmlwcGV0CiAgbGFuZ3VhZ2U9InR4dCIKICB0aXRsZT0iTGEgcGxhY2UgZGUgUHJpc21hIGRhbnMgbGUgbW9ub3JlcG8iCiAgZmlsZW5hbWU9InRyZWUudHh0IgogIGtpbmQ9InBhdHRlcm4iCiAgY29kZUpzb249JyJha2ZjL1xu4pSc4pSA4pSAIGFwcHMvXG7ilIIgICDilJzilIDilIAgd2ViLyAgICAgICAgICAgICAgbOKAmWFwcGxpY2F0aW9uIE5leHQuanNcbuKUgiAgIOKUlOKUgOKUgCBtb2JpbGUvICAgICAgICAgICAocHLDqXZ1ZSwgZW5jb3JlIHZpZGUpXG7ilJzilIDilIAgcGFja2FnZXMvXG7ilIIgICDilJzilIDilIAgYmFja2VuZC8gICAgICAgICAgY29uc29tbWUgbGUgY2xpZW50IFByaXNtYVxu4pSCICAg4pSc4pSA4pSAIGNvbnRyYWN0cy9cbuKUgiAgIOKUnOKUgOKUgCBmaW5kZXItY29yZS9cbuKUgiAgIOKUlOKUgOKUgCBjb25maWcvXG7ilJzilIDilIAgcHJpc21hL1xu4pSCICAg4pSc4pSA4pSAIHNjaGVtYS5wcmlzbWEgICAgIGxlIG1vZMOobGVcbuKUgiAgIOKUnOKUgOKUgCBtaWdyYXRpb25zLyAgICAgICBzb24gaGlzdG9pcmVcbuKUgiAgIOKUlOKUgOKUgCBzZWVkLnNhbmRib3gubWpzICBkZXMgZG9ubsOpZXMgZGUgZMOpbW9uc3RyYXRpb25cbuKUlOKUgOKUgCBwcmlzbWEuY29uZmlnLnRzIicKLz4KCkNlIHBsYWNlbWVudCByYWNvbnRlIGTDqWrDoCBxdWVscXVlIGNob3NlIGTigJlpbXBvcnRhbnQuCg==',
    'RGFucyBjZSBwcm9qZXQsIGxlIGRvc3NpZXIgYHByaXNtYS9gIHZpdCDDoCBsYSByYWNpbmUgZHUgd29ya3NwYWNlLiBDZSBjaG9peCBlc3QgbG9pbiBk4oCZw6p0cmUgYW5vZGluLiBJbCBzaWduaWZpZSBxdWUgbGUgc2Now6ltYSBkZSBkb25uw6llcyBu4oCZYXBwYXJ0aWVudCBwYXMgw6AgdW5lIHNldWxlIGFwcGxpY2F0aW9uLCBuaSDDoCB1biBzZXVsIHBhY2thZ2UgdGVjaG5pcXVlLiBJbCBhcHBhcnRpZW50IGF1IHN5c3TDqG1lIGRhbnMgc29uIGVuc2VtYmxlLgoKPEFyYnJlIHJhY2luZT0iYWtmYy8iIHRleHRlPSIKYXBwcy93ZWIvICAgICAgICAgICAgICAgICAgIyBs4oCZYXBwbGljYXRpb24gTmV4dC5qcwphcHBzL21vYmlsZS8gICAgICAgICAgICAgICAjIHByw6l2dWUsIGVuY29yZSB2aWRlCnBhY2thZ2VzL2JhY2tlbmQvICAgICAgICAgICMgY29uc29tbWUgbGUgY2xpZW50IFByaXNtYQpwYWNrYWdlcy9jb250cmFjdHMvCnBhY2thZ2VzL2ZpbmRlci1jb3JlLwpwYWNrYWdlcy9jb25maWcvCnByaXNtYS9zY2hlbWEucHJpc21hICAgICAgICMgbGUgbW9kw6hsZQpwcmlzbWEvbWlncmF0aW9ucy8gICAgICAgICAjIHNvbiBoaXN0b2lyZQpwcmlzbWEvc2VlZC5zYW5kYm94Lm1qcyAgICAjIGRlcyBkb25uw6llcyBkZSBkw6ltb25zdHJhdGlvbgpwcmlzbWEuY29uZmlnLnRzCiIgLz4KCkNlIHBsYWNlbWVudCByYWNvbnRlIGTDqWrDoCBxdWVscXVlIGNob3NlIGTigJlpbXBvcnRhbnQuCg==')
sub('apps/web/content/docs/dev/front/routage.mdx', 'aW1wb3J0IHsgQ2FsbG91dCB9IGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0NhbGxvdXQudHN4IgppbXBvcnQgRG9jc1RhYmxlIGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0RvY3NUYWJsZS50c3giCmltcG9ydCB7IEZpbGVUcmVlLCBGaWxlVHJlZUl0ZW0gfSBmcm9tICIjZmVhdHVyZXMvZG9jcy91aS9GaWxlVHJlZS50c3giCgo+ICoqUHLDqWPDqWRlbW1lbnQuKiogTGUgcHJvamV0IGVzdCBpbnN0YWxsw6ksIHbDqXJpZmnDqSBwYXIgYHBucG0gY2hlY2tgIGF2YW50IGNoYXF1ZSBjb21taXQsIGV0IG5vdXMgc2F2b25zIHJlcMOpcmVyIGxlcyBlcnJldXJzIHF1aSBuZSBwcm9kdWlzZW50IGF1Y3VuIG1lc3NhZ2UuIE5vdXMgZW50cm9ucyBtYWludGVuYW50IGRhbnMgbGUgY29kZSwgcGFyIGxhIHF1ZXN0aW9uIGxhIHBsdXMgZm9uZGFtZW50YWxlIDogcXVhbmQgdW5lIGFkcmVzc2UgZXN0IGRlbWFuZMOpZSwgcXVlbCBmaWNoaWVyIHLDqXBvbmQgPwo=',
    'aW1wb3J0IHsgQ2FsbG91dCB9IGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0NhbGxvdXQudHN4IgppbXBvcnQgRG9jc1RhYmxlIGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0RvY3NUYWJsZS50c3giCgo+ICoqUHLDqWPDqWRlbW1lbnQuKiogTGUgcHJvamV0IGVzdCBpbnN0YWxsw6ksIHbDqXJpZmnDqSBwYXIgYHBucG0gY2hlY2tgIGF2YW50IGNoYXF1ZSBjb21taXQsIGV0IG5vdXMgc2F2b25zIHJlcMOpcmVyIGxlcyBlcnJldXJzIHF1aSBuZSBwcm9kdWlzZW50IGF1Y3VuIG1lc3NhZ2UuIE5vdXMgZW50cm9ucyBtYWludGVuYW50IGRhbnMgbGUgY29kZSwgcGFyIGxhIHF1ZXN0aW9uIGxhIHBsdXMgZm9uZGFtZW50YWxlIDogcXVhbmQgdW5lIGFkcmVzc2UgZXN0IGRlbWFuZMOpZSwgcXVlbCBmaWNoaWVyIHLDqXBvbmQgPwo=')
sub('apps/web/content/docs/dev/front/routage.mdx', 'TGUgcHJlbWllciBuaXZlYXUgZHUgZG9zc2llciBgYXBwL2AgOgoKPEZpbGVUcmVlPgogIDxGaWxlVHJlZUl0ZW0gbmFtZT0iYXBwL2xheW91dC50c3gg4oCUIGxlIGxheW91dCBSQUNJTkUsIGNvbW11biDDoCB0b3V0IiAvPgogIDxGaWxlVHJlZUl0ZW0gbmFtZT0iYXBwLyhwdWJsaWMpIOKAlCBsZSBzaXRlIGR1IGNsdWIiPgogICAgPEZpbGVUcmVlSXRlbSBuYW1lPSJsYXlvdXQudHN4IOKAlCBoZWFkZXIsIHJ1YmFuIGRlcyBmbGFzaHMgaW5mbywgZm9vdGVyIiAvPgogICAgPEZpbGVUcmVlSXRlbSBuYW1lPSJwYWdlLnRzeCDigJQgbOKAmWFjY3VlaWwsIC8iIC8+CiAgICA8RmlsZVRyZWVJdGVtIG5hbWU9ImRpc2NpcGxpbmVzL1tzbHVnXSwgYWdlbmRhLCBnYWxsZXJ5LCBwcm9maWwsIG1lcy1lc3BhY2Vz4oCmIiAvPgogIDwvRmlsZVRyZWVJdGVtPgogIDxGaWxlVHJlZUl0ZW0gbmFtZT0iYXBwLyhhZG1pbikg4oCUIGxhIHpvbmUgZOKAmWFkbWluaXN0cmF0aW9uIj4KICAgIDxGaWxlVHJlZUl0ZW0gbmFtZT0ibGF5b3V0LnRzeCDigJQgZ2FyZGUgU0VSVkVVUiA6IHbDqXJpZmllIGxlcyByw7RsZXMiIC8+CiAgICA8RmlsZVRyZWVJdGVtIG5hbWU9ImRhc2hib2FyZC9sYXlvdXQudHN4IOKAlCBoZWFkZXIsIGJhcnJlIGxhdMOpcmFsZSwgem9uZSBxdWkgZMOpZmlsZSIgLz4KICAgIDxGaWxlVHJlZUl0ZW0gbmFtZT0iZGFzaGJvYXJkL3Bvc3RzLCBkaXNjaXBsaW5lcywgbGlicmFyeSwgdXNlcnMsIGdyb3Vwc+KApiIgLz4KICA8L0ZpbGVUcmVlSXRlbT4KICA8RmlsZVRyZWVJdGVtIG5hbWU9ImFwcC9kb2NzIOKAlCBjZXR0ZSBkb2N1bWVudGF0aW9uIiAvPgogIDxGaWxlVHJlZUl0ZW0gbmFtZT0iYXBwL2FwaSDigJQgbGVzIHBvaW50cyBk4oCZYWNjw6hzIEhUVFAgOiB0UlBDLCBtw6lkaWFzLCBjYWxlbmRyaWVy4oCmIiAvPgo8L0ZpbGVUcmVlPgoKRGV1eCBkb3NzaWVycyBwb3J0ZW50IGRlcyBwYXJlbnRow6hzZXMgOiBgKHB1YmxpYylgIGV0IGAoYWRtaW4pYC4K',
    'TGUgcHJlbWllciBuaXZlYXUgZHUgZG9zc2llciBgYXBwL2AgOgoKPEFyYnJlIHJhY2luZT0iYXBwcy93ZWIvc3JjLyIgdGV4dGU9IgphcHAvbGF5b3V0LnRzeCAgICAgICAgICAgICAgICAgICAgICAgICAgIyBsZSBsYXlvdXQgUkFDSU5FLCBjb21tdW4gw6AgdG91dAphcHAvKHB1YmxpYykvICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBsZSBzaXRlIGR1IGNsdWIKYXBwLyhwdWJsaWMpL2xheW91dC50c3ggICAgICAgICAgICAgICAgICMgaGVhZGVyLCBydWJhbiBkZXMgZmxhc2hzIGluZm8sIGZvb3RlcgphcHAvKHB1YmxpYykvcGFnZS50c3ggICAgICAgICAgICAgICAgICAgIyBs4oCZYWNjdWVpbCwgLwphcHAvKHB1YmxpYykvZGlzY2lwbGluZXMvICAgICAgICAgICAgICAgIyAvZGlzY2lwbGluZXMvW3NsdWddIDogdW5lIGZpY2hlIGRlIGRpc2NpcGxpbmUKYXBwLyhwdWJsaWMpL2FnZW5kYS8gICAgICAgICAgICAgICAgICAgICMgZXQgZGUgbcOqbWUgOiBnYWxsZXJ5LCBwcm9maWwsIG1lcy1lc3BhY2Vz4oCmCmFwcC8oYWRtaW4pLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGxhIHpvbmUgZOKAmWFkbWluaXN0cmF0aW9uCmFwcC8oYWRtaW4pL2xheW91dC50c3ggICAgICAgICAgICAgICAgICAjIGdhcmRlIFNFUlZFVVIgOiB2w6lyaWZpZSBsZXMgcsO0bGVzCmFwcC8oYWRtaW4pL2Rhc2hib2FyZC9sYXlvdXQudHN4ICAgICAgICAjIGhlYWRlciwgYmFycmUgbGF0w6lyYWxlLCB6b25lIHF1aSBkw6lmaWxlCmFwcC8oYWRtaW4pL2Rhc2hib2FyZC9wb3N0cy8gICAgICAgICAgICAjIGV0IGRlIG3Dqm1lIDogZGlzY2lwbGluZXMsIGxpYnJhcnksIHVzZXJzLCBncm91cHPigKYKYXBwL2RvY3MvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgY2V0dGUgZG9jdW1lbnRhdGlvbgphcHAvYXBpLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBsZXMgcG9pbnRzIGTigJlhY2PDqHMgSFRUUCA6IHRSUEMsIG3DqWRpYXMsIGNhbGVuZHJpZXLigKYKIiAvPgoKRGV1eCBkb3NzaWVycyBwb3J0ZW50IGRlcyBwYXJlbnRow6hzZXMgOiBgKHB1YmxpYylgIGV0IGAoYWRtaW4pYC4K')
sub('apps/web/src/mdx-components.tsx', 'aW1wb3J0IENvZGVTbmlwcGV0IGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0NvZGVTbmlwcGV0LnRzeCIKaW1wb3J0IENvZGVTbmlwcGV0V2Fsa3Rocm91Z2ggZnJvbSAiI2ZlYXR1cmVzL2RvY3MvdWkvQ29kZVNuaXBwZXRXYWxrdGhyb3VnaC50c3giCmltcG9ydCB7IEZpbGVUcmVlLCBGaWxlVHJlZUl0ZW0gfSBmcm9tICIjZmVhdHVyZXMvZG9jcy91aS9GaWxlVHJlZS50c3giCmltcG9ydCB7IEFyYnJlIH0gZnJvbSAiI2ZlYXR1cmVzL2RvY3MvdWkvQXJicmUudHN4IgppbXBvcnQgeyBJbmZyYSB9IGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0luZnJhLnRzeCIK',
    'aW1wb3J0IENvZGVTbmlwcGV0IGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0NvZGVTbmlwcGV0LnRzeCIKaW1wb3J0IENvZGVTbmlwcGV0V2Fsa3Rocm91Z2ggZnJvbSAiI2ZlYXR1cmVzL2RvY3MvdWkvQ29kZVNuaXBwZXRXYWxrdGhyb3VnaC50c3giCmltcG9ydCB7IEFyYnJlIH0gZnJvbSAiI2ZlYXR1cmVzL2RvY3MvdWkvQXJicmUudHN4IgppbXBvcnQgeyBJbmZyYSB9IGZyb20gIiNmZWF0dXJlcy9kb2NzL3VpL0luZnJhLnRzeCIK')
sub('apps/web/src/mdx-components.tsx', 'ICBDb2RlU25pcHBldCwKICBDb2RlU25pcHBldFdhbGt0aHJvdWdoLAogIEZpbGVUcmVlLAogIEZpbGVUcmVlSXRlbSwKICAvLyBBcmJvcmVzY2VuY2UgZmHDp29uIElERSwgw6AgcGFydGlyIGQndW4gdGV4dGUgaW5kZW50w6kuCiAgQXJicmUsCiAgLy8gTGEgY29tbWFuZGUgcXVpIGFqb3V0ZSB1bmUgZMOpcGVuZGFuY2UsIGF1IGNoYXBpdHJlIGRlIHNhIHByZW1pw6hyZSB1dGlsaXNhdGlvbi4K',
    'ICBDb2RlU25pcHBldCwKICBDb2RlU25pcHBldFdhbGt0aHJvdWdoLAogIC8vIEFyYm9yZXNjZW5jZSBmYcOnb24gSURFLCDDoCBwYXJ0aXIgZGUgY2hlbWlucyBjb21wbGV0cyAobGEgc2V1bGUgZm9ybWUgZCdhcmJvcmVzY2VuY2UgZGUgbGEgZG9jKS4KICBBcmJyZSwKICAvLyBMYSBjb21tYW5kZSBxdWkgYWpvdXRlIHVuZSBkw6lwZW5kYW5jZSwgYXUgY2hhcGl0cmUgZGUgc2EgcHJlbWnDqHJlIHV0aWxpc2F0aW9uLgo=')
sub('e2e/docs-demarrer.spec.ts', 'ICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoImxpbmsiLCB7IG5hbWU6IC9M4oCZaW1hZ2UgRG9ja2VyIMK3IENlIHF1ZSBuZXh0XC5jb25maWdcLnRzIHByw6lwYXJlIHBvdXIgbOKAmWltYWdlLyB9KSkudG9CZVZpc2libGUoKTsKfSk7Cg==',
    'ICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoImxpbmsiLCB7IG5hbWU6IC9M4oCZaW1hZ2UgRG9ja2VyIMK3IENlIHF1ZSBuZXh0XC5jb25maWdcLnRzIHByw6lwYXJlIHBvdXIgbOKAmWltYWdlLyB9KSkudG9CZVZpc2libGUoKTsKfSk7Cgp0ZXN0KCJwbHVzIGF1Y3VuZSBhcmJvcmVzY2VuY2UgZW4gdGV4dGUgOiBsZSByb3V0YWdlIGV0IGxlIG1vZMOobGUgcGFzc2VudCBwYXIgPEFyYnJlPiIsIGFzeW5jICh7IHBhZ2UgfSkgPT4gewogIGF3YWl0IHBhZ2UuZ290bygiL2RvY3MvZGV2L2Zyb250L3JvdXRhZ2UiKTsKICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVJvbGUoInRyZWUiLCB7IG5hbWU6ICJBcmJvcmVzY2VuY2UgZGUgYXBwcy93ZWIvc3JjLyIgfSkpLnRvQ29udGFpblRleHQoImRhc2hib2FyZCIpOwogIGF3YWl0IHBhZ2UuZ290bygiL2RvY3MvZGV2L2Rvbm5lZXMvcG91cnF1b2ktbGUtbW9kZWxlIik7CiAgYXdhaXQgZXhwZWN0KHBhZ2UuZ2V0QnlSb2xlKCJ0cmVlIiwgeyBuYW1lOiAiQXJib3Jlc2NlbmNlIGRlIGFrZmMvIiB9KSkudG9Db250YWluVGV4dCgic2NoZW1hLnByaXNtYSIpOwp9KTsK')
print("  édits ok (6 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore; exit 1; }
echo "== pnpm check =="
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "  (pnpm dev tourne : vérification sans effacer .next)"
  CHECK="node scripts/check-next-conventions.mjs && node scripts/check-tour-targets.mjs && node scripts/check-doc-entities.mjs && node scripts/check-doc-snippets.mjs && node scripts/check-doc-components.mjs && node scripts/check-doc-installs.mjs && pnpm typecheck && pnpm lint"
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
Admin : fiches « Valider les médias », « Les documents des membres », « La corbeille », « Le registre RGPD »

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : pnpm install (retire les paquets de node_modules), puis git push."