#!/usr/bin/env bash
# AKFC — Non-régression de la suppression du middleware mort. LECTURE SEULE (requêtes HTTP anonymes).
# Se lance depuis n'importe où (Mac ou serveur), contre la prod.
#   bash check-nonregression-editorial.sh baseline   ← AVANT le déploiement
#   bash check-nonregression-editorial.sh compare    ← APRÈS le déploiement
# Doivent rester IDENTIQUES : statut HTTP + présence du texte « Page en construction » sur les pages
# éditoriales, et la redirection du proxy sur /dashboard (anonyme → /).
# Changement ATTENDU : /en-construction et /api/page-access passent en 404.
set -uo pipefail
BASE="${AKFC_BASE:-https://akfc.fr}"
STORE="$HOME/.akfc-nonregression-baseline.txt"
MODE="${1:-}"
[ "$MODE" = "baseline" ] || [ "$MODE" = "compare" ] || { echo "Usage : $0 baseline|compare"; exit 1; }

probe(){ # $1 = chemin → "statut|marqueur|redirection"
  local code redir mark
  read -r code redir < <(curl -s -o /tmp/akfc_nr_body -w '%{http_code} %{redirect_url}\n' "$BASE$1")
  mark=$(grep -c 'Page en construction' /tmp/akfc_nr_body 2>/dev/null || true)
  [ "${mark:-0}" -gt 0 ] && mark="construction" || mark="contenu"
  redir="${redir#$BASE}"; echo "$code|$mark|${redir:--}"
}
STABLE=("/" "/about" "/contacts" "/about/instructeurs" "/dashboard")
GONE=("/en-construction" "/api/page-access?path=/about")

if [ "$MODE" = "baseline" ]; then
  : > "$STORE"
  for p in "${STABLE[@]}" "${GONE[@]}"; do r=$(probe "$p"); echo "$p	$r" >> "$STORE"; echo "  $p → $r"; done
  echo "Photo enregistrée ($STORE). Déploie, puis : $0 compare"; exit 0
fi

[ -f "$STORE" ] || { echo "Pas de photo : lance d'abord '$0 baseline' AVANT de déployer."; exit 1; }
ok=1
for p in "${STABLE[@]}"; do
  before=$(awk -F'\t' -v k="$p" '$1==k{print $2}' "$STORE"); after=$(probe "$p")
  if [ "$before" = "$after" ]; then echo "  ✅ $p : identique ($after)"
  else echo "  ❌ $p : AVANT $before  /  APRÈS $after"; ok=0; fi
done
for p in "${GONE[@]}"; do
  after=$(probe "$p"); code="${after%%|*}"
  if [ "$code" = "404" ]; then echo "  ✅ $p : 404 (supprimé, attendu)"
  else echo "  ❌ $p : attendu 404, obtenu $after (build pas à jour ?)"; ok=0; fi
done
[ $ok = 1 ] && echo "RÉSULTAT : AUCUNE RÉGRESSION" || echo "RÉSULTAT : ÉCART — ne pas considérer le nettoyage comme validé"