#!/usr/bin/env bash
#
# AKFC — Refonte « pages éditoriales » R5a : brouillon/publier des disciplines.
#
# Aligne les disciplines sur events/stages : champ `publicationDate DateTime?`
# (null = brouillon). Le router create/update l'accepte et le persiste ; le
# DisciplineForm remplace « Enregistrer » par « Enregistrer en brouillon » /
# « Publier ». Les pages create/edit transmettent l'input inchangé.
#
# ⚠️ NE CACHE PAS encore les brouillons au public (page /disciplines,
# /disciplines/[slug], menu « Nos activités » lisent prisma en direct) → R5b.
# ⚠️ MIGRATION → après : `pnpm prisma generate` PUIS `pnpm prisma migrate deploy`
#    (local + serveur). (migrate deploy ne régénère pas le client — generate à part.)
# Le script fait prisma generate avant le typecheck.
# Prérequis : aucun. Front NON testé → valider.
# Usage : bash apply-editorial-5a-disciplines-draft.sh
#         AKFC_APPLY_ONLY=1 bash apply-editorial-5a-disciplines-draft.sh   (clone)
#
set -euo pipefail

SCHEMA="prisma/schema.prisma"
ROUTER="packages/backend/src/modules/disciplines/router.ts"
FORM="apps/web/src/features/admin/disciplines/forms/DisciplineForm.tsx"
MIG_DIR="prisma/migrations/20261022000000_discipline_publication_date"

for f in "package.json" "$SCHEMA" "$ROUTER" "$FORM"; do
  [ -f "$f" ] || { echo "ERREUR: fichier attendu manquant: $f." >&2; exit 1; }
done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERREUR: tu es sur '$BRANCH'. Le chantier va sur sa branche." >&2
    echo "  git switch feat/groupes-collaboratifs" >&2
    exit 1
  fi
fi

# ── schéma : champ publicationDate sur Discipline ───────────────────────────
python3 - "$SCHEMA" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "publicationDate" in s and "model Discipline" in s and s.split("model Discipline",1)[1].split("}",1)[0].count("publicationDate"):
    print("champ déjà présent"); sys.exit(0)
anchor = "  slug         String?    @unique        // nullable le temps du backfill\n"
assert s.count(anchor) == 1, "ancre slug Discipline introuvable"
add = (anchor +
    "\n"
    "  /// Date de publication éditoriale. **null = brouillon** (non visible\n"
    "  /// publiquement). Cohérent avec Event/Stage.\n"
    "  publicationDate DateTime?\n")
s = s.replace(anchor, add)
p.write_text(s, encoding="utf-8")
print("schéma patché (Discipline.publicationDate)")
PY

# ── migration ───────────────────────────────────────────────────────────────
if [ ! -d "$MIG_DIR" ]; then
  mkdir -p "$MIG_DIR"
  cat > "$MIG_DIR/migration.sql" <<'SQL'
-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN "publicationDate" TIMESTAMP(3);
SQL
  echo "migration écrite : $MIG_DIR/migration.sql"
else
  echo "migration déjà présente"
fi

# ── router : inputs + persistance ───────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "publicationDate" in s:
    print("router déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

PUB = "  publicationDate: z.coerce.date().nullable().optional(),\n"

# createInput : après instructorId (fin du create input)
s = sub(
    "  categoryId: z.number().int().positive(),\n"
    "  instructorId: z.string().trim().min(1),\n"
    "});",
    "  categoryId: z.number().int().positive(),\n"
    "  instructorId: z.string().trim().min(1),\n"
    + PUB +
    "});",
    "createInput publicationDate")

# updateInput : après instructorId.optional()
s = sub(
    "  instructorId: z.string().trim().min(1).optional(),\n"
    "  // Note : `categoryId` volontairement absent — non modifiable.\n"
    "});",
    "  instructorId: z.string().trim().min(1).optional(),\n"
    + PUB +
    "  // Note : `categoryId` volontairement absent — non modifiable.\n"
    "});",
    "updateInput publicationDate")

# create data : après instructorId: input.instructorId,
s = sub(
    "              instructorId: input.instructorId,\n",
    "              instructorId: input.instructorId,\n"
    "              publicationDate: input.publicationDate ?? null,\n",
    "create data publicationDate")

# update data : avant la fermeture du data (après summaryMediaId: rest.summaryMediaId,)
s = sub(
    "            summaryMediaId: rest.summaryMediaId,\n"
    "          };",
    "            summaryMediaId: rest.summaryMediaId,\n"
    "            publicationDate: rest.publicationDate,\n"
    "          };",
    "update data publicationDate")

p.write_text(s, encoding="utf-8")
print("router patché (publicationDate create/update)")
PY

# ── DisciplineForm : champ + boutons brouillon/publier ──────────────────────
python3 - "$FORM" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "publicationDate" in s:
    print("form déjà à jour"); sys.exit(0)

def sub(old, new, label):
    assert s.count(old) == 1, f"ancre introuvable/multiple: {label}"
    return s.replace(old, new)

# champ dans DisciplineFormInput
s = sub(
    "export interface DisciplineFormInput {\n",
    "export interface DisciplineFormInput {\n"
    "  /** null = brouillon ; une date = publié. */\n"
    "  publicationDate: Date | null;\n",
    "DisciplineFormInput.publicationDate")

# handleSubmit prend un flag publish
s = sub(
    "  const handleSubmit = async () => {",
    "  const handleSubmit = async (publish: boolean) => {",
    "handleSubmit(publish)")

# ajout publicationDate dans l'objet onSubmit
s = sub(
    "      await onSubmit({\n"
    "        name: name.trim(),",
    "      await onSubmit({\n"
    "        publicationDate: publish\n"
    "          ? (initial?.publicationDate ?? new Date())\n"
    "          : null,\n"
    "        name: name.trim(),",
    "onSubmit publicationDate")

# remplacer le bouton unique par deux boutons
s = sub(
    "      <div className=\"flex justify-end\">\n"
    "        <button\n"
    "          type=\"button\"\n"
    "          onClick={handleSubmit}\n"
    "          disabled={isSubmitting}\n"
    "          className=\"rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50\"\n"
    "        >\n"
    "          {isSubmitting ? \"Enregistrement…\" : submitLabel}\n"
    "        </button>\n"
    "      </div>",
    "      <div className=\"flex justify-end gap-2\">\n"
    "        <button\n"
    "          type=\"button\"\n"
    "          onClick={() => handleSubmit(false)}\n"
    "          disabled={isSubmitting}\n"
    "          className=\"rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 disabled:opacity-50\"\n"
    "        >\n"
    "          {isSubmitting ? \"Enregistrement…\" : \"Enregistrer en brouillon\"}\n"
    "        </button>\n"
    "        <button\n"
    "          type=\"button\"\n"
    "          onClick={() => handleSubmit(true)}\n"
    "          disabled={isSubmitting}\n"
    "          className=\"rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50\"\n"
    "        >\n"
    "          {isSubmitting ? \"Enregistrement…\" : \"Publier\"}\n"
    "        </button>\n"
    "      </div>",
    "boutons brouillon/publier")

p.write_text(s, encoding="utf-8")
print("form patché (brouillon/publier)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"
  exit 0
fi

echo "prisma generate…"
pnpm prisma generate > /tmp/akfc_gen.log 2>&1 || { echo "❌ prisma generate a échoué :"; tail -5 /tmp/akfc_gen.log; echo "(si corepack : corepack cache clean ; puis relance)"; exit 1; }

echo "typecheck (backend + web, direct)…"
if ! { pnpm --filter backend typecheck && pnpm --filter web typecheck; } > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
git add -A
if git commit -m "feat(disciplines): brouillon/publier (publicationDate) au save" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
  echo "⚠️  MIGRATION : 'pnpm prisma migrate deploy' (local + serveur)."
  echo "⚠️  R5b à suivre : les brouillons de disciplines sont encore visibles publiquement (à filtrer)."
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi