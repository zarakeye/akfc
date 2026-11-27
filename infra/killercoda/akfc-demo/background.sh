#!/bin/bash
# Lancé par Killercoda à l'ouverture du scénario, sans être affiché. Trace : /tmp/akfc-setup.log
exec >/tmp/akfc-setup.log 2>&1
# La fin de la session : une heure après l'ouverture du scénario (offre gratuite de Killercoda).
ENDS_AT=$(( $(date +%s) + 3600 ))
cat > /tmp/akfc-wait.sh <<'WAIT'
#!/bin/bash
printf 'Préparation de la démo AKFC : téléchargement, base de données, photos… (2 à 5 minutes)\n'
while [ ! -f /tmp/akfc-ready ] && [ ! -f /tmp/akfc-failed ]; do printf '.'; sleep 5; done
echo
if [ -f /tmp/akfc-ready ]; then
  echo "✅ La démo est prête : passez à l'étape suivante."
else
  echo "❌ Le démarrage a échoué. Détails : tail -30 /tmp/akfc-setup.log"
fi
WAIT
chmod +x /tmp/akfc-wait.sh
set -x
OWNER="zarakeye"
REPO="akfc"
IMAGES="ghcr.io/zarakeye/akfc"
PACK_URL="https://github.com/zarakeye/akfc/releases/download/demo-pack-1/demo-pack.tar.gz"

# L'image ubuntu de Killercoda a docker, mais pas son plugin compose : on l'installe.
if ! docker compose version >/dev/null 2>&1; then
  mkdir -p /usr/local/lib/docker/cli-plugins
  curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
docker compose version

mkdir -p /root/akfc && cd /root/akfc
# Le dépôt public, pour ses fichiers compose (les images, elles, sont déjà construites sur GHCR).
curl -fsSL "https://codeload.github.com/$OWNER/$REPO/tar.gz/refs/heads/main" | tar -xz --strip-components=1
mkdir -p demo-data

# Les adresses vues par le navigateur du visiteur : celles du proxy de Killercoda.
export AKFC_BIND=0.0.0.0
export AKFC_SITE_URL=$(sed 's/PORT/3010/g' /etc/killercoda/host)
export AKFC_STORAGE_URL=$(sed 's/PORT/9000/g' /etc/killercoda/host)
export AKFC_DEMO_PACK_URL="$PACK_URL"
export AKFC_IMAGES="$IMAGES"
export AKFC_DEMO_ENDS_AT="$ENDS_AT"
export AKFC_MAIL_URL=$(sed 's/PORT/8025/g' /etc/killercoda/host)

docker compose -f docker-compose.sandbox.yml -f docker-compose.sandbox.images.yml up -d

# Prêt quand le site répond (premier démarrage : téléchargement des images, migrations, seed).
for _ in $(seq 1 120); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3010/ || true)
  case "$code" in 200|30*) touch /tmp/akfc-ready; break ;; esac
  sleep 5
done
[ -f /tmp/akfc-ready ] || touch /tmp/akfc-failed
