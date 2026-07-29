#!/usr/bin/env bash
#
# step_allowed_blocks.sh
#
# Incrément — le builder peut désormais n'offrir qu'un sous-ensemble de types
# de blocs, et la bio d'instructeur s'en sert pour ne proposer que le bloc
# « texte enrobant une image ».
#
# ─── Liste d'AUTORISATION, pas d'interdiction ──────────────────────────────
#
# Deux écritures étaient possibles, et elles divergent le jour où un septième
# bloc arrive. Une liste de blocs INTERDITS le ferait apparaître partout
# automatiquement, y compris dans la bio d'instructeur. Une liste de blocs
# AUTORISÉS le laisse dehors tant qu'il n'a pas été admis explicitement.
#
# Même principe que la garde d'exhaustivité de `extractMediaIdsFromBlock` :
# par défaut on tombe du côté « pas inclus » plutôt que « inclus en silence ».
#
# La prop est OPTIONNELLE : absente, tous les blocs sont offerts. Aucun appel
# existant (DisciplineForm, Course, Stage, Post…) n'est affecté.
#
# ─── Ce que la restriction ne fait PAS ─────────────────────────────────────
#
# Elle porte sur ce qu'on peut AJOUTER, pas sur ce qui existe. Une page qui
# contient déjà un bloc non autorisé (contenu antérieur, ou liste modifiée
# après coup) continue de l'afficher et de le laisser éditer. Faire
# disparaître du contenu au motif qu'un réglage a changé serait une trahison,
# pas une restriction.
#
# ─── Un seul type autorisé = pas de menu ───────────────────────────────────
#
# Déplier une liste d'un seul élément n'a aucun sens. Quand un seul type est
# autorisé, le bouton l'ajoute directement et porte son nom. C'est exactement
# le cas de la bio d'instructeur.
#
# ─── Pourquoi le float SEUL suffit pour une bio ────────────────────────────
#
# Le bloc float dégénère proprement : sans image, il rend du texte simple à
# la mesure (cf. FloatTextView). Une section purement textuelle est donc un
# bloc float dont on n'a pas choisi d'image — pas besoin d'ouvrir aussi le
# bloc texte. Si l'usage montre le contraire, ajouter "tiptap" à la liste est
# un changement d'un mot.
#
# Usage :
#   bash step_allowed_blocks.sh
#   AKFC_APPLY_ONLY=1 bash step_allowed_blocks.sh
#
set -euo pipefail

MENU="apps/web/src/features/page-builder/components/AddBlockMenu.tsx"
BUILDER="apps/web/src/features/page-builder/PageBuilder.tsx"
BIO="apps/web/src/features/social/InstructorBioEditor.tsx"

[ -f pnpm-workspace.yaml ] || { echo "✗ à lancer à la racine du repo"; exit 1; }

# ── Garde anti-double-application (teste le DERNIER fichier écrit) ─────────
if grep -q "allowedBlocks" "$BIO" 2>/dev/null; then
  echo "✓ déjà appliqué (palette restreinte posée) — rien à faire"
  exit 0
fi

for f in "$MENU" "$BUILDER" "$BIO"; do
  [ -f "$f" ] || { echo "✗ introuvable : $f"; exit 1; }
done

grep -q "float-text" apps/web/src/features/page-builder/blockRegistry.ts || {
  echo "✗ le bloc float doit être posé d'abord"; exit 1; }

# ─────────────────────────────────────────────────────────────────────────
#  1/3 — AddBlockMenu : réécrit en entier (fichier court)
# ─────────────────────────────────────────────────────────────────────────

cat > "$MENU" <<'TSX'
"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { PageBlockKindV1 } from "@contracts/page";

import { ALL_BLOCK_DEFINITIONS } from "../blockRegistry";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface AddBlockMenuProps {
  onAdd: (kind: PageBlockKindV1) => void;
  /**
   * Types de blocs proposés. ABSENT = tous (comportement par défaut de
   * l'application). Présent = exactement ceux-là.
   *
   * C'est une liste d'AUTORISATION et non d'interdiction : un type de bloc
   * ajouté plus tard au registre n'apparaît pas ici tant qu'il n'y a pas été
   * inscrit. L'inverse le ferait surgir dans tous les builders restreints
   * sans que personne l'ait décidé.
   */
  allowedBlocks?: readonly PageBlockKindV1[];
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Bouton « + Ajouter un bloc » qui déplie la liste des types disponibles.
 *
 * Trois régimes selon le nombre de types offerts :
 *   - aucun  → le bouton disparaît (rien à ajouter) ;
 *   - un     → le bouton ajoute directement ce type et porte son nom, sans
 *              déplier une liste d'un seul élément ;
 *   - deux+  → le menu déroulant habituel.
 *
 * L'ordre affiché reste celui d'`ALL_BLOCK_DEFINITIONS` et non celui de la
 * liste reçue : le menu se lit pareil partout dans l'application.
 *
 * Le menu se ferme sur clic extérieur (listener sur `document`). Pour v1 le
 * bloc est toujours ajouté en fin de liste.
 */
export function AddBlockMenu({ onAdd, allowedBlocks }: AddBlockMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Filtrage sans réassignation pendant le rendu (React Compiler strict).
  const definitions =
    allowedBlocks === undefined
      ? ALL_BLOCK_DEFINITIONS
      : ALL_BLOCK_DEFINITIONS.filter((def) =>
          allowedBlocks.includes(def.kind),
        );

  // Les hooks sont appelés au-dessus : les sorties anticipées viennent après,
  // pour que l'ordre des hooks reste stable d'un rendu à l'autre.
  if (definitions.length === 0) return null;

  if (definitions.length === 1) {
    const only = definitions[0];
    return (
      <button
        type="button"
        onClick={() => onAdd(only.kind)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        {only.label}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Ajouter un bloc
      </button>

      {open && (
        <div className="absolute left-1/2 z-10 mt-1 w-56 -translate-x-1/2 rounded-md border border-border bg-popover p-1 shadow-md">
          {definitions.map((def) => (
            <button
              key={def.kind}
              type="button"
              onClick={() => {
                onAdd(def.kind);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-popover-foreground transition-colors hover:bg-muted"
            >
              {def.icon}
              {def.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
TSX
echo "  ~ AddBlockMenu.tsx (réécrit)"

# ─────────────────────────────────────────────────────────────────────────
#  2/3 et 3/3 — substitutions
# ─────────────────────────────────────────────────────────────────────────

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

BUILDER = "apps/web/src/features/page-builder/PageBuilder.tsx"
BIO     = "apps/web/src/features/social/InstructorBioEditor.tsx"

# ── PageBuilder : la prop ─────────────────────────────────────────────────
edit(BUILDER, """  /** Racine de l'arborescence média (valeur d'`APP_ROOT`). */
  appRoot: string;
}""",
"""  /** Racine de l'arborescence média (valeur d'`APP_ROOT`). */
  appRoot: string;
  /**
   * Types de blocs que cet hôte autorise. ABSENT = tous.
   *
   * Liste d'AUTORISATION : un bloc ajouté au registre plus tard n'apparaît
   * pas dans un builder restreint tant qu'il n'y a pas été inscrit.
   *
   * Ne porte que sur l'AJOUT. Un bloc déjà présent dans le contenu reste
   * affiché et éditable même s'il n'est plus autorisé — on ne fait pas
   * disparaître du contenu au motif qu'un réglage a changé.
   */
  allowedBlocks?: readonly PageBlockKindV1[];
}""")

# ── PageBuilder : la destructuration ──────────────────────────────────────
edit(BUILDER, """export function PageBuilder({
  value,
  onChange,
  adapter,
  appRoot,
}: PageBuilderProps) {""",
"""export function PageBuilder({
  value,
  onChange,
  adapter,
  appRoot,
  allowedBlocks,
}: PageBuilderProps) {""")

# ── PageBuilder : la transmission ─────────────────────────────────────────
edit(BUILDER, """        <AddBlockMenu onAdd={handleAdd} />""",
"""        <AddBlockMenu onAdd={handleAdd} allowedBlocks={allowedBlocks} />""")

# ── InstructorBioEditor : la constante de palette ─────────────────────────
# Déclarée au niveau module, hors du JSX : un commentaire y est un `//`
# ordinaire, sans le piège du `{/* */}` en tête d'expression JSX.
edit(BIO, """export function InstructorBioEditor(): JSX.Element | null {""",
"""/**
 * Palette de la bio d'instructeur : le seul bloc « texte enrobant une image ».
 *
 * Un bloc suffit parce qu'il dégénère proprement — sans image choisie, il rend
 * du texte simple à la mesure. Une section purement textuelle est donc ce même
 * bloc sans image, et il n'y a pas lieu d'ouvrir aussi le bloc texte.
 *
 * Si l'usage prouve le contraire, ajouter "tiptap" ici suffit.
 */
const INSTRUCTOR_BIO_BLOCKS = ["float-text"] as const;

export function InstructorBioEditor(): JSX.Element | null {""")

# ── InstructorBioEditor : la transmission ─────────────────────────────────
edit(BIO, """      <PageBuilder
        value={current}
        onChange={setContent}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
      />""",
"""      <PageBuilder
        value={current}
        onChange={setContent}
        adapter={finderStorageAdapter}
        appRoot={APP_ROOT}
        allowedBlocks={INSTRUCTOR_BIO_BLOCKS}
      />""")
PY

echo "✓ palette restreignable posée, bio d'instructeur limitée au bloc float"

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → ni typecheck ni commit."
  exit 0
fi

# ── Typechecks, séparément ─────────────────────────────────────────────────
if ! pnpm --filter backend typecheck; then
  echo "✗ typecheck backend — rien n'est commité"
  exit 1
fi

if ! pnpm typecheck; then
  echo "✗ typecheck web — rien n'est commité"
  exit 1
fi

git add -A
git commit -m "feat(page-builder): palette de blocs restreignable par l'hote

Le PageBuilder accepte une prop optionnelle \`allowedBlocks\`. Absente,
tous les blocs sont offerts — aucun appel existant n'est affecte.

Liste d'AUTORISATION et non d'interdiction : un type ajoute au registre
plus tard reste dehors tant qu'il n'y a pas ete inscrit. Une liste
d'interdiction l'aurait fait surgir dans tous les builders restreints
sans que personne l'ait decide. Meme principe que la garde
d'exhaustivite : par defaut on tombe du cote « pas inclus ».

La restriction porte sur l'AJOUT seulement : un bloc deja present dans
le contenu reste affiche et editable meme s'il n'est plus autorise.

AddBlockMenu gagne trois regimes : aucun type offert -> bouton masque ;
un seul -> ajout direct portant le nom du bloc, sans deplier une liste
d'un element ; deux ou plus -> menu deroulant habituel.

Premier usage : la bio d'instructeur se limite au bloc float, qui
degenere en texte simple quand aucune image n'est choisie."

echo "✓ commité"
git log -1 --oneline