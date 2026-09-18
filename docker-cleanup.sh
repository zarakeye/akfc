#!/usr/bin/env bash
# Nettoyage Docker SÛR — images inutilisées + cache de build uniquement.
# NE TOUCHE JAMAIS AUX VOLUMES (bases de données, certifs Traefik, etc.).
# À lancer sur le serveur avant un gros build si le disque se remplit.
set -euo pipefail
echo "== avant =="; df -h / | tail -1; docker system df
echo
echo "== purge du cache de build =="
docker builder prune -af
echo "== purge des images inutilisées (conteneurs actifs préservés) =="
docker image prune -af
# Volontairement : PAS de 'docker volume prune', PAS de '--volumes'.
echo
echo "== après =="; df -h / | tail -1; docker system df