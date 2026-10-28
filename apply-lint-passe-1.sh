#!/usr/bin/env bash
# Lint, première passe : 20 problèmes mécaniques réglés (apostrophes, variables / imports / états
# inutilisés, prefer-const). Restent les règles du React Compiler (passe suivante).
# Usage (racine du repo) : bash apply-lint-passe-1.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/app/(admin)/dashboard/pages/page.tsx" 2>/dev/null | grep -qF "Une page en brouillon n’est"; then echo "Déjà appliqué (commité)."; exit 0; fi
MODIFIED=("apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx" "apps/web/src/app/(admin)/dashboard/disciplines/create/page.tsx" "apps/web/src/app/(admin)/dashboard/pages/page.tsx" "apps/web/src/app/(admin)/dashboard/site-pages/home/page.tsx" "apps/web/src/app/(admin)/dashboard/users/[id]/edit/page.tsx" "apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx" "apps/web/src/features/admin/events/forms/EventForm.tsx" "apps/web/src/features/admin/library/forms/DragNDropForm.tsx" "apps/web/src/features/finder-core/components/Finder.tsx" "apps/web/src/features/finder-core/components/FinderTreeFile.tsx" "apps/web/src/features/finder-core/components/FinderTreeFolder.tsx" "apps/web/src/features/gallery-crop/components/Cropper.tsx" "apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "Une page en brouillon n’est" "apps/web/src/app/(admin)/dashboard/pages/page.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx', 'ICAgICAgICAgIGluaXRpYWw9e2Rpc2NpcGxpbmV9CiAgICAgICAgICBvblN1Ym1pdD17aGFuZGxlU3VibWl0fQogICAgICAgICAgc3VibWl0TGFiZWw9IkVucmVnaXN0cmVyIgogICAgICAgIC8+CiAgICAgICl9Cg==',
    'ICAgICAgICAgIGluaXRpYWw9e2Rpc2NpcGxpbmV9CiAgICAgICAgICBvblN1Ym1pdD17aGFuZGxlU3VibWl0fQogICAgICAgIC8+CiAgICAgICl9Cg==')
sub('apps/web/src/app/(admin)/dashboard/disciplines/create/page.tsx', 'ICAgICAgICAvPgogICAgICApIDogKAogICAgICAgIDxEaXNjaXBsaW5lRm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0fSBzdWJtaXRMYWJlbD0iQ3LDqWVyIiAvPgogICAgICApfQogICAgPC9kaXY+Cg==',
    'ICAgICAgICAvPgogICAgICApIDogKAogICAgICAgIDxEaXNjaXBsaW5lRm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0fSAvPgogICAgICApfQogICAgPC9kaXY+Cg==')
sub('apps/web/src/app/(admin)/dashboard/pages/page.tsx', 'ICAgICAgPHAgY2xhc3NOYW1lPSJtYi02IHRleHQtc20gdGV4dC1ncmF5LTYwMCI+CiAgICAgICAgUGFnZXMgYXUgY29udGVudSBwcm9wcmUsIG5vbiBhbGltZW50w6llcyBwYXIgdW4gYXV0cmUgw6lkaXRldXIuIENvbXBvc2V6LWxlcwogICAgICAgIGRhbnMgbGV1ciBjb25zdHJ1Y3RldXIsIHB1aXMgcHVibGllei1sZXMuIFVuZSBwYWdlIGVuIGJyb3VpbGxvbiBuJ2VzdAogICAgICAgIHZpc2libGUgcXVlIGRlcyBhZG1pbmlzdHJhdGV1cnMuCiAgICAgIDwvcD4K',
    'ICAgICAgPHAgY2xhc3NOYW1lPSJtYi02IHRleHQtc20gdGV4dC1ncmF5LTYwMCI+CiAgICAgICAgUGFnZXMgYXUgY29udGVudSBwcm9wcmUsIG5vbiBhbGltZW50w6llcyBwYXIgdW4gYXV0cmUgw6lkaXRldXIuIENvbXBvc2V6LWxlcwogICAgICAgIGRhbnMgbGV1ciBjb25zdHJ1Y3RldXIsIHB1aXMgcHVibGllei1sZXMuIFVuZSBwYWdlIGVuIGJyb3VpbGxvbiBu4oCZZXN0CiAgICAgICAgdmlzaWJsZSBxdWUgZGVzIGFkbWluaXN0cmF0ZXVycy4KICAgICAgPC9wPgo=')
sub('apps/web/src/app/(admin)/dashboard/site-pages/home/page.tsx', 'ICAgICAgPC9kaXY+CiAgICAgIDxwIGNsYXNzTmFtZT0ibWItNiB0ZXh0LXNtIHRleHQtZ3JheS02MDAiPgogICAgICAgIFRpdHJlIGV0IHRleHRlIGQnaW50cm9kdWN0aW9uIGRlIGxhIHBhZ2UgZCdhY2N1ZWlsLiBMZSByZXN0ZSBkZSBsYSBwYWdlCiAgICAgICAgbidlc3QgcGFzIGFmZmVjdMOpLnsiICJ9CiAgICAgICAgPExpbmsgaHJlZj0iLyIgY2xhc3NOYW1lPSJ0ZXh0LWJsdWUtNjAwIGhvdmVyOnVuZGVybGluZSI+CiAgICAgICAgICBWb2lyIGxhIHBhZ2UK',
    'ICAgICAgPC9kaXY+CiAgICAgIDxwIGNsYXNzTmFtZT0ibWItNiB0ZXh0LXNtIHRleHQtZ3JheS02MDAiPgogICAgICAgIFRpdHJlIGV0IHRleHRlIGTigJlpbnRyb2R1Y3Rpb24gZGUgbGEgcGFnZSBk4oCZYWNjdWVpbC4gTGUgcmVzdGUgZGUgbGEgcGFnZQogICAgICAgIG7igJllc3QgcGFzIGFmZmVjdMOpLnsiICJ9CiAgICAgICAgPExpbmsgaHJlZj0iLyIgY2xhc3NOYW1lPSJ0ZXh0LWJsdWUtNjAwIGhvdmVyOnVuZGVybGluZSI+CiAgICAgICAgICBWb2lyIGxhIHBhZ2UK')
sub('apps/web/src/app/(admin)/dashboard/users/[id]/edit/page.tsx', 'ICAgICAgICAgICAgZ3JvdXBlcyBkZSBtZW1icmVzCiAgICAgICAgICA8L0xpbms+eyIgIn0KICAgICAgICAgIChsZSBncm91cGUgQWRtaW5pc3RyYXRldXJzIGNvbmbDqHJlIGwnYWNjw6hzIGFkbWluKS4KICAgICAgICA8L3A+CiAgICAgICAge2lzU2VsZiAmJiA8cCBjbGFzc05hbWU9InRleHQteHMiPlR1IG5lIHBldXggcGFzIHRlIHN1cHByaW1lci48L3A+fQo=',
    'ICAgICAgICAgICAgZ3JvdXBlcyBkZSBtZW1icmVzCiAgICAgICAgICA8L0xpbms+eyIgIn0KICAgICAgICAgIChsZSBncm91cGUgQWRtaW5pc3RyYXRldXJzIGNvbmbDqHJlIGzigJlhY2PDqHMgYWRtaW4pLgogICAgICAgIDwvcD4KICAgICAgICB7aXNTZWxmICYmIDxwIGNsYXNzTmFtZT0idGV4dC14cyI+VHUgbmUgcGV1eCBwYXMgdGUgc3VwcHJpbWVyLjwvcD59Cg==')
sub('apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx', 'ICAvKiogQXBwZWzDqWUgw6AgbGEgc291bWlzc2lvbi4gKi8KICBvblN1Ym1pdDogKGlucHV0OiBEaXNjaXBsaW5lRm9ybUlucHV0KSA9PiBQcm9taXNlPHZvaWQ+OwogIC8qKiBMaWJlbGzDqSBkdSBib3V0b24gZGUgc291bWlzc2lvbi4gRGVmYXVsdCAiRW5yZWdpc3RyZXIiLiAqLwogIHN1Ym1pdExhYmVsPzogc3RyaW5nOwp9Cgo=',
    'ICAvKiogQXBwZWzDqWUgw6AgbGEgc291bWlzc2lvbi4gKi8KICBvblN1Ym1pdDogKGlucHV0OiBEaXNjaXBsaW5lRm9ybUlucHV0KSA9PiBQcm9taXNlPHZvaWQ+Owp9Cgo=')
sub('apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx', 'ICBpbml0aWFsLAogIG9uU3VibWl0LAogIHN1Ym1pdExhYmVsID0gIkVucmVnaXN0cmVyIiwKfTogRGlzY2lwbGluZUZvcm1Qcm9wcykgewogIGNvbnN0IFtuYW1lLCBzZXROYW1lXSA9IHVzZVN0YXRlPHN0cmluZz4oaW5pdGlhbD8ubmFtZSA/PyAiIik7Cg==',
    'ICBpbml0aWFsLAogIG9uU3VibWl0LAp9OiBEaXNjaXBsaW5lRm9ybVByb3BzKSB7CiAgY29uc3QgW25hbWUsIHNldE5hbWVdID0gdXNlU3RhdGU8c3RyaW5nPihpbml0aWFsPy5uYW1lID8/ICIiKTsK')
sub('apps/web/src/features/admin/events/forms/EventForm.tsx', 'ICAgICAgICAgICl9CiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9InRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj4KICAgICAgICAgICAgUG91ciBsZXMgZG9tYWluZXMgcXVlIGxlIGNsdWIgbidlbnNlaWduZSBwYXMuCiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgPC9kaXY+Cg==',
    'ICAgICAgICAgICl9CiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9InRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIj4KICAgICAgICAgICAgUG91ciBsZXMgZG9tYWluZXMgcXVlIGxlIGNsdWIgbuKAmWVuc2VpZ25lIHBhcy4KICAgICAgICAgIDwvc3Bhbj4KICAgICAgICA8L2Rpdj4K')
sub('apps/web/src/features/admin/library/forms/DragNDropForm.tsx', 'aW1wb3J0IHsgdXNlU2Vzc2lvblN0b3JlIH0gZnJvbSAnQGxpYi9zdG9yZXMvdXNlU2Vzc2lvblN0b3JlJzsKaW1wb3J0IHsgdXNlRmluZGVyU3RvcmUgfSBmcm9tICdAZmVhdHVyZXMvZmluZGVyLWNvcmUvc3RhdGUvdXNlRmluZGVyU3RvcmUnOwppbXBvcnQgeyBBUFBfUk9PVCB9IGZyb20gJ0Bjb25maWcvYXBwJzsKaW1wb3J0IHsgSEVJQ19BQ0NFUFQsIGNvdW50SGVpYywgaGVpY0ZhaWx1cmVNZXNzYWdlLCBoZWljUHJvZ3Jlc3NNZXNzYWdlLCB0b0Jyb3dzZXJJbWFnZXMgfSBmcm9tICdAZmVhdHVyZXMvbWVkaWEvaGVpYy9icm93c2VySW1hZ2VzJzsKCg==',
    'aW1wb3J0IHsgdXNlU2Vzc2lvblN0b3JlIH0gZnJvbSAnQGxpYi9zdG9yZXMvdXNlU2Vzc2lvblN0b3JlJzsKaW1wb3J0IHsgdXNlRmluZGVyU3RvcmUgfSBmcm9tICdAZmVhdHVyZXMvZmluZGVyLWNvcmUvc3RhdGUvdXNlRmluZGVyU3RvcmUnOwppbXBvcnQgeyBIRUlDX0FDQ0VQVCwgY291bnRIZWljLCBoZWljRmFpbHVyZU1lc3NhZ2UsIGhlaWNQcm9ncmVzc01lc3NhZ2UsIHRvQnJvd3NlckltYWdlcyB9IGZyb20gJ0BmZWF0dXJlcy9tZWRpYS9oZWljL2Jyb3dzZXJJbWFnZXMnOwoK')
sub('apps/web/src/features/admin/library/forms/DragNDropForm.tsx', 'ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRHJhZ05Ecm9wRm9ybSgpOiBKU1guRWxlbWVudCB7CiAgY29uc3QgdXNlciA9IHVzZVNlc3Npb25TdG9yZSgocykgPT4gcy5zZXNzaW9uPy51c2VyKTsKICBjb25zdCB7IGRhdGE6IGNhdGVnb3JpZXMgPSBbXSB9ID0gdHJwYy5jYXRlZ29yeS5nZXRBbGwudXNlUXVlcnkoKTsKCiAgY29uc3QgcmVsb2FkRm9sZGVyQ29udGVudCA9IHVzZUZpbmRlclN0b3JlKChzKSA9PiBzLnJlbG9hZEZvbGRlckNvbnRlbnQpOwo=',
    'ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRHJhZ05Ecm9wRm9ybSgpOiBKU1guRWxlbWVudCB7CiAgY29uc3QgdXNlciA9IHVzZVNlc3Npb25TdG9yZSgocykgPT4gcy5zZXNzaW9uPy51c2VyKTsKCiAgY29uc3QgcmVsb2FkRm9sZGVyQ29udGVudCA9IHVzZUZpbmRlclN0b3JlKChzKSA9PiBzLnJlbG9hZEZvbGRlckNvbnRlbnQpOwo=')
sub('apps/web/src/features/admin/library/forms/DragNDropForm.tsx', 'ICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvaW5jb21wYXRpYmxlLWxpYnJhcnkKICBjb25zdCBkZXN0aW5hdGlvbktpbmQgPSB3YXRjaCgnZGVzdGluYXRpb25LaW5kJyk7CiAgY29uc3QgY2F0ZWdvcnlJZCA9IHdhdGNoKCdjYXRlZ29yeUlkJyk7CgoK',
    'ICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvaW5jb21wYXRpYmxlLWxpYnJhcnkKICBjb25zdCBkZXN0aW5hdGlvbktpbmQgPSB3YXRjaCgnZGVzdGluYXRpb25LaW5kJyk7CgoK')
sub('apps/web/src/features/admin/library/forms/DragNDropForm.tsx', 'ICAgICAgICAgICAgICBjbGFzc05hbWU9ImFjY2VudC1lbWVyYWxkLTYwMCIKICAgICAgICAgICAgLz4KICAgICAgICAgICAgUmVuZHJlIGxlcyBQREYgZGlzcG9uaWJsZXMgYXV4IG1lbWJyZXMgYXByw6hzIGwnZW52b2kKICAgICAgICAgIDwvbGFiZWw+CiAgICAgICAgICB7cHVibGlzaFRvTWVtYmVycyAmJiAoCg==',
    'ICAgICAgICAgICAgICBjbGFzc05hbWU9ImFjY2VudC1lbWVyYWxkLTYwMCIKICAgICAgICAgICAgLz4KICAgICAgICAgICAgUmVuZHJlIGxlcyBQREYgZGlzcG9uaWJsZXMgYXV4IG1lbWJyZXMgYXByw6hzIGzigJllbnZvaQogICAgICAgICAgPC9sYWJlbD4KICAgICAgICAgIHtwdWJsaXNoVG9NZW1iZXJzICYmICgK')
sub('apps/web/src/features/finder-core/components/Finder.tsx', 'ICBzZXJpYWxpemVQYXlsb2FkLAogIHNldERyYWdnaW5nUGF0aHMsCiAgY2xlYXJEcmFnZ2luZ1BhdGhzLAogIGRyYWdJdGVtRnJvbU5vZGUsCiAgdHlwZSBEcmFnSXRlbSwK',
    'ICBzZXJpYWxpemVQYXlsb2FkLAogIHNldERyYWdnaW5nUGF0aHMsCiAgZHJhZ0l0ZW1Gcm9tTm9kZSwKICB0eXBlIERyYWdJdGVtLAo=')
sub('apps/web/src/features/finder-core/components/FinderTreeFile.tsx', 'ICB9IGVsc2UgaWYgKHZpZGVvVGh1bWIgJiYgIWltZ0ZhaWxlZCkgewogICAgaW5uZXIgPSAoCiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAbmV4dC9uZXh0L25vLWltZy1lbGVtZW50CiAgICAgIDxzcGFuIGNsYXNzTmFtZT0icmVsYXRpdmUgaW5saW5lLWZsZXggaC01IHctNSBzaHJpbmstMCI+CiAgICAgICAgey8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAbmV4dC9uZXh0L25vLWltZy1lbGVtZW50ICovfQo=',
    'ICB9IGVsc2UgaWYgKHZpZGVvVGh1bWIgJiYgIWltZ0ZhaWxlZCkgewogICAgaW5uZXIgPSAoCiAgICAgIDxzcGFuIGNsYXNzTmFtZT0icmVsYXRpdmUgaW5saW5lLWZsZXggaC01IHctNSBzaHJpbmstMCI+CiAgICAgICAgey8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAbmV4dC9uZXh0L25vLWltZy1lbGVtZW50ICovfQo=')
sub('apps/web/src/features/finder-core/components/FinderTreeFolder.tsx', 'ICAgIG51bGwsCiAgKTsKICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpOwogIGNvbnN0IFtsb2FkRXJyb3IsIHNldExvYWRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTsKCiAgY29uc3QgcmVsb2FkS2V5ID0gdXNlRmluZGVyU3RvcmUoKHMpID0+IHMucmVsb2FkS2V5KTsK',
    'ICAgIG51bGwsCiAgKTsKCiAgY29uc3QgcmVsb2FkS2V5ID0gdXNlRmluZGVyU3RvcmUoKHMpID0+IHMucmVsb2FkS2V5KTsK')
sub('apps/web/src/features/finder-core/components/FinderTreeFolder.tsx', 'ICAgICAgICAgICAgYXJpYS1sYWJlbD17aXNPcGVuID8gIlJlcGxpZXIiIDogIkTDqXBsaWVyIn0KICAgICAgICAgID4KICAgICAgICAgICAge2lzTG9hZGluZyB8fCBpc01hdGVyaWFsaXppbmcgPyAoCiAgICAgICAgICAgICAgPExvYWRlcjIgY2xhc3NOYW1lPSJoLTMuNSB3LTMuNSBhbmltYXRlLXNwaW4iIC8+CiAgICAgICAgICAgICkgOiBpc09wZW4gPyAoCg==',
    'ICAgICAgICAgICAgYXJpYS1sYWJlbD17aXNPcGVuID8gIlJlcGxpZXIiIDogIkTDqXBsaWVyIn0KICAgICAgICAgID4KICAgICAgICAgICAge2lzTWF0ZXJpYWxpemluZyA/ICgKICAgICAgICAgICAgICA8TG9hZGVyMiBjbGFzc05hbWU9ImgtMy41IHctMy41IGFuaW1hdGUtc3BpbiIgLz4KICAgICAgICAgICAgKSA6IGlzT3BlbiA/ICgK')
sub('apps/web/src/features/finder-core/components/FinderTreeFolder.tsx', 'ICAgICAgPC9kaXY+CgogICAgICB7bG9hZEVycm9yICYmIGlzT3BlbiAmJiAoCiAgICAgICAgPGRpdiBjbGFzc05hbWU9Im1sLTMgcGwtMyBib3JkZXItbCBib3JkZXItYm9yZGVyIj4KICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSJweC0yIHB5LTEgdGV4dC14cyB0ZXh0LWRlc3RydWN0aXZlIj57bG9hZEVycm9yfTwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICApfQoKICAgICAge2lzT3BlbiAmJiBpc01hdGVyaWFsaXppbmcgJiYgKAo=',
    'ICAgICAgPC9kaXY+CgoKICAgICAge2lzT3BlbiAmJiBpc01hdGVyaWFsaXppbmcgJiYgKAo=')
sub('apps/web/src/features/gallery-crop/components/Cropper.tsx', 'ICBDcm9wcGVyUHJvcHMsCiAgQ3JvcEdyaWQsCiAgU2hhcGUsCn0gZnJvbSAiQC9mZWF0dXJlcy9nYWxsZXJ5LWNyb3AvdHlwZXMvY3JvcHBlci50eXBlcyI7CmltcG9ydCBDcm9wR3JpZE92ZXJsYXkgZnJvbSAiQC9mZWF0dXJlcy9nYWxsZXJ5LWNyb3AvY29tcG9uZW50cy9jcm9wR3JpZE92ZXJsYXkiOwo=',
    'ICBDcm9wcGVyUHJvcHMsCiAgQ3JvcEdyaWQsCn0gZnJvbSAiQC9mZWF0dXJlcy9nYWxsZXJ5LWNyb3AvdHlwZXMvY3JvcHBlci50eXBlcyI7CmltcG9ydCBDcm9wR3JpZE92ZXJsYXkgZnJvbSAiQC9mZWF0dXJlcy9nYWxsZXJ5LWNyb3AvY29tcG9uZW50cy9jcm9wR3JpZE92ZXJsYXkiOwo=')
sub('apps/web/src/features/gallery-crop/components/Cropper.tsx', 'ICB9LCBbY3RybC52YWx1ZSwgZGVjaW1hbHNdKTsKICBjb25zdCBjb21taXRUZXh0ID0gKHJhdzogc3RyaW5nKSA9PiB7CiAgICBsZXQgbiA9IE51bWJlcihyYXcpOwogICAgaWYgKE51bWJlci5pc05hTihuKSkgewogICAgICBzZXRUZXh0KGRlY2ltYWxzID8gY3RybC52YWx1ZS50b0ZpeGVkKGRlY2ltYWxzKSA6IFN0cmluZyhjdHJsLnZhbHVlKSk7Cg==',
    'ICB9LCBbY3RybC52YWx1ZSwgZGVjaW1hbHNdKTsKICBjb25zdCBjb21taXRUZXh0ID0gKHJhdzogc3RyaW5nKSA9PiB7CiAgICBjb25zdCBuID0gTnVtYmVyKHJhdyk7CiAgICBpZiAoTnVtYmVyLmlzTmFOKG4pKSB7CiAgICAgIHNldFRleHQoZGVjaW1hbHMgPyBjdHJsLnZhbHVlLnRvRml4ZWQoZGVjaW1hbHMpIDogU3RyaW5nKGN0cmwudmFsdWUpKTsK')
sub('apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx', 'ICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktMyI+CiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+CiAgICAgICAgICBNw6lkaWEgKHVuZSBpbWFnZS92aWTDqW8gZGUgbGEgYmlibGlvdGjDqHF1ZSwgb3UgdW4gYXZhdGFyIGQnYWRtaW4pCiAgICAgICAgPC9zcGFuPgoK',
    'ICAgICAgPGRpdiBjbGFzc05hbWU9InNwYWNlLXktMyI+CiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCI+CiAgICAgICAgICBNw6lkaWEgKHVuZSBpbWFnZS92aWTDqW8gZGUgbGEgYmlibGlvdGjDqHF1ZSwgb3UgdW4gYXZhdGFyIGTigJlhZG1pbikKICAgICAgICA8L3NwYW4+Cgo=')
sub('apps/web/src/features/page-builder/blocks/media-text/editor.client.tsx', 'ICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ic3BhY2UteS0xIj4KICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSB0ZXh0LW11dGVkLWZvcmVncm91bmQiPgogICAgICAgICAgICDigKZvdSBsJ2F2YXRhciBkJ3VuIGFkbWluaXN0cmF0ZXVyCiAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICA8QXZhdGFyUGlja2VyCg==',
    'ICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ic3BhY2UteS0xIj4KICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZSB0ZXh0LW11dGVkLWZvcmVncm91bmQiPgogICAgICAgICAgICDigKZvdSBs4oCZYXZhdGFyIGTigJl1biBhZG1pbmlzdHJhdGV1cgogICAgICAgICAgPC9zcGFuPgogICAgICAgICAgPEF2YXRhclBpY2tlcgo=')
print("  édits ok (21 substitutions, 0 fichiers créés, 0 remplacés)")
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
chore(lint): 20 problèmes mécaniques réglés (apostrophes, inutilisés, prefer-const)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014LCtjvXtxeMakFEsVHTLca
MSG