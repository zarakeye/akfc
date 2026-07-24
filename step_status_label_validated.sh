#!/usr/bin/env bash
#
# step_status_label_validated.sh
#
# « Publié » devient « Validé » — dans l'AFFICHAGE seulement.
#
# La valeur `published` reste inchangée en base, dans les contrats, dans les
# routes et dans le code. Renommer l'enum toucherait la migration Prisma, le
# schéma Zod, `statusFromPath`, `enrichStatus.service.ts`, le filtre du
# picker et une quinzaine d'appelants — pour un gain nul : ce qui devait
# changer, c'est ce que l'admin lit, pas ce que la machine manipule.
#
# Le mot compte parce qu'il décrit mal l'acte. Un admin qui valide rend un
# média SÉLECTIONNABLE pour une page ; il ne le met pas en ligne. « Publié »
# laissait croire que le média était déjà visible du public, alors que la
# publication réelle dépend de la page qui le référence. « Validé » nomme le
# geste : ce contenu est bon, il peut servir.
#
# Les phrases sont réécrites, pas seulement le mot — « un média publié » et
# « un média validé » ne se construisent pas pareil, et la notice du picker
# expliquait la règle avec l'ancien vocabulaire.
#
# Usage :
#   bash step_status_label_validated.sh
#   AKFC_APPLY_ONLY=1 bash step_status_label_validated.sh
#
set -euo pipefail

C="apps/web/src/features/finder-core/components"
RADIO="$C/StatusRadioGroup.tsx"
FILTER="$C/StatusFilterBar.tsx"
TREEFILE="$C/FinderTreeFile.tsx"
PICKER="$C/MediaPicker.tsx"
PERSO="apps/web/src/features/admin/perso/PersoPhotoUploader.tsx"

# ── Prérequis ───────────────────────────────────────────────────────────────
[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }
for f in "$RADIO" "$FILTER" "$TREEFILE" "$PICKER" "$PERSO"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ──────────
if grep -q "validée(s)" "$PERSO"; then
  echo "✓ déjà appliqué (marqueur présent dans $PERSO) — rien à faire"
  exit 0
fi

python3 - <<'PY'
import io

def edit(path, old, new):
    with io.open(path, encoding='utf-8') as fh:
        src = fh.read()
    n = src.count(old)
    assert n == 1, "ancre %d fois dans %s :\n%s" % (n, path, old[:120])
    with io.open(path, 'w', encoding='utf-8') as fh:
        fh.write(src.replace(old, new))
    print("  ~ %s" % path.rsplit('/', 1)[-1])

C        = "apps/web/src/features/finder-core/components"
RADIO    = "%s/StatusRadioGroup.tsx" % C
FILTER   = "%s/StatusFilterBar.tsx" % C
TREEFILE = "%s/FinderTreeFile.tsx" % C
PICKER   = "%s/MediaPicker.tsx" % C
PERSO    = "apps/web/src/features/admin/perso/PersoPhotoUploader.tsx"

# ── 1/6 sélecteur de statut ────────────────────────────────────────────────
edit(RADIO, """const STATUS_OPTIONS: { value: LifecycleStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publié' },""",
"""// ⚠️ `value` reste 'published' : c'est la valeur du contrat et de la base.
// Seul le LIBELLÉ change. Un admin valide un média — il le rend utilisable
// dans une page — mais ne le publie pas : la mise en ligne dépend de la page
// qui le référence, et de sa propre date de publication.
const STATUS_OPTIONS: { value: LifecycleStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Validé' },""")

# ── 2/6 barre de filtre : le commentaire de tête ───────────────────────────
edit(FILTER, """ * La lentille de statut : Tous / En attente / Publiés.""",
""" * La lentille de statut : Tous / En attente / Validés.""")

# ── 3/6 barre de filtre : l'option ─────────────────────────────────────────
edit(FILTER, """  { value: 'published', label: 'Publiés' },""",
"""  // `value` inchangé — cf. StatusRadioGroup pour le pourquoi du libellé.
  { value: 'published', label: 'Validés' },""")

# ── 4/6 pastille de l'arbre ────────────────────────────────────────────────
edit(TREEFILE, """        aria-label={isPending ? 'En attente' : 'Publié'}""",
"""        aria-label={isPending ? 'En attente' : 'Validé'}""")

# ── 5/6 notice du picker : la règle se réécrit, pas seulement le mot ───────
edit(PICKER, """      {/* Règle posée d'emblée : seuls les médias publiés sont épinglables. */}
      <div className="px-4 py-2 border-b bg-blue-50 text-xs text-blue-800">
        Cliquez sur un média <strong>publié</strong> pour l&apos;ajouter à la
        sélection. Vous pouvez naviguer entre les dossiers&nbsp;: la sélection
        est conservée. Un média en attente ou à la corbeille reste visible mais
        n&apos;est pas sélectionnable tant qu&apos;il n&apos;est pas publié.
      </div>""",
"""      {/* Règle posée d'emblée : seuls les médias validés sont épinglables. */}
      <div className="px-4 py-2 border-b bg-blue-50 text-xs text-blue-800">
        Cliquez sur un média <strong>validé</strong> pour l&apos;ajouter à la
        sélection. Vous pouvez naviguer entre les dossiers&nbsp;: la sélection
        est conservée. Un média en attente ou à la corbeille reste visible mais
        n&apos;est pas sélectionnable tant qu&apos;il n&apos;est pas validé.
      </div>""")

# ── 6/6 quota des photos perso (DERNIER fichier écrit) ─────────────────────
edit(PERSO, """              {quota.pending} en attente · {quota.published} publiée(s)""",
"""              {quota.pending} en attente · {quota.published} validée(s)""")
PY

echo "✓ 6 substitutions appliquées"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ──────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(finder): le statut publie s'affiche desormais valide

Renommage d'AFFICHAGE seulement : la valeur published reste celle du
contrat, de la base et des routes. Un admin valide un media -- il le
rend selectionnable pour une page -- mais ne le publie pas : la mise
en ligne depend de la page qui le reference.

La notice du picker est reecrite, pas seulement son vocabulaire."

echo "✓ commité"
git log -1 --oneline