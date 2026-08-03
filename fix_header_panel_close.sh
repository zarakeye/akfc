#!/usr/bin/env bash
#
# fix_header_panel_close.sh
#
# « Calling setState synchronously within an effect » — ma faute, et la règle
# a raison.
#
# ─── Pourquoi c'était mauvais ──────────────────────────────────────────────
#
# Je fermais le panneau par un effet réagissant au changement de `pathname`.
# Un effet sert à synchroniser React avec un système EXTÉRIEUR ; y appeler
# `setState` fait repartir un rendu par-dessus celui qui vient de finir. Ici,
# à chaque navigation, la page se rendait une fois avec le panneau encore
# ouvert, puis une seconde fois pour le refermer.
#
# Et surtout, l'effet répondait à la mauvaise question. Ce n'est pas « l'URL a
# changé, donc il faut fermer » — c'est « l'utilisateur a touché un lien,
# donc il a fini avec le menu ». L'événement était disponible ; je suis passé
# par son symptôme.
#
# ─── Le correctif ──────────────────────────────────────────────────────────
#
# Une seule écoute d'appui sur le conteneur du panneau, qui ferme lorsque
# l'élément touché se trouve dans un lien.
#
# Ce choix — la délégation d'événement — plutôt qu'un `onClick` sur chacun
# des liens, pour deux raisons :
#
#   - « Nos activités » est un composant à part, dont les liens sont
#     construits depuis la base. Sans délégation, il faudrait lui passer un
#     rappel de fermeture, et à tout composant de menu qu'on ajoutera ensuite.
#   - Le test porte sur les LIENS seuls : les boutons qui déroulent les
#     sous-menus ne ferment pas le panneau, ce qui est exactement le
#     comportement voulu. Un `onClick` global fermerait sur le moindre appui.
#
# La navigation continue normalement : on ne bloque rien, on observe.
#
# ─── Le même piège ailleurs ────────────────────────────────────────────────
#
# `useResolvedMediaList`, écrit pour les aperçus de blocs, appelle lui aussi
# `setStatus` dans le corps de son effet. Il n'a pas déclenché l'alerte
# jusqu'ici, mais le motif est le même. Je préfère le traiter séparément,
# quand tu le verras apparaître : le corriger à l'aveugle demanderait de
# restructurer une résolution asynchrone qui fonctionne.
#
# Usage :
#   bash fix_header_panel_close.sh
#   AKFC_APPLY_ONLY=1 bash fix_header_panel_close.sh
#
set -euo pipefail

header_file="apps/web/src/features/app-shell/Header.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "closest" "$header_file" 2>/dev/null; then
  echo "✓ déjà appliqué (fermeture par délégation) — rien à faire"
  exit 0
fi

[ -f "$header_file" ] || { echo "✗ introuvable : $header_file"; exit 1; }

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:160])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

header_file = "apps/web/src/features/app-shell/Header.tsx"

# ── 1/2 l'effet fautif s'en va ────────────────────────────────────────────
edit(header_file, """  // Fermeture au changement de page : sans cela, le panneau resterait ouvert
  // par-dessus la page qu'on vient de demander.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

""", "")

# ── 2/2 la fermeture se déclenche sur l'appui d'un lien ───────────────────
edit(header_file, """          <div className="relative flex h-full flex-col overflow-y-auto bg-black px-6 pb-10">""",
"""          {/* Fermeture sur appui d'un LIEN, par délégation.
              
              Et non par un effet réagissant au changement d'URL : un effet
              sert à synchroniser React avec un système extérieur, et y
              appeler `setState` relance un rendu par-dessus celui qui vient
              de finir. La bonne question n'était d'ailleurs pas « l'URL a
              changé » mais « l'utilisateur a touché un lien, il en a fini
              avec le menu » — et cet événement-là était disponible.
              
              Délégation plutôt qu'un `onClick` par lien : « Nos activités »
              est un composant à part dont les liens viennent de la base, et
              il faudrait lui passer un rappel de fermeture, comme à tout
              menu qu'on ajoutera ensuite. Le test porte sur les liens seuls,
              donc les boutons qui déroulent les sous-menus ne ferment pas le
              panneau — ce qui est le comportement voulu. */}
          <div
            className="relative flex h-full flex-col overflow-y-auto bg-black px-6 pb-10"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >""")
PY

echo "✓ fermeture du panneau sans effet"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "fix(header): fermer le panneau sans passer par un effet

L'effet qui fermait le panneau au changement de pathname declenchait
« Calling setState synchronously within an effect ». La regle a raison :
un effet synchronise React avec un systeme EXTERIEUR, et y appeler
setState relance un rendu par-dessus celui qui vient de finir — a
chaque navigation la page se rendait une fois panneau ouvert, puis une
seconde fois pour le refermer.

L'effet repondait surtout a la mauvaise question. Ce n'est pas « l'URL
a change donc il faut fermer », c'est « l'utilisateur a touche un lien,
il en a fini avec le menu ». L'evenement etait disponible ; je suis
passe par son symptome.

Fermeture par delegation sur le conteneur du panneau, declenchee quand
l'element touche se trouve dans un lien. Plutot qu'un onClick par lien
parce que « Nos activites » est un composant a part dont les liens
viennent de la base : il faudrait lui passer un rappel, comme a tout
menu ajoute ensuite. Le test portant sur les liens seuls, les boutons
de sous-menu ne ferment pas le panneau — comportement voulu."

echo "✓ commité"
git log -1 --oneline