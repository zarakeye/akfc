#!/usr/bin/env bash
#
# step_discipline_summary_form.sh
#
# Incrément 2/3 — le builder restreint dans le formulaire de discipline.
#
#   1/3  FAIT : le champ `summary`, sa migration, sa plomberie tRPC
#   2/3  ce script : le second builder dans le formulaire
#   3/3  la carte d'accueil, puis le menu « Qui sommes-nous ? »
#
# ─── Deux builders, deux usages ────────────────────────────────────────────
#
# Le formulaire porte désormais deux composites distincts :
#
#   « Description » — builder COMPLET, six types de blocs. C'est la page
#   publique de la discipline, celle qu'on atteint depuis la carte.
#
#   « Présentation synthétique » — builder RESTREINT au seul bloc « texte
#   enrobant une image ». C'est la carte d'accueil : un portrait ou une photo
#   enrobée de quelques lignes, et rien d'autre. La restriction n'est pas une
#   brimade — c'est ce qui garantit que toutes les cartes d'accueil se
#   ressemblent, ce qu'un builder complet rendrait impossible à tenir.
#
# Le mécanisme `allowedBlocks` posé pour la bio d'instructeur s'applique tel
# quel : rien de neuf à écrire côté builder.
#
# ─── L'interrupteur d'apparition ───────────────────────────────────────────
#
# Un résumé vide vaut « cette discipline ne figure pas sur l'accueil ». Le
# libellé du champ le dit explicitement, sinon la règle resterait invisible et
# passerait pour un bug le jour où une discipline manquerait à l'appel.
#
# ─── Une asymétrie entre les deux pages appelantes ─────────────────────────
#
# La page de CRÉATION transmet l'objet entier à la mutation : ajouter un champ
# au type suffit, il passe tout seul. La page d'ÉDITION, elle, énumère les
# champs un par un — le résumé y est donc ajouté explicitement, faute de quoi
# il serait éditable mais jamais enregistré en modification. Un défaut qui
# n'aurait sauté aux yeux qu'à la deuxième sauvegarde.
#
# Usage :
#   bash step_discipline_summary_form.sh
#   AKFC_APPLY_ONLY=1 bash step_discipline_summary_form.sh
#
set -euo pipefail

FORM="apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
EDIT="apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "summary" "$EDIT" 2>/dev/null; then
  echo "✓ déjà appliqué (résumé transmis à l'édition) — rien à faire"
  exit 0
fi

for f in "$FORM" "$EDIT"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "summary Json" prisma/schema.prisma || {
  echo "✗ l'incrément 1/3 (champ summary) doit être appliqué d'abord"; exit 1; }

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

FORM = "apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
EDIT = "apps/web/src/app/(admin)/dashboard/disciplines/[id]/edit/page.tsx"

# ── 1/5 la palette restreinte, au niveau module ───────────────────────────
edit(FORM, """export interface DisciplineFormInput {""",
"""/**
 * Palette du builder de présentation synthétique : le seul bloc « texte
 * enrobant une image ».
 *
 * La restriction est ce qui garantit que toutes les cartes d'accueil se
 * ressemblent. Un builder complet y autoriserait galeries et colonnes, et la
 * page d'accueil deviendrait un patchwork qu'aucune règle de style ne
 * rattraperait.
 *
 * Le bloc dégénère proprement en texte simple quand aucune image n'est
 * choisie, donc une présentation sans photo reste possible.
 */
const SUMMARY_BLOCKS = ["float-text"] as const;

export interface DisciplineFormInput {""")

# ── 2/5 le champ dans le type d'entrée ────────────────────────────────────
edit(FORM, """  description: PageContentV1;
  categoryId: number;
  instructorId: string;
}""",
"""  description: PageContentV1;
  /**
   * Présentation synthétique pour la page d'accueil. Composite VIDE = la
   * discipline ne figure pas sur l'accueil.
   */
  summary: PageContentV1;
  categoryId: number;
  instructorId: string;
}""")

# ── 3/5 l'état ────────────────────────────────────────────────────────────
edit(FORM, """  const [description, setDescription] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.description) : emptyPageContentV1(),
  );""",
"""  const [description, setDescription] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.description) : emptyPageContentV1(),
  );
  const [summary, setSummary] = useState<PageContentV1>(
    initial ? parsePageContentV1(initial.summary) : emptyPageContentV1(),
  );""")

# ── 4/5 le payload ────────────────────────────────────────────────────────
edit(FORM, """        description,
        categoryId,
        instructorId,
      });""",
"""        description,
        summary,
        categoryId,
        instructorId,
      });""")

# ── 5/5 le second builder, sous le premier ────────────────────────────────
edit(FORM, """        <PageBuilder
          value={description}
          onChange={setDescription}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>""",
"""        <PageBuilder
          value={description}
          onChange={setDescription}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
        />
      </fieldset>

      {/* ── Présentation synthétique (builder restreint) ─────────────── */}
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-medium">
          Présentation synthétique (page d&apos;accueil)
        </legend>
        <p className="mb-3 text-xs text-muted-foreground">
          Quelques lignes autour d&apos;une image, affichées en carte sur la
          page d&apos;accueil avec un lien vers la page complète ci-dessus.
          Laissez vide pour que cette discipline ne figure pas sur
          l&apos;accueil.
        </p>
        <PageBuilder
          value={summary}
          onChange={setSummary}
          adapter={finderStorageAdapter}
          appRoot={APP_ROOT}
          allowedBlocks={SUMMARY_BLOCKS}
        />
      </fieldset>""")

# ── Page d'édition : elle énumère les champs, le résumé doit y figurer ────
edit(EDIT, """      instructorId: input.instructorId,
      description: input.description,
    });""",
"""      instructorId: input.instructorId,
      description: input.description,
      // Énumération explicite ici, contrairement à la page de création qui
      // transmet l'objet entier : sans cette ligne le résumé serait éditable
      // mais jamais enregistré en modification.
      summary: input.summary,
    });""")
PY

echo "✓ builder restreint posé dans le formulaire de discipline"

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
git commit -m "feat(disciplines): builder restreint pour la presentation synthetique

Increment 2/3. Le formulaire porte desormais deux composites : la
description (builder complet, page publique de la discipline) et la
presentation synthetique (builder restreint au bloc « texte enrobant
une image », carte d'accueil).

La restriction garantit que toutes les cartes d'accueil se ressemblent.
Un builder complet y autoriserait galeries et colonnes, et l'accueil
deviendrait un patchwork qu'aucune regle de style ne rattraperait. Le
mecanisme allowedBlocks pose pour la bio d'instructeur s'applique tel
quel.

Un resume vide vaut « ne figure pas sur l'accueil ». Le libelle du
champ le dit, sinon la regle resterait invisible et passerait pour un
bug le jour ou une discipline manquerait a l'appel.

La page d'edition enumere ses champs un par un, contrairement a la page
de creation qui transmet l'objet entier : le resume y est ajoute
explicitement, sans quoi il serait editable mais jamais enregistre en
modification."

echo "✓ commité"
git log -1 --oneline