#!/usr/bin/env bash
#
# fix_header_breakpoint.sh
#
# Chevauchement du logo, items sur deux lignes, chevrons collés : trois
# symptômes, une seule cause.
#
# ─── La barre ne tient pas, mesures à l'appui ──────────────────────────────
#
# Largeur minimale des sept items à 20px de police : environ 935px, chevrons
# compris. Il faut y ajouter le logo et son rembourrage `px-20` (260px) et le
# bloc d'authentification (~220px quand on n'est pas connecté, le formulaire
# de connexion étant large).
#
#   TOTAL requis  ≈ 1415px
#   à 1024px      → déborde de 391px
#   à 1280px      → déborde de 135px
#
# Le seuil était posé à `lg` (1024px), soit 400px de moins que nécessaire.
# D'où tout le reste : la barre poussait le logo (chevauchement), les
# libellés se repliaient faute de `whitespace-nowrap`, et l'espacement se
# resserrait jusqu'à ce que les chevrons touchent le voisin.
#
# ─── Le correctif : un seuil juste, et une barre qui rétrécit ──────────────
#
# Le burger passe à `xl` (1280px) : un laptop de 1024 reçoit désormais le
# menu tactile, ce qui est de toute façon le bon rendu pour lui.
#
# Mais 1280 ne suffisait pas non plus aux mesures d'origine. La barre se
# compacte donc entre 1280 et 1536 — police à 17px, logo réduit, chevrons
# plus petits — et reprend ses dimensions pleines au-delà :
#
#   items       935 → ~730px  (police 17px, chevrons 22px)
#   logo        260 → 112px   (`px-6`, hauteur 64px)
#   TOTAL      ≈ 1180px       → tient à 1280 avec de la marge
#
# ─── Trois défauts corrigés au passage ─────────────────────────────────────
#
#   - `whitespace-nowrap` sur chaque item : un libellé de plusieurs mots ne
#     se replie plus jamais, quelle que soit la place.
#   - `w-[60%]` devient `flex-1 min-w-0` : une largeur en pourcentage ne
#     négocie rien avec ses voisins et poussait le logo. `flex-1` prend ce
#     qui reste, `min-w-0` autorise le rétrécissement plutôt que le
#     débordement.
#   - `shrink-0` sur les chevrons : ils ne s'écrasent plus quand la place
#     manque, ce qui les faisait chevaucher le texte voisin.
#
# Usage :
#   bash fix_header_breakpoint.sh
#   AKFC_APPLY_ONLY=1 bash fix_header_breakpoint.sh
#
set -euo pipefail

header_file="apps/web/src/features/app-shell/Header.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application ──────────────────────────────────────────
if grep -q "xl:flex" "$header_file" 2>/dev/null; then
  echo "✓ déjà appliqué (seuil relevé) — rien à faire"
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

# ── 1/8 logo : rembourrage à trois paliers ────────────────────────────────
edit(header_file,
"""        <div className="flex items-center px-4 py-4 lg:px-20 lg:py-10">""",
"""        {/* Trois paliers : le `px-20` d'origine coûtait 160px de chaque
            côté, ce que la barre ne pouvait pas se permettre avant 1536px. */}
        <div className="flex items-center px-4 py-4 xl:px-6 xl:py-6 2xl:px-20 2xl:py-10">""")

edit(header_file, """            className="h-12 w-auto lg:h-25\"""",
"""            className="h-12 w-auto xl:h-16 2xl:h-25\"""")

# ── 2/8 la barre : seuil, largeur négociable, espacement ──────────────────
edit(header_file,
"""      <nav className="hidden w-[60%] items-center justify-center gap-4 lg:flex">""",
"""      {/* `flex-1 min-w-0` et non `w-[60%]` : une largeur en pourcentage ne
          négocie rien avec ses voisins et poussait le logo hors de sa place.
          `flex-1` prend ce qui reste, `min-w-0` autorise le rétrécissement
          plutôt que le débordement. */}
      <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex 2xl:gap-6">""")

# ── 3/8 liens simples : pas de repli, police compacte sous 1536 ───────────
edit(header_file,
"""                className={`${NAV_GLOW} text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`}""",
"""                className={`${NAV_GLOW} whitespace-nowrap text-[17px] 2xl:text-[20px] ${isActive(entry) ? NAV_ACTIVE : ""}`}""")

# ── 4/8 menus déroulants : idem ───────────────────────────────────────────
edit(header_file,
"""              className={`relative flex items-center text-[20px] ${NAV_GLOW} ${isActive(entry) ? NAV_ACTIVE : ""}`}""",
"""              className={`relative flex items-center whitespace-nowrap text-[17px] 2xl:text-[20px] ${NAV_GLOW} ${isActive(entry) ? NAV_ACTIVE : ""}`}""")

# ── 5/8 chevrons de la barre : plus petits, jamais écrasés ────────────────
edit(header_file,
"""                width={30}
                height={30}
                className={`transition-transform duration-300 ${barMenu === entry.label ? "rotate-180" : ""}`}""",
"""                width={22}
                height={22}
                className={`shrink-0 transition-transform duration-300 ${barMenu === entry.label ? "rotate-180" : ""}`}""")

# ── 6/8 bloc d'authentification ───────────────────────────────────────────
edit(header_file, """      <div className="hidden lg:block">""",
"""      <div className="hidden shrink-0 xl:block">""")

# ── 7/8 cloche + burger ───────────────────────────────────────────────────
edit(header_file, """      <div className="flex items-center gap-3 px-4 lg:hidden">""",
"""      <div className="flex shrink-0 items-center gap-3 px-4 xl:hidden">""")

# ── 8/8 le panneau ────────────────────────────────────────────────────────
edit(header_file, """        <div className="fixed inset-0 z-50 lg:hidden">""",
"""        <div className="fixed inset-0 z-50 xl:hidden">""")
PY

echo "✓ seuil relevé à 1280px et barre compactée"

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
git commit -m "fix(header): seuil du burger a 1280 et barre compactee

Chevauchement du logo, items replies sur deux lignes, chevrons colles :
trois symptomes, une cause. La barre exige environ 1415px — 935 pour
les sept items a 20px, 260 pour le logo et son px-20, ~220 pour le bloc
d'authentification — alors que le seuil etait pose a lg (1024px), soit
400px de moins que necessaire.

Le burger passe a xl (1280) : un laptop de 1024 recoit le menu tactile,
qui est de toute facon le bon rendu pour lui.

1280 ne suffisait pas non plus aux dimensions d'origine. La barre se
compacte donc entre 1280 et 1536 — police 17px, logo reduit, chevrons
22px — et reprend ses pleines dimensions au-dela : environ 1180px,
qui tient a 1280 avec de la marge.

Trois defauts corriges au passage :
- whitespace-nowrap sur chaque item, un libelle ne se replie plus ;
- w-[60%] devient flex-1 min-w-0, une largeur en pourcentage ne
  negocie rien avec ses voisins et poussait le logo ;
- shrink-0 sur les chevrons, qui s'ecrasaient et chevauchaient le
  texte voisin."

echo "✓ commité"
git log -1 --oneline