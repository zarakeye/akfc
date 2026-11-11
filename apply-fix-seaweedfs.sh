#!/usr/bin/env bash
# Stockage local : SeaweedFS remplace MinIO, dont les images ont disparu de Docker Hub (CI, dev, sandbox).
# Prérequis : apply-docs-ci.sh. Aucune migration, rien sur le serveur.
# Usage (racine du repo) : bash apply-fix-seaweedfs.sh  — puis pnpm dev:infra, puis git push.
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

if git show HEAD:"docker-compose.dev.yml" 2>/dev/null | grep -qF "ghcr.io/chrislusf/seaweedfs"; then echo "Déjà appliqué (commité)."; exit 0; fi
grep -qF "À chaque push, GitHub refait ce que fait le Mac" "apps/web/content/docs/dev/qualite/l-integration-continue.mdx" 2>/dev/null || { echo "❌ lancer d'abord apply-fix-ci.sh puis apply-docs-ci.sh"; exit 1; }
MODIFIED=(".env.dev.example" ".env.example" ".github/workflows/ci.yml" "docker-compose.dev.yml" "docker-compose.sandbox.yml" "e2e/env.mjs" "packages/backend/src/modules/storage/adapters/r2/client.ts")
CREATED=()
restore(){ git checkout -q -- "${MODIFIED[@]}" 2>/dev/null || true; rm -f "${CREATED[@]}"; echo "  ↩ fichiers restaurés"; }
if grep -qF "ghcr.io/chrislusf/seaweedfs" "docker-compose.dev.yml" 2>/dev/null; then echo "  restes d'un essai précédent non commité → nettoyage"; restore; fi
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
sub('.env.dev.example', 'SldUX1NFQ1JFVD0iZGV2LW9ubHktand0LXNlY3JldC0wMTIzNDU2Nzg5LWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6IgoKIyDilIDilIDilIAgU3RvY2thZ2UgOiBNaW5JTyBqb3VlIGxlIHLDtGxlIGRlIENsb3VkZmxhcmUgUjIg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAClIyX0VORFBPSU5UPSJodHRwOi8vMTI3LjAuMC4xOjkyMDAiClIyX0FDQ0VTU19LRVlfSUQ9ImFrZmMtZGV2Igo=',
    'SldUX1NFQ1JFVD0iZGV2LW9ubHktand0LXNlY3JldC0wMTIzNDU2Nzg5LWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6IgoKIyDilIDilIDilIAgU3RvY2thZ2UgOiBTZWF3ZWVkRlMgam91ZSBsZSByw7RsZSBkZSBDbG91ZGZsYXJlIFIyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApSMl9FTkRQT0lOVD0iaHR0cDovLzEyNy4wLjAuMTo5MjAwIgpSMl9BQ0NFU1NfS0VZX0lEPSJha2ZjLWRldiIK')
sub('.env.example', 'UjJfU0VDUkVUX0FDQ0VTU19LRVk9eW91ci1yMi1zZWNyZXQtYWNjZXNzLWtleQpSMl9CVUNLRVQ9eW91ci1yMi1idWNrZXQKIyBGYWN1bHRhdGl2ZXMuIE1pbklPIChkZXYsIHNhbmRib3gpIGV4aWdlIGxlcyBhZHJlc3NlcyDCqyBwYXRoLXN0eWxlIMK7IDoKIyBSMl9GT1JDRV9QQVRIX1NUWUxFPXRydWUKIyBBZHJlc3NlIHZ1ZSBwYXIgbGUgTkFWSUdBVEVVUiBwb3VyIGxlcyBVUkwgc2lnbsOpZXMsIHNpIGVsbGUgZGlmZsOocmUgZGUKIyBSMl9FTkRQT0lOVCAoc2FuZGJveCA6IGBtaW5pbzo5MDAwYCBuJ2V4aXN0ZSBxdWUgZGFucyBsZSByw6lzZWF1IERvY2tlcikuCiMgUjJfUFVCTElDX0VORFBPSU5UPWh0dHA6Ly9sb2NhbGhvc3Q6OTAwMAoK',
    'UjJfU0VDUkVUX0FDQ0VTU19LRVk9eW91ci1yMi1zZWNyZXQtYWNjZXNzLWtleQpSMl9CVUNLRVQ9eW91ci1yMi1idWNrZXQKIyBGYWN1bHRhdGl2ZXMuIExlIHN0b2NrYWdlIGxvY2FsIChkZXYsIHNhbmRib3gpIGV4aWdlIGxlcyBhZHJlc3NlcyDCqyBwYXRoLXN0eWxlIMK7IDoKIyBSMl9GT1JDRV9QQVRIX1NUWUxFPXRydWUKIyBBZHJlc3NlIHZ1ZSBwYXIgbGUgTkFWSUdBVEVVUiBwb3VyIGxlcyBVUkwgc2lnbsOpZXMsIHNpIGVsbGUgZGlmZsOocmUgZGUKIyBSMl9FTkRQT0lOVCAoc2FuZGJveCA6IGBzdG9yYWdlOjgzMzNgIG4nZXhpc3RlIHF1ZSBkYW5zIGxlIHLDqXNlYXUgRG9ja2VyKS4KIyBSMl9QVUJMSUNfRU5EUE9JTlQ9aHR0cDovL2xvY2FsaG9zdDo5MDAwCgo=')
sub('.github/workflows/ci.yml', 'IyAgIDEuIFbDqXJpZmljYXRpb25zIDogcG5wbSBjaGVjayAoZ2FyZGVzIG1haXNvbiwgdHlwZWNoZWNrLCBsaW50KSDigJQgY2UgcXVlIGxhbmNlbnQgbGVzIHNjcmlwdHMKIyAgICAgIGF2YW50IGNoYXF1ZSBjb21taXQuCiMgICAyLiBUZXN0cyBkZSBib3V0IGVuIGJvdXQgOiBwbnBtIGUyZSwgY29udHJlIFBvc3RncmVzLCBNaW5JTyBldCBNYWlscGl0IGTDqW1hcnLDqXMgZGVwdWlzCiMgICAgICBkb2NrZXItY29tcG9zZS5kZXYueW1sLCBhdXggbcOqbWVzIGFkcmVzc2VzIHF1ZSBzdXIgbGUgTWFjIChlMmUvZW52Lm1qcykuCiMK',
    'IyAgIDEuIFbDqXJpZmljYXRpb25zIDogcG5wbSBjaGVjayAoZ2FyZGVzIG1haXNvbiwgdHlwZWNoZWNrLCBsaW50KSDigJQgY2UgcXVlIGxhbmNlbnQgbGVzIHNjcmlwdHMKIyAgICAgIGF2YW50IGNoYXF1ZSBjb21taXQuCiMgICAyLiBUZXN0cyBkZSBib3V0IGVuIGJvdXQgOiBwbnBtIGUyZSwgY29udHJlIFBvc3RncmVzLCBTZWF3ZWVkRlMgZXQgTWFpbHBpdCBkw6ltYXJyw6lzIGRlcHVpcwojICAgICAgZG9ja2VyLWNvbXBvc2UuZGV2LnltbCwgYXV4IG3Dqm1lcyBhZHJlc3NlcyBxdWUgc3VyIGxlIE1hYyAoZTJlL2Vudi5tanMpLgojCg==')
sub('.github/workflows/ci.yml', 'ICAgICAgICBydW46IHBucG0gaW5zdGFsbCAtLWZyb3plbi1sb2NrZmlsZQogICAgICAtIG5hbWU6IFNlcnZpY2VzIGRlIHRlc3QgKGJhc2UsIHN0b2NrYWdlLCBib8OudGUgbWFpbCkKICAgICAgICBydW46IHwKICAgICAgICAgIGRvY2tlciBjb21wb3NlIC1mIGRvY2tlci1jb21wb3NlLmRldi55bWwgdXAgLWQgLS13YWl0IGRiIHN0b3JhZ2UgbWFpbAogICAgICAgICAgIyBNaW5JTyBuJ2EgcGFzIGRlIGhlYWx0aGNoZWNrIGRhbnMgbGUgY29tcG9zZSA6IG9uIGF0dGVuZCBxdSdpbCByw6lwb25kZS4KICAgICAgICAgIGZvciBpIGluICQoc2VxIDEgMzApOyBkbwogICAgICAgICAgICBjdXJsIC1mc1MgaHR0cDovLzEyNy4wLjAuMTo5MjAwL21pbmlvL2hlYWx0aC9saXZlID4vZGV2L251bGwgJiYgYnJlYWsKICAgICAgICAgICAgc2xlZXAgMQogICAgICAgICAgZG9uZQogICAgICAgICAgY3VybCAtZnNTIGh0dHA6Ly8xMjcuMC4wLjE6OTIwMC9taW5pby9oZWFsdGgvbGl2ZSA+L2Rldi9udWxsCiAgICAgIC0gbmFtZTogTmF2aWdhdGV1ciBkZXMgdGVzdHMgKENocm9taXVtKQogICAgICAgIHJ1bjogcG5wbSBleGVjIHBsYXl3cmlnaHQgaW5zdGFsbCAtLXdpdGgtZGVwcyBjaHJvbWl1bQo=',
    'ICAgICAgICBydW46IHBucG0gaW5zdGFsbCAtLWZyb3plbi1sb2NrZmlsZQogICAgICAtIG5hbWU6IFNlcnZpY2VzIGRlIHRlc3QgKGJhc2UsIHN0b2NrYWdlLCBib8OudGUgbWFpbCkKICAgICAgICAjIC0td2FpdCByZW5kIGxhIG1haW4gcXVhbmQgbGEgYmFzZSBldCBsZSBzdG9ja2FnZSByw6lwb25kZW50IChoZWFsdGhjaGVjaykgZXQgcXVlIE1haWxwaXQgdG91cm5lLgogICAgICAgIHJ1bjogZG9ja2VyIGNvbXBvc2UgLWYgZG9ja2VyLWNvbXBvc2UuZGV2LnltbCB1cCAtZCAtLXdhaXQgZGIgc3RvcmFnZSBtYWlsCiAgICAgIC0gbmFtZTogTmF2aWdhdGV1ciBkZXMgdGVzdHMgKENocm9taXVtKQogICAgICAgIHJ1bjogcG5wbSBleGVjIHBsYXl3cmlnaHQgaW5zdGFsbCAtLXdpdGgtZGVwcyBjaHJvbWl1bQo=')
sub('docker-compose.dev.yml', 'IyAgbmkgdW4gUG9zdGdyZXMgZMOpasOgIGluc3RhbGzDqSAoNTQzMikuIFRvdXQgw6ljb3V0ZSBzdXIgMTI3LjAuMC4xIHNldWxlbWVudC4KIyAgICBQb3N0Z3JlcyAgMTI3LjAuMC4xOjU0MzUKIyAgICBNaW5JTyAgICAgMTI3LjAuMC4xOjkyMDAgKEFQSSBTMykgIMK3ICBodHRwOi8vbG9jYWxob3N0OjkyMDEgKGNvbnNvbGUpCiMgICAgTWFpbHBpdCAgIDEyNy4wLjAuMToxMDI2IChTTVRQKSAgICDCtyAgaHR0cDovL2xvY2FsaG9zdDo4MDI2IChib8OudGUgd2ViKQojCg==',
    'IyAgbmkgdW4gUG9zdGdyZXMgZMOpasOgIGluc3RhbGzDqSAoNTQzMikuIFRvdXQgw6ljb3V0ZSBzdXIgMTI3LjAuMC4xIHNldWxlbWVudC4KIyAgICBQb3N0Z3JlcyAgMTI3LjAuMC4xOjU0MzUKIyAgICBTZWF3ZWVkRlMgMTI3LjAuMC4xOjkyMDAgKEFQSSBTMykgIMK3ICBodHRwOi8vbG9jYWxob3N0OjkyMDEgKGZpY2hpZXJzIHN0b2Nrw6lzKQojICAgIE1haWxwaXQgICAxMjcuMC4wLjE6MTAyNiAoU01UUCkgICAgwrcgIGh0dHA6Ly9sb2NhbGhvc3Q6ODAyNiAoYm/DrnRlIHdlYikKIwo=')
sub('docker-compose.dev.yml', 'CiAgIyBTdG9ja2FnZSBjb21wYXRpYmxlIFMzIDogam91ZSBsZSByw7RsZSBkZSBDbG91ZGZsYXJlIFIyIGVuIGxvY2FsLgogIHN0b3JhZ2U6CiAgICBpbWFnZTogbWluaW8vbWluaW86bGF0ZXN0CiAgICBjb21tYW5kOiBzZXJ2ZXIgL2RhdGEgLS1jb25zb2xlLWFkZHJlc3MgIjo5MDAxIgogICAgZW52aXJvbm1lbnQ6CiAgICAgIE1JTklPX1JPT1RfVVNFUjogYWtmYy1kZXYKICAgICAgTUlOSU9fUk9PVF9QQVNTV09SRDogYWtmYy1kZXYtc2VjcmV0CiAgICBwb3J0czoKICAgICAgLSAiMTI3LjAuMC4xOjkyMDA6OTAwMCIKICAgICAgLSAiMTI3LjAuMC4xOjkyMDE6OTAwMSIKICAgIHZvbHVtZXM6CiAgICAgIC0gYWtmYy1kZXYtc3RvcmFnZTovZGF0YQoKICAjIENyw6llIGxlIGJ1Y2tldCBhdSBwcmVtaWVyIGTDqW1hcnJhZ2UsIHB1aXMgcydhcnLDqnRlLgogIHN0b3JhZ2UtaW5pdDoKICAgIGltYWdlOiBtaW5pby9tYzpsYXRlc3QKICAgIGRlcGVuZHNfb246CiAgICAgIC0gc3RvcmFnZQogICAgcmVzdGFydDogIm5vIgogICAgZW50cnlwb2ludDogPgogICAgICAvYmluL3NoIC1jICIKICAgICAgdW50aWwgbWMgYWxpYXMgc2V0IGxvY2FsIGh0dHA6Ly9zdG9yYWdlOjkwMDAgYWtmYy1kZXYgYWtmYy1kZXYtc2VjcmV0OyBkbyBzbGVlcCAxOyBkb25lOwogICAgICBtYyBtYiAtcCBsb2NhbC9ha2ZjLWRldiB8fCB0cnVlOwogICAgICBlY2hvICdidWNrZXQgYWtmYy1kZXYgcHLDqnQnOwogICAgICAiCgogICMgQ2FwdHVyZSBUT1VTIGxlcyBlLW1haWxzIGVudm95w6lzIHBhciBsJ2FwcCAoYXVjdW4gbmUgcGFydCBzdXIgaW50ZXJuZXQpLgogIG1haWw6CiAgICBpbWFnZTogYXhsbGVudC9tYWlscGl0OmxhdGVzdAogICAgcG9ydHM6CiAgICAgIC0gIjEyNy4wLjAuMToxMDI2OjEwMjUiCg==',
    'CiAgIyBTdG9ja2FnZSBjb21wYXRpYmxlIFMzIDogam91ZSBsZSByw7RsZSBkZSBDbG91ZGZsYXJlIFIyIGVuIGxvY2FsLgogICMgU2Vhd2VlZEZTLCBsb2dpY2llbCBsaWJyZSAoQXBhY2hlIDIuMCksIMOgIHVuZSB2ZXJzaW9uIEZJR8OJRSA6IG9uIGxhIGNoYW5nZSBwYXIgdW5lIG1vZGlmaWNhdGlvbgogICMgZHUgZMOpcMO0dCwgamFtYWlzIGVuIHNpbGVuY2UgKE1pbklPLCBsJ2FuY2llbiBzdG9ja2FnZSwgYSByZXRpcsOpIHNlcyBpbWFnZXMgZW4gc2VwdGVtYnJlIDIwMjYpLgogICMgwqsgbWluaSDCuyBsYW5jZSB0b3V0IGVuIHVuIHNldWwgcHJvY2Vzc3VzIDsgLWJ1Y2tldCBjcsOpZSBha2ZjLWRldiBhdSBkw6ltYXJyYWdlIHMnaWwgbWFucXVlIDsKICAjIGxlcyBpZGVudGlmaWFudHMgdmllbm5lbnQgZGVzIGRldXggdmFyaWFibGVzIEFXU18qLiBMZSByZXN0ZSAoV2ViREFWLCBJY2ViZXJnLCBMYW5jZSkgZXN0IGNvdXDDqS4KICBzdG9yYWdlOgogICAgaW1hZ2U6IGdoY3IuaW8vY2hyaXNsdXNmL3NlYXdlZWRmczo0LjUyCiAgICBjb21tYW5kOiBtaW5pIC1idWNrZXQ9YWtmYy1kZXYgLXdlYmRhdj1mYWxzZSAtczMucG9ydC5pY2ViZXJnPTAgLXMzLnBvcnQubGFuY2U9MAogICAgZW52aXJvbm1lbnQ6CiAgICAgIEFXU19BQ0NFU1NfS0VZX0lEOiBha2ZjLWRldgogICAgICBBV1NfU0VDUkVUX0FDQ0VTU19LRVk6IGFrZmMtZGV2LXNlY3JldAogICAgcG9ydHM6CiAgICAgIC0gIjEyNy4wLjAuMTo5MjAwOjgzMzMiCiAgICAgIC0gIjEyNy4wLjAuMTo5MjAxOjg4ODgiCiAgICB2b2x1bWVzOgogICAgICAtIGFrZmMtZGV2LXNlYXdlZWRmczovZGF0YQogICAgaGVhbHRoY2hlY2s6CiAgICAgIHRlc3Q6IFsiQ01EIiwgImN1cmwiLCAiLWZzUyIsICItbyIsICIvZGV2L251bGwiLCAiaHR0cDovLzEyNy4wLjAuMTo4MzMzL2hlYWx0aHoiXQogICAgICBpbnRlcnZhbDogM3MKICAgICAgdGltZW91dDogM3MKICAgICAgcmV0cmllczogMjAKCiAgIyBDYXB0dXJlIFRPVVMgbGVzIGUtbWFpbHMgZW52b3nDqXMgcGFyIGwnYXBwIChhdWN1biBuZSBwYXJ0IHN1ciBpbnRlcm5ldCkuCiAgbWFpbDoKICAgIGltYWdlOiBnaGNyLmlvL2F4bGxlbnQvbWFpbHBpdDp2MS4zMy4wCiAgICBwb3J0czoKICAgICAgLSAiMTI3LjAuMC4xOjEwMjY6MTAyNSIK')
sub('docker-compose.dev.yml', 'dm9sdW1lczoKICBha2ZjLWRldi1wZ2RhdGE6CiAgYWtmYy1kZXYtc3RvcmFnZToK',
    'dm9sdW1lczoKICBha2ZjLWRldi1wZ2RhdGE6CiAgYWtmYy1kZXYtc2Vhd2VlZGZzOgo=')
sub('docker-compose.sandbox.yml', 'IyAgZ2l0IGNsb25lIOKApiAmJiBkb2NrZXIgY29tcG9zZSAtZiBkb2NrZXItY29tcG9zZS5zYW5kYm94LnltbCB1cCAtZCAtLWJ1aWxkCiMgICAg4oaSIGFwcCBzdXIgaHR0cDovL2xvY2FsaG9zdDozMDEwCiMgICAg4oaSIGNvbnNvbGUgTWluSU8gICBodHRwOi8vbG9jYWxob3N0OjkwMDEgIChzYW5kYm94IC8gc2FuZGJveC1zZWNyZXQpCiMgICAg4oaSIE1haWxwaXQgKG1haWxzKSBodHRwOi8vbG9jYWxob3N0OjgwMjUKIwo=',
    'IyAgZ2l0IGNsb25lIOKApiAmJiBkb2NrZXIgY29tcG9zZSAtZiBkb2NrZXItY29tcG9zZS5zYW5kYm94LnltbCB1cCAtZCAtLWJ1aWxkCiMgICAg4oaSIGFwcCBzdXIgaHR0cDovL2xvY2FsaG9zdDozMDEwCiMgICAg4oaSIGZpY2hpZXJzIHN0b2Nrw6lzIGh0dHA6Ly9sb2NhbGhvc3Q6OTAwMSAgKFNlYXdlZWRGUykKIyAgICDihpIgTWFpbHBpdCAobWFpbHMpIGh0dHA6Ly9sb2NhbGhvc3Q6ODAyNQojCg==')
sub('docker-compose.sandbox.yml', 'ICAgICAgcmV0cmllczogMjAKCiAgbWluaW86CiAgICBpbWFnZTogbWluaW8vbWluaW86bGF0ZXN0CiAgICBjb21tYW5kOiBzZXJ2ZXIgL2RhdGEgLS1jb25zb2xlLWFkZHJlc3MgIjo5MDAxIgogICAgZW52aXJvbm1lbnQ6CiAgICAgIE1JTklPX1JPT1RfVVNFUjogc2FuZGJveAogICAgICBNSU5JT19ST09UX1BBU1NXT1JEOiBzYW5kYm94LXNlY3JldAogICAgcG9ydHM6CiAgICAgIC0gIjkwMDA6OTAwMCIKICAgICAgLSAiOTAwMTo5MDAxIgogICAgdm9sdW1lczoKICAgICAgLSBzYW5kYm94X21pbmlvOi9kYXRhCgogIG1pbmlvLWluaXQ6CiAgICBpbWFnZTogbWluaW8vbWM6bGF0ZXN0CiAgICBkZXBlbmRzX29uOgogICAgICAtIG1pbmlvCiAgICBlbnRyeXBvaW50OiA+CiAgICAgIC9iaW4vc2ggLWMgIgogICAgICB1bnRpbCBtYyBhbGlhcyBzZXQgbG9jYWwgaHR0cDovL21pbmlvOjkwMDAgc2FuZGJveCBzYW5kYm94LXNlY3JldDsgZG8gc2xlZXAgMTsgZG9uZTsKICAgICAgbWMgbWIgLXAgbG9jYWwvZG9jdW1lbnRzIHx8IHRydWU7CiAgICAgIGVjaG8gJ2J1Y2tldHMgcHJldHMnOwogICAgICAiCgogIG1haWxwaXQ6CiAgICBpbWFnZTogYXhsbGVudC9tYWlscGl0OmxhdGVzdAogICAgcG9ydHM6CiAgICAgIC0gIjgwMjU6ODAyNSIgICAgICAjIFVJIHdlYiBkZXMgbWFpbHMK',
    'ICAgICAgcmV0cmllczogMjAKCiAgIyBTdG9ja2FnZSBjb21wYXRpYmxlIFMzIChTZWF3ZWVkRlMsIHZlcnNpb24gZmlnw6llKSA6IGNyw6llIGxlIGJ1Y2tldCDCqyBkb2N1bWVudHMgwrsgYXUgZMOpbWFycmFnZS4KICBzdG9yYWdlOgogICAgaW1hZ2U6IGdoY3IuaW8vY2hyaXNsdXNmL3NlYXdlZWRmczo0LjUyCiAgICBjb21tYW5kOiBtaW5pIC1idWNrZXQ9ZG9jdW1lbnRzIC13ZWJkYXY9ZmFsc2UgLXMzLnBvcnQuaWNlYmVyZz0wIC1zMy5wb3J0LmxhbmNlPTAKICAgIGVudmlyb25tZW50OgogICAgICBBV1NfQUNDRVNTX0tFWV9JRDogc2FuZGJveAogICAgICBBV1NfU0VDUkVUX0FDQ0VTU19LRVk6IHNhbmRib3gtc2VjcmV0CiAgICBwb3J0czoKICAgICAgLSAiOTAwMDo4MzMzIiAgICAgICMgQVBJIFMzIChVUkwgc2lnbsOpZXMgdnVlcyBwYXIgbGUgbmF2aWdhdGV1cikKICAgICAgLSAiOTAwMTo4ODg4IiAgICAgICMgZmljaGllcnMgc3RvY2vDqXMKICAgIHZvbHVtZXM6CiAgICAgIC0gc2FuZGJveF9zdG9yYWdlOi9kYXRhCiAgICBoZWFsdGhjaGVjazoKICAgICAgdGVzdDogWyJDTUQiLCAiY3VybCIsICItZnNTIiwgIi1vIiwgIi9kZXYvbnVsbCIsICJodHRwOi8vMTI3LjAuMC4xOjgzMzMvaGVhbHRoeiJdCiAgICAgIGludGVydmFsOiAzcwogICAgICB0aW1lb3V0OiAzcwogICAgICByZXRyaWVzOiAyMAoKICBtYWlscGl0OgogICAgaW1hZ2U6IGdoY3IuaW8vYXhsbGVudC9tYWlscGl0OnYxLjMzLjAKICAgIHBvcnRzOgogICAgICAtICI4MDI1OjgwMjUiICAgICAgIyBVSSB3ZWIgZGVzIG1haWxzCg==')
sub('docker-compose.sandbox.yml', 'ICAgICAgc2VlZGVyOgogICAgICAgIGNvbmRpdGlvbjogc2VydmljZV9jb21wbGV0ZWRfc3VjY2Vzc2Z1bGx5CiAgICAgIG1pbmlvLWluaXQ6CiAgICAgICAgY29uZGl0aW9uOiBzZXJ2aWNlX3N0YXJ0ZWQKICAgICAgbWFpbHBpdDoKICAgICAgICBjb25kaXRpb246IHNlcnZpY2Vfc3RhcnRlZAo=',
    'ICAgICAgc2VlZGVyOgogICAgICAgIGNvbmRpdGlvbjogc2VydmljZV9jb21wbGV0ZWRfc3VjY2Vzc2Z1bGx5CiAgICAgIHN0b3JhZ2U6CiAgICAgICAgY29uZGl0aW9uOiBzZXJ2aWNlX2hlYWx0aHkKICAgICAgbWFpbHBpdDoKICAgICAgICBjb25kaXRpb246IHNlcnZpY2Vfc3RhcnRlZAo=')
sub('docker-compose.sandbox.yml', 'ICAgICAgQVBQX1NVUFBPUlRfRU1BSUw6ICJjb250YWN0QHNhbmRib3gubG9jYWwiCgogICAgICAjIOKUgOKUgCBTdG9ja2FnZSAoUjIpIOKGkiBNaW5JTyA6IHRvdXMgbGVzIGZpY2hpZXJzLCBidWNrZXQgwqsgZG9jdW1lbnRzIMK7LiBQYXRoLXN0eWxlLiDilIDilIAKICAgICAgUjJfRU5EUE9JTlQ6ICJodHRwOi8vbWluaW86OTAwMCIKICAgICAgUjJfQUNDRVNTX0tFWV9JRDogInNhbmRib3giCiAgICAgIFIyX1NFQ1JFVF9BQ0NFU1NfS0VZOiAic2FuZGJveC1zZWNyZXQiCg==',
    'ICAgICAgQVBQX1NVUFBPUlRfRU1BSUw6ICJjb250YWN0QHNhbmRib3gubG9jYWwiCgogICAgICAjIOKUgOKUgCBTdG9ja2FnZSAoUjIpIOKGkiBTZWF3ZWVkRlMgOiB0b3VzIGxlcyBmaWNoaWVycywgYnVja2V0IMKrIGRvY3VtZW50cyDCuy4gUGF0aC1zdHlsZS4g4pSA4pSACiAgICAgIFIyX0VORFBPSU5UOiAiaHR0cDovL3N0b3JhZ2U6ODMzMyIKICAgICAgUjJfQUNDRVNTX0tFWV9JRDogInNhbmRib3giCiAgICAgIFIyX1NFQ1JFVF9BQ0NFU1NfS0VZOiAic2FuZGJveC1zZWNyZXQiCg==')
sub('docker-compose.sandbox.yml', 'dm9sdW1lczoKICBzYW5kYm94X3BnZGF0YToKICBzYW5kYm94X21pbmlvOgo=',
    'dm9sdW1lczoKICBzYW5kYm94X3BnZGF0YToKICBzYW5kYm94X3N0b3JhZ2U6Cg==')
sub('e2e/env.mjs', 'ICoKICogVG91dCBlc3QgTE9DQUwgZXQgZMOpZGnDqSBhdXggdGVzdHMgOiBsYSBiYXNlIGBha2ZjX2UyZWAgZHUgUG9zdGdyZXMgZGUgZMOpdmVsb3BwZW1lbnQKICogKGRvY2tlci1jb21wb3NlLmRldi55bWwpLCBsZSBidWNrZXQgYGFrZmMtZTJlYCBkdSBNaW5JTyBkZSBkw6l2ZWxvcHBlbWVudCwgbGEgYm/DrnRlIE1haWxwaXQsIGV0CiAqIHVuZSBhcHBsaWNhdGlvbiBjb25zdHJ1aXRlIMOgIHBhcnQgKGFwcHMvd2ViLy5uZXh0LWUyZSkgcXVpIMOpY291dGUgc3VyIGxlIHBvcnQgMzEwMC4gTmkgbGEgYmFzZQogKiBkZSBkw6l2ZWxvcHBlbWVudCAoYGFrZmNfZGJgKSwgbmkgYHBucG0gZGV2YCwgbmkgbGEgcHJvZHVjdGlvbiBuZSBzb250IHRvdWNow6lzIDogYGFzc2VydExvY2FsYAo=',
    'ICoKICogVG91dCBlc3QgTE9DQUwgZXQgZMOpZGnDqSBhdXggdGVzdHMgOiBsYSBiYXNlIGBha2ZjX2UyZWAgZHUgUG9zdGdyZXMgZGUgZMOpdmVsb3BwZW1lbnQKICogKGRvY2tlci1jb21wb3NlLmRldi55bWwpLCBsZSBidWNrZXQgYGFrZmMtZTJlYCBkdSBzdG9ja2FnZSBkZSBkw6l2ZWxvcHBlbWVudCwgbGEgYm/DrnRlIE1haWxwaXQsIGV0CiAqIHVuZSBhcHBsaWNhdGlvbiBjb25zdHJ1aXRlIMOgIHBhcnQgKGFwcHMvd2ViLy5uZXh0LWUyZSkgcXVpIMOpY291dGUgc3VyIGxlIHBvcnQgMzEwMC4gTmkgbGEgYmFzZQogKiBkZSBkw6l2ZWxvcHBlbWVudCAoYGFrZmNfZGJgKSwgbmkgYHBucG0gZGV2YCwgbmkgbGEgcHJvZHVjdGlvbiBuZSBzb250IHRvdWNow6lzIDogYGFzc2VydExvY2FsYAo=')
sub('packages/backend/src/modules/storage/adapters/r2/client.ts', 'ICAgIHJlZ2lvbjogImF1dG8iLAogICAgZW5kcG9pbnQ6IHJlYWRFbnYoIlIyX0VORFBPSU5UIiksCiAgICAvLyBNaW5JTyBleGlnZSBsZSBwYXRoLXN0eWxlIDsgUjIgKHByb2QpIG5lIGTDqWZpbml0IHBhcyBsYSB2YXIg4oaSIGZhbHNlLgogICAgZm9yY2VQYXRoU3R5bGU6IHByb2Nlc3MuZW52LlIyX0ZPUkNFX1BBVEhfU1RZTEUgPT09ICJ0cnVlIiwKICAgIGNyZWRlbnRpYWxzOiB7Cg==',
    'ICAgIHJlZ2lvbjogImF1dG8iLAogICAgZW5kcG9pbnQ6IHJlYWRFbnYoIlIyX0VORFBPSU5UIiksCiAgICAvLyBMZSBzdG9ja2FnZSBsb2NhbCAoU2Vhd2VlZEZTKSBleGlnZSBsZSBwYXRoLXN0eWxlIDsgUjIgKHByb2QpIG5lIGTDqWZpbml0IHBhcyBsYSB2YXIg4oaSIGZhbHNlLgogICAgZm9yY2VQYXRoU3R5bGU6IHByb2Nlc3MuZW52LlIyX0ZPUkNFX1BBVEhfU1RZTEUgPT09ICJ0cnVlIiwKICAgIGNyZWRlbnRpYWxzOiB7Cg==')
sub('packages/backend/src/modules/storage/adapters/r2/client.ts', 'ICogRW4gcHJvZCA6IFIyX1BVQkxJQ19FTkRQT0lOVCBhYnNlbnQg4oaSIGVuZHBvaW50IFIyIHB1YmxpYyAoQ2xvdWRmbGFyZSksCiAqIGpvaWduYWJsZSBwYXIgbGUgY2xpZW50LiBFbiBzYW5kYm94IDogUjJfUFVCTElDX0VORFBPSU5UPWxvY2FsaG9zdDo5MDAwCiAqIChjYXIgYG1pbmlvOjkwMDBgLCBub20gRG9ja2VyLCBuJ2VzdCBwYXMgcsOpc29sdWJsZSBjw7R0w6kgbmF2aWdhdGV1cikuCiAqIENoZWNrc3VtIFNESyBkw6lzYWN0aXbDqSAoQ1JDIGNhbGN1bMOpIHN1ciBjb3JwcyB2aWRlIOKGkiByZWpldMOpIHBhciBNaW5JTykuCiAqLwpsZXQgY2FjaGVkUHJlc2lnbjogUzNDbGllbnQgfCBudWxsID0gbnVsbDsK',
    'ICogRW4gcHJvZCA6IFIyX1BVQkxJQ19FTkRQT0lOVCBhYnNlbnQg4oaSIGVuZHBvaW50IFIyIHB1YmxpYyAoQ2xvdWRmbGFyZSksCiAqIGpvaWduYWJsZSBwYXIgbGUgY2xpZW50LiBFbiBzYW5kYm94IDogUjJfUFVCTElDX0VORFBPSU5UPWxvY2FsaG9zdDo5MDAwCiAqIChjYXIgYHN0b3JhZ2U6ODMzM2AsIG5vbSBEb2NrZXIsIG4nZXN0IHBhcyByw6lzb2x1YmxlIGPDtHTDqSBuYXZpZ2F0ZXVyKS4KICogQ2hlY2tzdW0gU0RLIGTDqXNhY3RpdsOpIChDUkMgY2FsY3Vsw6kgc3VyIGNvcnBzIHZpZGUg4oaSIHJlamV0w6kgcGFyIE1pbklPLCBsJ2FuY2llbiBzdG9ja2FnZSBsb2NhbCkuCiAqLwpsZXQgY2FjaGVkUHJlc2lnbjogUzNDbGllbnQgfCBudWxsID0gbnVsbDsK')
print("  édits ok (15 substitutions, 0 fichiers créés, 0 remplacés)")
PY
trap - ERR

# ─── package.json : par ancre (ta version diffère de la mienne) ─────────────────────
PKG_OLD='"dev:infra": "docker compose -f docker-compose.dev.yml up -d",'
PKG_NEW='"dev:infra": "docker compose -f docker-compose.dev.yml up -d --wait --remove-orphans",'
PKG_DONE=0
if grep -qF -- "$PKG_NEW" package.json; then
  echo "  package.json : dev:infra déjà à jour"
elif [ "$(grep -cF -- "$PKG_OLD" package.json)" = 1 ]; then
  if git diff --quiet HEAD -- package.json; then
    PKG_OLD="$PKG_OLD" PKG_NEW="$PKG_NEW" python3 -c 'import os;p="package.json";s=open(p,encoding="utf-8").read();o,n=os.environ["PKG_OLD"],os.environ["PKG_NEW"];assert s.count(o)==1;open(p,"w",encoding="utf-8").write(s.replace(o,n))'
    PKG_DONE=1; echo "  package.json : dev:infra attend les services et retire l'ancien storage-init"
  else
    echo "  ⚠ package.json a des modifications non commitées : dev:infra laissé tel quel (à changer à la main : ajouter --wait --remove-orphans)"
  fi
else
  echo "  ⚠ package.json : ligne dev:infra introuvable, laissée telle quelle"
fi
restore_all(){ [ "$PKG_DONE" = 1 ] && git checkout -q -- package.json; restore; }
[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans vérification ni commit)."; exit 0; }
node scripts/build-procedure-map.mjs --write >/dev/null 2>&1 || { echo "❌ carte des procédures : échec"; restore_all; exit 1; }
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
  restore_all; exit 1
fi
echo "  ✅ check OK"
ADD=("${MODIFIED[@]}" apps/web/src/features/docs/entities/procedureMap.generated.json)
[ "$PKG_DONE" = 1 ] && ADD+=(package.json)
git add -- "${ADD[@]}"
git commit -F - >/tmp/c.log 2>&1 <<'MSG' && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }
Stockage local : SeaweedFS remplace MinIO (images retirées de Docker Hub)

MinIO a supprimé minio/minio et minio/mc de Docker Hub (septembre 2026) :
la CI, qui part d'une machine neuve, échouait au téléchargement ; la sandbox
recruteurs et toute nouvelle machine de dev aussi.

- docker-compose.dev.yml, docker-compose.sandbox.yml : SeaweedFS
  (ghcr.io/chrislusf/seaweedfs:4.52, version figée, Apache 2.0), « weed
  mini » ; le bucket est créé au démarrage (-bucket), les identifiants par
  AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY ; healthcheck sur /healthz ;
  plus de conteneur storage-init / minio-init. Mêmes adresses côté machine
  (9200 en dev, 9000 en sandbox) : aucune variable d'environnement ne change.
  Nouveaux volumes : l'ancien volume MinIO n'est ni lu ni supprimé.
- CI : docker compose up --wait suffit (plus de boucle d'attente MinIO).
- Mailpit figé lui aussi (ghcr.io/axllent/mailpit:v1.33.0, au lieu de latest).
- package.json : dev:infra attend les services (--wait) et retire le
  conteneur storage-init devenu orphelin (--remove-orphans).
- Commentaires : .env.example, .env.dev.example, e2e/env.mjs, client R2.

Vérifié : les 46 tests de bout en bout passent contre SeaweedFS 4.52.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_014AwAatLqGUpv9M26hMLAVF
MSG
echo "Aucune migration, rien à faire sur le serveur (la production utilise R2)."
echo "Ensuite : pnpm dev:infra (télécharge SeaweedFS), puis git push → onglet Actions."