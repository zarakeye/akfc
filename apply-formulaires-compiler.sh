#!/usr/bin/env bash
# Formulaires : le profil retrouve son bouton « Enregistrer ».
# - le React Compiler figeait l'état de react-hook-form : isDirty restait faux, le bouton grisé.
#   Les 4 composants qui utilisent useForm commencent par "use no memo" (hors du Compiler) ;
# - le bouton prend les couleurs du thème (invisible en mode sombre) et passe sous les champs ;
# - test e2e profil-edition.spec.ts ; doc next.config (encadré). Pas de migration.
# Prérequis : apply-securite-s3-typo.sh.
# Usage (racine du repo) : bash apply-formulaires-compiler.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx" 2>/dev/null | grep -qF "use no memo"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "postcss-selector-parser" "package.json" 2>/dev/null || { echo "lancez d'abord apply-securite-s3-typo.sh"; exit 1; }
MODIFIED=("apps/web/content/docs/dev/configuration/next-config.mdx" "apps/web/src/features/admin/galleries/forms/UpdateGalleryForm.tsx" "apps/web/src/features/admin/library/forms/DragNDropForm.tsx" "apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx" "apps/web/src/features/auth/ChangePasswordForm.tsx" "e2e/data.mjs")
CREATED=("e2e/profil-edition.spec.ts")
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "use no memo" "apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
if ! git diff --quiet HEAD -- "${MODIFIED[@]}" 2>/dev/null; then echo "❌ modifications non commitées dans des fichiers que ce script modifie (rien n'a été touché) :"; git diff --name-only HEAD -- "${MODIFIED[@]}" | head -5; exit 1; fi
trap 'restore' ERR

mkdir -p "e2e"
base64 -d > "e2e/profil-edition.spec.ts" <<'B64'
aW1wb3J0IHsgZXhwZWN0LCB0ZXN0IH0gZnJvbSAiQHBsYXl3cmlnaHQvdGVzdCI7CgppbXBvcnQg
eyBsb2dpbkFzIH0gZnJvbSAiLi9oZWxwZXJzIjsKaW1wb3J0IHsgVVNFUlMgfSBmcm9tICIuL2Rh
dGEubWpzIjsKCi8vIExlIGZvcm11bGFpcmUgZHUgcHJvZmlsIHMnYWN0aXZlIGTDqHMgcXUndW4g
Y2hhbXAgY2hhbmdlLiBBdmVjIGxlIFJlYWN0IENvbXBpbGVyLCBpbCByZXN0YWl0Ci8vIGdyaXPD
qSA6IHJlYWN0LWhvb2stZm9ybSBldCBsYSBtw6ltb3Jpc2F0aW9uIGR1IHJlbmR1IG5lIHMnZW50
ZW5kYWllbnQgcGFzLgoKdGVzdCgibW9kaWZpZXIgdW4gY2hhbXAgZHUgcHJvZmlsIGFjdGl2ZSDC
qyBFbnJlZ2lzdHJlciDCuywgZXQgbCdlbnJlZ2lzdHJlbWVudCBhYm91dGl0IiwgYXN5bmMgKHsg
cGFnZSB9KSA9PiB7CiAgYXdhaXQgbG9naW5BcyhwYWdlLCBVU0VSUy5wcm9maWwuZW1haWwpOwog
IGF3YWl0IHBhZ2UuZ290bygiL3Byb2ZpbC9lZGl0Iik7CiAgY29uc3QgZW5yZWdpc3RyZXIgPSBw
YWdlLmdldEJ5Um9sZSgiYnV0dG9uIiwgeyBuYW1lOiAiRW5yZWdpc3RyZXIiIH0pOwogIGF3YWl0
IGV4cGVjdChwYWdlLmdldEJ5TGFiZWwoIlByw6lub20iKSkudG9IYXZlVmFsdWUoVVNFUlMucHJv
ZmlsLmZpcnN0TmFtZSk7CiAgYXdhaXQgZXhwZWN0KGVucmVnaXN0cmVyKS50b0JlRGlzYWJsZWQo
KTsKCiAgYXdhaXQgcGFnZS5nZXRCeUxhYmVsKCJOb20iLCB7IGV4YWN0OiB0cnVlIH0pLmZpbGwo
IlByb2ZpbCIpOwogIGF3YWl0IHBhZ2UuZ2V0QnlMYWJlbCgiUHNldWRvIikuZmlsbCgiTWFlbC1l
MmUiKTsKICBhd2FpdCBleHBlY3QoZW5yZWdpc3RyZXIpLnRvQmVFbmFibGVkKCk7CiAgYXdhaXQg
ZW5yZWdpc3RyZXIuY2xpY2soKTsKICBhd2FpdCBleHBlY3QocGFnZSkudG9IYXZlVVJMKC9cL3By
b2ZpbCQvKTsKICBhd2FpdCBleHBlY3QocGFnZS5nZXRCeVRleHQoIk1hZWwtZTJlIikpLnRvQmVW
aXNpYmxlKCk7Cn0pOwo=
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
sub('apps/web/content/docs/dev/configuration/next-config.mdx', 'CkF1IG1vbWVudCBkZSBsJ2FjdGl2YXRpb24sIHN1ciBsYSBtw6ptZSBtYWNoaW5lLCBsYSBjb21waWxhdGlvbiBkZSBgbmV4dCBidWlsZGAgZXN0IHBhc3PDqWUgZGUgNjEgw6AgODMgc2Vjb25kZXMsIGV0IDMzIGRlcyBmaWNoaWVycyBKYXZhU2NyaXB0IGVudm95w6lzIGF1IG5hdmlnYXRldXIgY29udGVuYWllbnQgbGUgY29kZSBkZSBtw6ltb3Jpc2F0aW9uIGFqb3V0w6kgcGFyIGxlIENvbXBpbGVyLiBVbmUgdmluZ3RhaW5lIGRlIHNlY29uZGVzIGRlIGJ1aWxkIGVuIHBsdXMsIGNvbnRyZSBkZXMgcmVuZHVzIMOpdml0w6lzIMOgIGNoYXF1ZSBpbnRlcmFjdGlvbi4KCiMjIExlcyByZWRpcmVjdGlvbnMK',
    'CkF1IG1vbWVudCBkZSBsJ2FjdGl2YXRpb24sIHN1ciBsYSBtw6ptZSBtYWNoaW5lLCBsYSBjb21waWxhdGlvbiBkZSBgbmV4dCBidWlsZGAgZXN0IHBhc3PDqWUgZGUgNjEgw6AgODMgc2Vjb25kZXMsIGV0IDMzIGRlcyBmaWNoaWVycyBKYXZhU2NyaXB0IGVudm95w6lzIGF1IG5hdmlnYXRldXIgY29udGVuYWllbnQgbGUgY29kZSBkZSBtw6ltb3Jpc2F0aW9uIGFqb3V0w6kgcGFyIGxlIENvbXBpbGVyLiBVbmUgdmluZ3RhaW5lIGRlIHNlY29uZGVzIGRlIGJ1aWxkIGVuIHBsdXMsIGNvbnRyZSBkZXMgcmVuZHVzIMOpdml0w6lzIMOgIGNoYXF1ZSBpbnRlcmFjdGlvbi4KCjxDYWxsb3V0IHR5cGU9Indhcm5pbmciPgoqKkxlIENvbXBpbGVyIGV0IHJlYWN0LWhvb2stZm9ybSBuZSBzJ2VudGVuZGVudCBwYXMuKiogcmVhY3QtaG9vay1mb3JtIHNpZ25hbGUgbGVzIGNoYW5nZW1lbnRzIGQndW4gZm9ybXVsYWlyZSAobW9kaWZpw6kgPyBlcnJldXJzID8gZW52b2kgZW4gY291cnMgPykgcGFyIHVuIG9iamV0IGVzcGlvbiwgYGZvcm1TdGF0ZWAsIHF1ZSBsZSBDb21waWxlciBuZSBzYWl0IHBhcyBzdWl2cmUgOiBsZSByZW5kdSBtw6ltb3Jpc8OpIG5lIHNlIHJlbGFuY2UgcGx1cyBxdWFuZCBvbiB0YXBlLiBMZSBmb3JtdWxhaXJlIGR1IHByb2ZpbCBlbiBhIGZhaXQgbGVzIGZyYWlzIDogc29uIGJvdXRvbiDCqyBFbnJlZ2lzdHJlciDCuywgYWN0aXbDqSBzZXVsZW1lbnQgcXVhbmQgdW4gY2hhbXAgY2hhbmdlLCByZXN0YWl0IGdyaXPDqS4gTGVzIHF1YXRyZSBjb21wb3NhbnRzIGR1IHByb2pldCBxdWkgdXRpbGlzZW50IGB1c2VGb3JtYCBjb21tZW5jZW50IGRvbmMgcGFyIGxhIGRpcmVjdGl2ZSBgInVzZSBubyBtZW1vIjtgLCBxdWkgbGVzIGxhaXNzZSBob3JzIGR1IENvbXBpbGVyLiBMZSB0ZXN0IGBwcm9maWwtZWRpdGlvbi5zcGVjLnRzYCB2w6lyaWZpZSBxdWUgbGUgYm91dG9uIHMnYWN0aXZlIMOgIGxhIGZyYXBwZS4KPC9DYWxsb3V0PgoKIyMgTGVzIHJlZGlyZWN0aW9ucwo=')
sub('apps/web/src/features/admin/galleries/forms/UpdateGalleryForm.tsx', 'ICovCmV4cG9ydCBmdW5jdGlvbiBVcGRhdGVHYWxsZXJ5Rm9ybSh7IGdhbGxlcnkgfTogVXBkYXRlR2FsbGVyeUZvcm1Qcm9wcyk6IEpTWC5FbGVtZW50IHsKICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTsKICBjb25zdCBmb3JtID0gdXNlRm9ybTxGb3JtVmFsdWVzPih7Cg==',
    'ICovCmV4cG9ydCBmdW5jdGlvbiBVcGRhdGVHYWxsZXJ5Rm9ybSh7IGdhbGxlcnkgfTogVXBkYXRlR2FsbGVyeUZvcm1Qcm9wcyk6IEpTWC5FbGVtZW50IHsKICAvLyBIb3JzIGR1IFJlYWN0IENvbXBpbGVyIDogcmVhY3QtaG9vay1mb3JtIHNpZ25hbGUgc2VzIGNoYW5nZW1lbnRzIHBhciB1biBwcm94eSAoYGZvcm1TdGF0ZWApCiAgLy8gcXVlIGxlIGNvbXBpbGF0ZXVyIG5lIHZvaXQgcGFzIDsgbcOpbW9yaXPDqSwgbGUgcmVuZHUgbmUgc3VpdnJhaXQgcGx1cyBlcnJldXJzIGV0IMOpdGF0IGQnZW52b2kuCiAgInVzZSBubyBtZW1vIjsKICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTsKICBjb25zdCBmb3JtID0gdXNlRm9ybTxGb3JtVmFsdWVzPih7Cg==')
sub('apps/web/src/features/admin/library/forms/DragNDropForm.tsx', 'CmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERyYWdORHJvcEZvcm0oKTogSlNYLkVsZW1lbnQgewogIGNvbnN0IHVzZXIgPSB1c2VTZXNzaW9uU3RvcmUoKHMpID0+IHMuc2Vzc2lvbj8udXNlcik7Cgo=',
    'CmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIERyYWdORHJvcEZvcm0oKTogSlNYLkVsZW1lbnQgewogIC8vIEhvcnMgZHUgUmVhY3QgQ29tcGlsZXIgOiByZWFjdC1ob29rLWZvcm0gc2lnbmFsZSBzZXMgY2hhbmdlbWVudHMgcGFyIHVuIHByb3h5IChgZm9ybVN0YXRlYCkKICAvLyBxdWUgbGUgY29tcGlsYXRldXIgbmUgdm9pdCBwYXMgOyBtw6ltb3Jpc8OpLCBsZSByZW5kdSBuZSBzdWl2cmFpdCBwbHVzIGVycmV1cnMgZXQgw6l0YXQgZCdlbnZvaS4KICAidXNlIG5vIG1lbW8iOwogIGNvbnN0IHVzZXIgPSB1c2VTZXNzaW9uU3RvcmUoKHMpID0+IHMuc2Vzc2lvbj8udXNlcik7Cgo=')
sub('apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx', 'ICAgIDxidXR0b24KICAgICAgdHlwZT0ic3VibWl0IgogICAgICBjbGFzc05hbWU9InJvdW5kZWQgYmctYmxhY2sgcHgtNCBweS0yIHRleHQtd2hpdGUgZGlzYWJsZWQ6b3BhY2l0eS01MCIKICAgICAgZGlzYWJsZWQ9e3BlbmRpbmcgfHwgcHJvcHMuZGlzYWJsZWR9CiAgICA+Cg==',
    'ICAgIDxidXR0b24KICAgICAgdHlwZT0ic3VibWl0IgogICAgICAvLyBDb3VsZXVycyBkdSB0aMOobWUgOiBlbiBtb2RlIHNvbWJyZSwgdW4gYm91dG9uIG5vaXIgZGlzcGFyYWlzc2FpdCBzdXIgbGUgZm9uZCBkZSBsYSBwYWdlLgogICAgICBjbGFzc05hbWU9InJvdW5kZWQgYmctcHJpbWFyeSBweC00IHB5LTIgZm9udC1tZWRpdW0gdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgaG92ZXI6YmctcHJpbWFyeS85MCBkaXNhYmxlZDpvcGFjaXR5LTUwIgogICAgICBkaXNhYmxlZD17cGVuZGluZyB8fCBwcm9wcy5kaXNhYmxlZH0KICAgID4K')
sub('apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx', 'CmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVwZGF0ZU1lRm9ybSgpOiBKU1guRWxlbWVudCB7CiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7CiAgY29uc3Qgc2VhcmNoUGFyYW1zID0gdXNlU2VhcmNoUGFyYW1zKCk7Cg==',
    'CmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVwZGF0ZU1lRm9ybSgpOiBKU1guRWxlbWVudCB7CiAgLy8gSG9ycyBkdSBSZWFjdCBDb21waWxlciA6IHJlYWN0LWhvb2stZm9ybSBzaWduYWxlIHNlcyBjaGFuZ2VtZW50cyBwYXIgdW4gcHJveHkgKGBmb3JtU3RhdGVgKQogIC8vIHF1ZSBsZSBjb21waWxhdGV1ciBuZSB2b2l0IHBhcy4gTcOpbW9yaXPDqSwgbGUgcmVuZHUgbmUgc2UgcmVsYW7Dp2FpdCBwYXMgw6AgbGEgZnJhcHBlIDogaXNEaXJ0eQogIC8vIHJlc3RhaXQgZmF1eCBldCBsZSBib3V0b24gwqsgRW5yZWdpc3RyZXIgwrsgbmUgcydhY3RpdmFpdCBqYW1haXMuCiAgInVzZSBubyBtZW1vIjsKICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTsKICBjb25zdCBzZWFyY2hQYXJhbXMgPSB1c2VTZWFyY2hQYXJhbXMoKTsK')
sub('apps/web/src/features/admin/users/forms/update-me/UpdateMeForm.tsx', 'ICAgICAgICA8L2Rpdj4KCiAgICAgICAgey8qIFByZW1pw6hyZSBjb25uZXhpb24gY29tbWUgw6lkaXRpb24gOiBsJ2F1dG9yaXNhdGlvbiBkZSBkcm9pdCDDoCBsJ2ltYWdlIMOgIGltcHJpbWVyLiAqL30KICAgICAgICA8QmxhbmtDb25zZW50Rm9ybUNhcmQgLz4KCiAgICAgICAgPGRpdiBjbGFzc05hbWU9ImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIiBkYXRhLXRvdXI9InByb2ZpbC5mb3JtLnN1Ym1pdCI+CiAgICAgICAgICA8U3VibWl0QnV0dG9uIGRpc2FibGVkPXshY2FuU3VibWl0fSAvPgogICAgICAgICAgeyFpc0RpcnR5ICYmICgKICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSJ0ZXh0LXhzIHRleHQtc2xhdGUtNTAwIj4KICAgICAgICAgICAgICBBdWN1biBjaGFuZ2VtZW50IMOgIGVucmVnaXN0cmVyLgogICAgICAgICAgICA8L3NwYW4+CiAgICAgICAgICApfQogICAgICAgIDwvZGl2PgogICAgICA8L2Zvcm0+CiAgICA8L3NlY3Rpb24+Cg==',
    'ICAgICAgICA8L2Rpdj4KCiAgICAgICAgey8qIExlIGJvdXRvbiBqdXN0ZSBzb3VzIGxlcyBjaGFtcHMgOiBwbGFjw6kgYXByw6hzIGxhIGNhcnRlIGR1IGZvcm11bGFpcmUgZGUgZHJvaXQgw6AgbCdpbWFnZSwKICAgICAgICAgICAgaWwgcGFzc2FpdCBpbmFwZXLDp3UuICovfQogICAgICAgIDxkaXYgY2xhc3NOYW1lPSJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyIgZGF0YS10b3VyPSJwcm9maWwuZm9ybS5zdWJtaXQiPgogICAgICAgICAgPFN1Ym1pdEJ1dHRvbiBkaXNhYmxlZD17IWNhblN1Ym1pdH0gLz4KICAgICAgICAgIHshaXNEaXJ0eSAmJiAoCiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0idGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQiPgogICAgICAgICAgICAgIE1vZGlmaWV6IHVuIGNoYW1wIHBvdXIgcG91dm9pciBlbnJlZ2lzdHJlci4KICAgICAgICAgICAgPC9zcGFuPgogICAgICAgICAgKX0KICAgICAgICA8L2Rpdj4KCiAgICAgICAgey8qIFByZW1pw6hyZSBjb25uZXhpb24gY29tbWUgw6lkaXRpb24gOiBsJ2F1dG9yaXNhdGlvbiBkZSBkcm9pdCDDoCBsJ2ltYWdlIMOgIGltcHJpbWVyLiAqL30KICAgICAgICA8QmxhbmtDb25zZW50Rm9ybUNhcmQgLz4KICAgICAgPC9mb3JtPgogICAgPC9zZWN0aW9uPgo=')
sub('apps/web/src/features/auth/ChangePasswordForm.tsx', 'CmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENoYW5nZVBhc3N3b3JkRm9ybSgpOiBKU1guRWxlbWVudCB7CiAgY29uc3QgW29rTXNnLCBzZXRPa01zZ10gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTsKICBjb25zdCBbZXJyTXNnLCBzZXRFcnJNc2ddID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7Cg==',
    'CmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIENoYW5nZVBhc3N3b3JkRm9ybSgpOiBKU1guRWxlbWVudCB7CiAgLy8gSG9ycyBkdSBSZWFjdCBDb21waWxlciA6IHJlYWN0LWhvb2stZm9ybSBzaWduYWxlIHNlcyBjaGFuZ2VtZW50cyBwYXIgdW4gcHJveHkgKGBmb3JtU3RhdGVgKQogIC8vIHF1ZSBsZSBjb21waWxhdGV1ciBuZSB2b2l0IHBhcyA7IG3DqW1vcmlzw6ksIGxlIHJlbmR1IG5lIHN1aXZyYWl0IHBsdXMgZXJyZXVycyBldCDDqXRhdCBkJ2Vudm9pLgogICJ1c2Ugbm8gbWVtbyI7CiAgY29uc3QgW29rTXNnLCBzZXRPa01zZ10gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTsKICBjb25zdCBbZXJyTXNnLCBzZXRFcnJNc2ddID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7Cg==')
sub('e2e/data.mjs', 'ICAvLyBNYWpvcml0w6kgbm9uIHJlbnNlaWduw6llLCBwYXNzw6kgZW4gbWFqZXVyIHBhciBsZSB0cmkgZGUgbGEgbGlzdGUgZGVzIHV0aWxpc2F0ZXVycy4gw4AgbHVpIHNldWwuCiAgbWFqb3JpdGU6IHsgaWQ6ICJlMmUtbWFqb3JpdGUiLCBlbWFpbDogIm1ham9yaXRlQGUyZS50ZXN0IiwgZmlyc3ROYW1lOiAiTHVjYXMiIH0sCn07Cgo=',
    'ICAvLyBNYWpvcml0w6kgbm9uIHJlbnNlaWduw6llLCBwYXNzw6kgZW4gbWFqZXVyIHBhciBsZSB0cmkgZGUgbGEgbGlzdGUgZGVzIHV0aWxpc2F0ZXVycy4gw4AgbHVpIHNldWwuCiAgbWFqb3JpdGU6IHsgaWQ6ICJlMmUtbWFqb3JpdGUiLCBlbWFpbDogIm1ham9yaXRlQGUyZS50ZXN0IiwgZmlyc3ROYW1lOiAiTHVjYXMiIH0sCiAgLy8gTW9kaWZpZSBzb24gcHJvZmlsIChwc2V1ZG8pLiDDgCBsdWkgc2V1bC4KICBwcm9maWw6IHsgaWQ6ICJlMmUtcHJvZmlsIiwgZW1haWw6ICJwcm9maWxAZTJlLnRlc3QiLCBmaXJzdE5hbWU6ICJNYcOrbCIgfSwKfTsKCg==')
print("  édits ok (8 substitutions, 1 fichiers créés, 0 remplacés)")
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
Formulaires : hors du React Compiler ("use no memo"), le profil retrouve son bouton « Enregistrer », visible en mode sombre et placé sous les champs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Ensuite : pnpm install (retire les paquets de node_modules), puis git push."