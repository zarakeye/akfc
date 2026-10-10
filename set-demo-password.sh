#!/usr/bin/env bash
# AKFC — Définit le mot de passe d'un compte de démonstration (@akfc.demo) en production.
# À lancer sur le MAC (le hachage se fait ici, le mot de passe ne quitte jamais ta machine).
#   bash set-demo-password.sh bureau@akfc.demo
# Le compte doit exister (création depuis le Centre de contrôle : aucun e-mail n'est envoyé aux
# adresses @akfc.demo). Effets : nouveau mot de passe (bcrypt, coût 12, comme le site), pas de
# changement forcé à la connexion, sessions ouvertes du compte fermées.
# Refuse toute adresse qui n'est pas en @akfc.demo.
set -euo pipefail
EMAIL="${1:-}"; HOST="${SRV_ALIAS:-hetzner}"; DB="${AKFC_DB:-akfc_db}"
[[ "$EMAIL" =~ ^[a-z0-9._-]+@akfc\.demo$ ]] || { echo "Usage : bash set-demo-password.sh <compte>@akfc.demo (adresses @akfc.demo uniquement)" >&2; exit 1; }
command -v node >/dev/null || { echo "ERREUR: Node.js est nécessaire sur ce Mac." >&2; exit 1; }

PSQL(){ ssh "$HOST" "docker exec -i postgres psql -U postgres -d $DB -v ON_ERROR_STOP=1 -qtA"; }
N=$(printf "select count(*) from \"User\" where email = '%s';\n" "$EMAIL" | PSQL)
[ "$N" = "1" ] || { echo "ERREUR: $EMAIL n'existe pas en production : crée-le d'abord depuis le Centre de contrôle (Utilisateurs, Créer)." >&2; exit 1; }

IFS= read -rs -p "Nouveau mot de passe de $EMAIL (saisie masquée) : " a; echo
IFS= read -rs -p "Confirme-le : " b; echo
[ "$a" = "$b" ] || { echo "ERREUR: les deux saisies diffèrent : rien n'a été modifié." >&2; exit 1; }
[ "${#a}" -ge 12 ] || { echo "ERREUR: 12 caractères minimum (règle du site) : rien n'a été modifié." >&2; exit 1; }

W=$(mktemp -d); trap 'rm -rf "$W"' EXIT
(cd "$W" && npm init -y >/dev/null 2>&1 && npm i bcryptjs@3 --silent >/dev/null 2>&1) || { echo "ERREUR: installation de bcryptjs impossible." >&2; exit 1; }
HASH=$(cd "$W" && PW="$a" node -e 'process.stdout.write(require("bcryptjs").hashSync(process.env.PW, 12))')
unset a b
[[ "$HASH" =~ ^\$2[aby]\$12\$[./A-Za-z0-9]{53}$ ]] || { echo "ERREUR: empreinte inattendue : rien n'a été modifié." >&2; exit 1; }

printf "begin;
update \"User\" set password = '%s', \"isFirstLogin\" = false, \"emailVerified\" = true, \"updatedAt\" = now() where email = '%s';
delete from \"Session\" where \"userId\" = (select id from \"User\" where email = '%s');
commit;
select 'ok ' || email || ' | prêt pour la connexion' from \"User\" where email = '%s' and password like '\$2%%';\n" "$HASH" "$EMAIL" "$EMAIL" "$EMAIL" | PSQL
echo "✅ Mot de passe défini. Range-le dans Bitwarden (« AKFC – $EMAIL »)."