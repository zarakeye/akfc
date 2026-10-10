#!/usr/bin/env bash
# Page « S'inscrire » : inscription en ligne (plateforme GOasso de la MJC) mise en avant, avec liens ;
# partenaire MJC complété (site principal + liens GOasso) s'il n'a pas été renseigné.
# Usage : bash fix-inscription-goasso.sh   (AKFC_APPLY_ONLY=1 : sans pnpm check ni commit)
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }

SVC=packages/backend/src/modules/sitePages/ensureInscriptionPage.service.ts
PART=packages/backend/src/modules/sitePartners/sitePartners.service.ts
INSTR=apps/web/src/instrumentation.ts

if grep -q "GOASSO_ACTIVITES" "$SVC"; then echo "Déjà appliqué."; exit 0; fi
grep -q "Écrivez-nous depuis la page Contacts" "$SVC" || { echo "ensureInscriptionPage.service.ts inattendu (fix-inscription-editable.sh appliqué ?)"; exit 1; }

base64 -d > "$SVC" <<'B64'
aW1wb3J0IHR5cGUgeyBQcmlzbWEsIFByaXNtYUNsaWVudCB9IGZyb20gIkBwcmlzbWEvY2xpZW50
IjsKCmltcG9ydCB7IHBhZ2VDb250ZW50U2NoZW1hVjEgfSBmcm9tICJAY29udHJhY3RzL3BhZ2Ui
OwoKLyoKICogUGFnZSDDqWRpdG9yaWFsZSDCqyBTJ2luc2NyaXJlIMK7IChTaXRlUGFnZSDCqyBp
bnNjcmlwdGlvbiDCuykgOiBjcsOpw6llIGF1IHByZW1pZXIgZMOpbWFycmFnZSBhdmVjIHVuCiAq
IHRleHRlIGRlIGTDqXBhcnQgUsOJRUwgKHVuIGJsb2MgZGUgdGV4dGUpLCBxdWUgbGVzIGFkbWlu
aXN0cmF0ZXVycyBtb2RpZmllbnQgZW5zdWl0ZSBsaWJyZW1lbnQgZGFucwogKiBsZSBjb25zdHJ1
Y3RldXIg4oCUIGNlIHF1aSBzJ2FmZmljaGUgZXN0IGV4YWN0ZW1lbnQgY2UgcXVlIG1vbnRyZSBs
J8OpZGl0ZXVyLiBMYSBwYWdlIHJlc3RlIGVuCiAqIGJyb3VpbGxvbiB0YW50IHF1J29uIG5lIGxh
IHB1YmxpZSBwYXMgKFBhZ2VzIMOpZGl0b3JpYWxlcykuCiAqCiAqIE1pc2Ugw6Agam91ciBkdSB0
ZXh0ZSBkZSBkw6lwYXJ0IDogdW5lIHBhZ2UgZG9udCBsZSBjb250ZW51IGVzdCBlbmNvcmUgRVhB
Q1RFTUVOVCB1bmUgdmVyc2lvbgogKiBwcsOpY8OpZGVudGUgZHUgdGV4dGUgZGUgZMOpcGFydCAo
amFtYWlzIHJldG91Y2jDqWUpIHJlw6dvaXQgbGEgbm91dmVsbGUgdmVyc2lvbiA7IHVuZSBwYWdl
IG1vZGlmacOpZQogKiBkYW5zIGxlIGNvbnN0cnVjdGV1ciBuJ2VzdCBqYW1haXMgdG91Y2jDqWUu
CiAqLwoKY29uc3QgTUpDX1NJVEUgPSAiaHR0cHM6Ly93d3cubWpjLWNoYW1iZXJ5LmNvbSI7CmNv
bnN0IEdPQVNTT19BQ1RJVklURVMgPSAiaHR0cHM6Ly9tamMtY2hhbWJlcnkuZ29hc3NvLm9yZy9h
Y3Rpdml0ZXMiOwpjb25zdCBHT0FTU09fSU5TQ1JJUFRJT05TID0gImh0dHBzOi8vbWpjLWNoYW1i
ZXJ5LmdvYXNzby5vcmcvYWN0dWFsaXRlcy9pbnNjcmlwdGlvbnMtZXQtYWRoZXNpb24iOwpjb25z
dCBHT0FTU09fVFVUT1JJRUwgPSAiaHR0cHM6Ly9tamMtY2hhbWJlcnkuZ29hc3NvLm9yZy9wYWdl
cy90dXRvcmllbC1kLWluc2NyaXB0aW9uIjsKCmNvbnN0IHRleHQgPSAodDogc3RyaW5nKSA9PiAo
eyB0eXBlOiAidGV4dCIsIHRleHQ6IHQgfSk7CmNvbnN0IHAgPSAoLi4uYzogb2JqZWN0W10pID0+
ICh7IHR5cGU6ICJwYXJhZ3JhcGgiLCBjb250ZW50OiBjIH0pOwpjb25zdCBoID0gKHQ6IHN0cmlu
ZykgPT4gKHsgdHlwZTogImhlYWRpbmciLCBhdHRyczogeyBsZXZlbDogMyB9LCBjb250ZW50OiBb
dGV4dCh0KV0gfSk7CmNvbnN0IGJvbGQgPSAodDogc3RyaW5nKSA9PiAoeyB0eXBlOiAidGV4dCIs
IHRleHQ6IHQsIG1hcmtzOiBbeyB0eXBlOiAiYm9sZCIgfV0gfSk7CmNvbnN0IGxpbmsgPSAodDog
c3RyaW5nLCBocmVmOiBzdHJpbmcpID0+ICh7CiAgdHlwZTogInRleHQiLAogIHRleHQ6IHQsCiAg
bWFya3M6IFt7IHR5cGU6ICJsaW5rIiwgYXR0cnM6IHsgaHJlZiwgdGFyZ2V0OiAiX2JsYW5rIiwg
cmVsOiAibm9vcGVuZXIgbm9yZWZlcnJlciBub2ZvbGxvdyIgfSB9XSwKfSk7CmNvbnN0IGludGVy
bmFsID0gKHQ6IHN0cmluZywgaHJlZjogc3RyaW5nKSA9PiAoewogIHR5cGU6ICJ0ZXh0IiwKICB0
ZXh0OiB0LAogIG1hcmtzOiBbeyB0eXBlOiAibGluayIsIGF0dHJzOiB7IGhyZWYsIHRhcmdldDog
bnVsbCwgcmVsOiBudWxsIH0gfV0sCn0pOwoKY29uc3QgRE9DID0gewogIHR5cGU6ICJkb2MiLAog
IGNvbnRlbnQ6IFsKICAgIGgoIjEuIExlcyBjb3VycyBvbnQgbGlldSDDoCBsYSBNSkMiKSwKICAg
IHAodGV4dCgiTGVzIGNvdXJzIGV0IGxlcyBzdGFnZXMgZHUgY2x1YiBzb250IGRlcyBhY3Rpdml0
w6lzIGRlIGxhIE1KQyBkZSBDaGFtYsOpcnksIGRvbm7DqWVzIGRhbnMgc2VzIGxvY2F1eC4iKSks
CiAgICBoKCIyLiBMJ2luc2NyaXB0aW9uIHNlIGZhaXQgYXVwcsOocyBkZSBsYSBNSkMgOiBlbiBs
aWduZSBvdSDDoCBsJ2FjY3VlaWwiKSwKICAgIHAoCiAgICAgIGJvbGQoIkVuIGxpZ25lIiksCiAg
ICAgIHRleHQoIiwgc3VyIGxhIHBsYXRlZm9ybWUgZCdpbnNjcmlwdGlvbiBkZSBsYSBNSkMgOiBj
csOpZXogdm90cmUgY29tcHRlLCBjaG9pc2lzc2V6IHZvdHJlIGNvdXJzIGRhbnMgIiksCiAgICAg
IGxpbmsoImxhIGxpc3RlIGRlcyBhY3Rpdml0w6lzIiwgR09BU1NPX0FDVElWSVRFUyksCiAgICAg
IHRleHQoIiAocnVicmlxdWUgQXJ0cyBtYXJ0aWF1eCksIHB1aXMgcsOpZ2xleiBlbiBsaWduZSB1
bmUgZm9pcyB2b3RyZSBwcsOpLWluc2NyaXB0aW9uIHZhbGlkw6llIHBhciBsYSBNSkMuIExlICIp
LAogICAgICBsaW5rKCJ0dXRvcmllbCBkJ2luc2NyaXB0aW9uIiwgR09BU1NPX1RVVE9SSUVMKSwK
ICAgICAgdGV4dCgiIGTDqXRhaWxsZSBjaGFxdWUgw6l0YXBlLiIpLAogICAgKSwKICAgIHAoCiAg
ICAgIGJvbGQoIsOAIGwnYWNjdWVpbCIpLAogICAgICB0ZXh0KCIgZGUgbGEgTUpDLCBhdXggaGV1
cmVzIGQnb3V2ZXJ0dXJlIGluZGlxdcOpZXMgc3VyICIpLAogICAgICBsaW5rKCJsZSBzaXRlIGRl
IGxhIE1KQyIsIE1KQ19TSVRFKSwKICAgICAgdGV4dCgiLiIpLAogICAgKSwKICAgIHAoCiAgICAg
IHRleHQoIkwnYWRow6lzaW9uIGFubnVlbGxlIMOgIGxhIE1KQyBlc3Qgb2JsaWdhdG9pcmUuIFRh
cmlmcyBldCBjYWxlbmRyaWVyIGRlcyBpbnNjcmlwdGlvbnMgKGNlcnRhaW5lcyBww6lyaW9kZXMg
c29udCByw6lzZXJ2w6llcyDDoCBsJ2FjY3VlaWwpIDogdm9pciAiKSwKICAgICAgbGluaygiSW5z
Y3JpcHRpb25zIGV0IGFkaMOpc2lvbiIsIEdPQVNTT19JTlNDUklQVElPTlMpLAogICAgICB0ZXh0
KCIuIiksCiAgICApLAogICAgaCgiMy4gTGEgbGljZW5jZSBmw6lkw6lyYWxlLCBlbiBkw6lidXQg
ZGUgc2Fpc29uIiksCiAgICBwKHRleHQoIkxlIGNsdWIgZXN0IGFmZmlsacOpIMOgIGxhIEbDqWTD
qXJhdGlvbiBGcmFuw6dhaXNlIGRlIEthcmF0w6kuIEVuIGTDqWJ1dCBkZSBzYWlzb24sIGxlcyBz
aWZ1cyBwcm9wb3NlbnQgbGEgbGljZW5jZSDDoCBjZXV4IHF1aSBsZSBzb3VoYWl0ZW50LiIpKSwK
ICAgIGgoIjQuIFVuZSBxdWVzdGlvbiA/IiksCiAgICBwKHRleHQoIsOJY3JpdmV6LW5vdXMgZGVw
dWlzIGxhIHBhZ2UgIiksIGludGVybmFsKCJOb3VzIGNvbnRhY3RlciIsICIvY29udGFjdHMiKSwg
dGV4dCgiIDogbm91cyB2b3VzIHLDqXBvbmRvbnMuIikpLAogIF0sCn07CgovKiogVGV4dGUgZGUg
ZMOpcGFydCBkZSBsYSB2ZXJzaW9uIHByw6ljw6lkZW50ZSAoc2FucyBsaWVucykgOiByZW1wbGFj
w6kgdGFudCBxdSdpbCBuJ2EgcGFzIMOpdMOpIHJldG91Y2jDqS4gKi8KY29uc3QgRE9DX1YxID0g
ewogIHR5cGU6ICJkb2MiLAogIGNvbnRlbnQ6IFsKICAgIGgoIjEuIExlcyBjb3VycyBvbnQgbGll
dSDDoCBsYSBNSkMiKSwKICAgIHAodGV4dCgiTGVzIGNvdXJzIGV0IGxlcyBzdGFnZXMgZHUgY2x1
YiBzb250IGRlcyBhY3Rpdml0w6lzIGRlIGxhIE1KQyBkZSBDaGFtYsOpcnksIGRvbm7DqWVzIGRh
bnMgc2VzIGxvY2F1eC4iKSksCiAgICBoKCIyLiBMJ2luc2NyaXB0aW9uIHNlIGZhaXQgYXVwcsOo
cyBkZSBsYSBNSkMiKSwKICAgIHAoCiAgICAgIGJvbGQoIkVuIGxpZ25lIiksCiAgICAgIHRleHQo
IiBzdXIgbGEgcGxhdGVmb3JtZSBkZSBsYSBNSkMgKGNyw6lhdGlvbiBkJ3VuIGNvbXB0ZSwgcHLD
qS1pbnNjcmlwdGlvbiDDoCBsJ2FjdGl2aXTDqSwgcHVpcyBwYWllbWVudCBlbiBsaWduZSB1bmUg
Zm9pcyBsYSBkZW1hbmRlIHZhbGlkw6llKSwgb3UgIiksCiAgICAgIGJvbGQoIsOgIGwnYWNjdWVp
bCIpLAogICAgICB0ZXh0KCIgZGUgbGEgTUpDLiIpLAogICAgKSwKICAgIHAoCiAgICAgIHRleHQo
IkwnYWRow6lzaW9uIGFubnVlbGxlIMOgIGxhIE1KQyBlc3Qgb2JsaWdhdG9pcmUuIEhvcmFpcmVz
LCB0YXJpZnMgZXQgY2FsZW5kcmllciBkZXMgaW5zY3JpcHRpb25zIChjZXJ0YWluZXMgcMOpcmlv
ZGVzIHNvbnQgcsOpc2VydsOpZXMgw6AgbCdhY2N1ZWlsKSBzb250IHB1Ymxpw6lzIHBhciBsYSBN
SkMgOiB2b2lyIGxlcyBsaWVucyBjaS1kZXNzb3VzLiIpLAogICAgKSwKICAgIGgoIjMuIExhIGxp
Y2VuY2UgZsOpZMOpcmFsZSwgZW4gZMOpYnV0IGRlIHNhaXNvbiIpLAogICAgcCh0ZXh0KCJMZSBj
bHViIGVzdCBhZmZpbGnDqSDDoCBsYSBGw6lkw6lyYXRpb24gRnJhbsOnYWlzZSBkZSBLYXJhdMOp
LiBFbiBkw6lidXQgZGUgc2Fpc29uLCBsZXMgc2lmdXMgcHJvcG9zZW50IGxhIGxpY2VuY2Ugw6Ag
Y2V1eCBxdWkgbGUgc291aGFpdGVudC4iKSksCiAgICBoKCI0LiBVbmUgcXVlc3Rpb24gPyIpLAog
ICAgcCh0ZXh0KCLDiWNyaXZlei1ub3VzIGRlcHVpcyBsYSBwYWdlIENvbnRhY3RzIDogbm91cyB2
b3VzIHLDqXBvbmRvbnMuIikpLAogIF0sCn07Cgpjb25zdCBjb250ZW50T2YgPSAoZG9jOiBvYmpl
Y3QpID0+CiAgcGFnZUNvbnRlbnRTY2hlbWFWMS5wYXJzZSh7IHZlcnNpb246IDEsIGJsb2Nrczog
W3sgaWQ6ICJpbnNjcmlwdGlvbi10ZXh0ZSIsIHR5cGU6ICJ0aXB0YXAiLCBjb250ZW50OiBkb2Mg
fV0gfSk7CgovKiogU8OpcmlhbGlzYXRpb24gw6AgY2zDqXMgdHJpw6llcyA6IGxlIEpTT05CIGRl
IFBvc3RncmVzIG5lIGNvbnNlcnZlIHBhcyBsJ29yZHJlIGRlcyBjbMOpcy4gKi8KZnVuY3Rpb24g
Y2Fub25pY2FsKHY6IHVua25vd24pOiBzdHJpbmcgewogIGlmIChBcnJheS5pc0FycmF5KHYpKSBy
ZXR1cm4gYFske3YubWFwKGNhbm9uaWNhbCkuam9pbigiLCIpfV1gOwogIGlmICh2ICYmIHR5cGVv
ZiB2ID09PSAib2JqZWN0IikgewogICAgcmV0dXJuIGB7JHtPYmplY3Qua2V5cyh2KQogICAgICAu
c29ydCgpCiAgICAgIC5maWx0ZXIoKGspID0+ICh2IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+
KVtrXSAhPT0gdW5kZWZpbmVkKQogICAgICAubWFwKChrKSA9PiBgJHtKU09OLnN0cmluZ2lmeShr
KX06JHtjYW5vbmljYWwoKHYgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2tdKX1gKQogICAg
ICAuam9pbigiLCIpfX1gOwogIH0KICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7Cn0KCmV4cG9y
dCB0eXBlIEluc2NyaXB0aW9uUGFnZVJlc3VsdCA9ICJjcmVhdGVkIiB8ICJ1cGRhdGVkIiB8ICJ1
bmNoYW5nZWQiOwoKLyoqCiAqIENyw6llIGxhIHBhZ2UgYXZlYyBzb24gdGV4dGUgZGUgZMOpcGFy
dCA7IGxhIHJlbXBsaXQgc2kgZWxsZSBuJ2EgQVVDVU4gYmxvYyA7IGxhIG1ldCDDoCBqb3VyIHNp
CiAqIGVsbGUgY29udGllbnQgZW5jb3JlLCBzYW5zIHJldG91Y2hlLCBsJ2FuY2llbiB0ZXh0ZSBk
ZSBkw6lwYXJ0LgogKi8KZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZUluc2NyaXB0aW9uUGFn
ZShkYjogUHJpc21hQ2xpZW50KTogUHJvbWlzZTxJbnNjcmlwdGlvblBhZ2VSZXN1bHQ+IHsKICBj
b25zdCBleGlzdGluZyA9IGF3YWl0IGRiLnNpdGVQYWdlLmZpbmRVbmlxdWUoeyB3aGVyZTogeyBz
bHVnOiAiaW5zY3JpcHRpb24iIH0sIHNlbGVjdDogeyBjb250ZW50OiB0cnVlIH0gfSk7CiAgY29u
c3QgYmxvY2tzID0gKGV4aXN0aW5nPy5jb250ZW50IGFzIHsgYmxvY2tzPzogdW5rbm93bltdIH0g
fCBudWxsKT8uYmxvY2tzOwogIGNvbnN0IGVtcHR5ID0gIWV4aXN0aW5nIHx8ICFBcnJheS5pc0Fy
cmF5KGJsb2NrcykgfHwgYmxvY2tzLmxlbmd0aCA9PT0gMDsKICBjb25zdCBwcmlzdGluZVYxID0g
IWVtcHR5ICYmIGNhbm9uaWNhbChleGlzdGluZy5jb250ZW50KSA9PT0gY2Fub25pY2FsKGNvbnRl
bnRPZihET0NfVjEpKTsKICBpZiAoIWVtcHR5ICYmICFwcmlzdGluZVYxKSByZXR1cm4gInVuY2hh
bmdlZCI7CiAgY29uc3QganNvbiA9IGNvbnRlbnRPZihET0MpIGFzIHVua25vd24gYXMgUHJpc21h
LklucHV0SnNvblZhbHVlOwogIGF3YWl0IGRiLnNpdGVQYWdlLnVwc2VydCh7CiAgICB3aGVyZTog
eyBzbHVnOiAiaW5zY3JpcHRpb24iIH0sCiAgICBjcmVhdGU6IHsgc2x1ZzogImluc2NyaXB0aW9u
IiwgdGl0bGU6ICJTJ2luc2NyaXJlIiwgY29udGVudDoganNvbiB9LAogICAgdXBkYXRlOiB7IGNv
bnRlbnQ6IGpzb24gfSwKICB9KTsKICByZXR1cm4gZXhpc3RpbmcgPyAidXBkYXRlZCIgOiAiY3Jl
YXRlZCI7Cn0K
B64

python3 - "$PART" "$INSTR" <<'PY'
import sys
part, instr = sys.argv[1], sys.argv[2]
def sub(path, old, new):
    s = open(path, encoding="utf-8").read()
    assert s.count(old) == 1, (path, old[:60], s.count(old))
    open(path, "w", encoding="utf-8").write(s.replace(old, new))

sub(part, '''const DEFAULTS: Array<{ name: string; role: SitePartnerRole; description: string; websiteUrl: string | null }> = [
  {
    name: "MJC de Chambéry",
    role: "HOST",
    description: "Nos cours et stages ont lieu à la MJC ; inscriptions et paiements se font à son accueil.",
    websiteUrl: null,
  },''', '''const MJC_NAME = "MJC de Chambéry";
const MJC_OLD_DESCRIPTION = "Nos cours et stages ont lieu à la MJC ; inscriptions et paiements se font à son accueil.";
const MJC_DESCRIPTION = "Nos cours et stages ont lieu à la MJC ; on s'y inscrit en ligne (plateforme d'inscription de la MJC) ou à son accueil.";
const MJC_WEBSITE = "https://www.mjc-chambery.com";
const MJC_LINKS: PartnerLink[] = [
  { label: "S'inscrire en ligne : activités de la MJC", url: "https://mjc-chambery.goasso.org/activites" },
  { label: "Inscriptions et adhésion : tarifs et calendrier", url: "https://mjc-chambery.goasso.org/actualites/inscriptions-et-adhesion" },
  { label: "Tutoriel d'inscription en ligne", url: "https://mjc-chambery.goasso.org/pages/tutoriel-d-inscription" },
];

const DEFAULTS: Array<{ name: string; role: SitePartnerRole; description: string; websiteUrl: string | null; links: PartnerLink[] }> = [
  {
    name: MJC_NAME,
    role: "HOST",
    description: MJC_DESCRIPTION,
    websiteUrl: MJC_WEBSITE,
    links: MJC_LINKS,
  },''')
sub(part, '''    websiteUrl: "https://www.ffkarate.fr/",
  },
];''', '''    websiteUrl: "https://www.ffkarate.fr/",
    links: [],
  },
];''')
sub(part, '''export async function ensureDefaultPartners(db: PrismaClient): Promise<number> {
  if ((await db.sitePartner.count()) > 0) return 0;
  await db.sitePartner.createMany({ data: DEFAULTS.map((d, position) => ({ ...d, position })) });
  return DEFAULTS.length;
}''', '''export async function ensureDefaultPartners(db: PrismaClient): Promise<number> {
  if ((await db.sitePartner.count()) > 0) return completeMjcPartner(db);
  await db.sitePartner.createMany({ data: DEFAULTS.map((d, position) => ({ ...d, position })) });
  return DEFAULTS.length;
}

/**
 * Partenaire MJC créé par une version précédente (sans site ni liens) : complète UNIQUEMENT les
 * champs restés vides ou d'origine — rien de ce qu'un administrateur a saisi n'est remplacé.
 * Renvoie 1 si la fiche a été complétée, 0 sinon.
 */
async function completeMjcPartner(db: PrismaClient): Promise<number> {
  const mjc = await db.sitePartner.findFirst({
    where: { name: MJC_NAME, role: "HOST" },
    select: { id: true, websiteUrl: true, links: true, description: true },
  });
  if (!mjc) return 0;
  const data: { websiteUrl?: string; links?: PartnerLink[]; description?: string } = {};
  if (!mjc.websiteUrl) data.websiteUrl = MJC_WEBSITE;
  if (parseLinks(mjc.links).length === 0) data.links = MJC_LINKS;
  if (mjc.description === MJC_OLD_DESCRIPTION) data.description = MJC_DESCRIPTION;
  if (Object.keys(data).length === 0) return 0;
  await db.sitePartner.update({ where: { id: mjc.id }, data });
  return 1;
}''')
sub(instr, '''if (created) console.log(`[instrumentation] ensureDefaultPartners: ${created} partenaire(s) créé(s) (MJC, FFK)`);''',
    '''if (created) console.log(`[instrumentation] ensureDefaultPartners: ${created} partenaire(s) créé(s) ou complété(s) (MJC, FFK)`);''')
sub(instr, '''if (await ensureInscriptionPage(prisma)) console.log("[instrumentation] page « S'inscrire » créée avec son texte de départ (brouillon)");''',
    '''const inscription = await ensureInscriptionPage(prisma);
    if (inscription !== "unchanged") console.log(`[instrumentation] page « S'inscrire » : texte de départ ${inscription === "created" ? "créé (brouillon)" : "mis à jour (liens d'inscription en ligne)"}`);''')
print("édits ok")
PY

[ "${AKFC_APPLY_ONLY:-0}" = "1" ] && { echo "Appliqué (sans check ni commit)."; exit 0; }
pnpm check >/tmp/akfc-check.log 2>&1 || { tail -20 /tmp/akfc-check.log; echo "pnpm check KO : pas de commit."; exit 1; }
git add "$SVC" "$PART" "$INSTR"
git commit -qm "S'inscrire : inscription en ligne GOasso mise en avant, partenaire MJC complété (site + liens)" \
  -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
echo "Commit fait. Rebuild + redémarrage : la page et la fiche MJC se mettent à jour au démarrage."