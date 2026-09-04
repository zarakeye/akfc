#!/usr/bin/env bash
#
# AKFC — Chantier B, B3 : schéma + type + submit de l'uploader admin (logique, sans UI).
#
#   - formSchema : retire `new-discipline`, ajoute `stage` { stageId }.
#   - type local Destination : retire new-discipline, ajoute stage,
#     `common_repository.folder?` → `containerName?` (aligné sur le contract).
#   - submit : retire la branche new-discipline, ajoute la branche stage,
#     corrige common_repository (`folder` → `containerName`, le nom de conteneur
#     était perdu jusqu'ici).
#
# L'UI (radios → cascade) = B4, ensuite. Ici on ne touche qu'à la logique typée.
# Front seul. typecheck web (attendu : l'UI référence encore new-discipline →
# des erreurs guideront B4 ; si le typecheck casse UNIQUEMENT sur l'UI
# new-discipline, c'est normal et B4 les résout).
#
# Usage : bash apply-B3-admin-schema-submit.sh
#         AKFC_APPLY_ONLY=1 bash apply-B3-admin-schema-submit.sh   (clone)
#
set -euo pipefail

F="apps/web/src/features/admin/library/forms/DragNDropForm.tsx"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
[ -f "$F" ]           || { echo "ERREUR: $F introuvable." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# ── 1. formSchema : retirer new-discipline, ajouter stage ────────────────────
new_disc_schema = (
    "  z.object({\n"
    "    destinationKind: z.literal('new-discipline'),\n"
    "    categoryId: z\n"
    "      .number({ message: 'Choisis une catégorie' })\n"
    "      .int()\n"
    "      .positive({ message: 'Choisis une catégorie' }),\n"
    "    proposedDisciplineName: z\n"
    "      .string()\n"
    "      .trim()\n"
    "      .min(1, { message: 'Nom requis' })\n"
    "      .max(120, { message: 'Maximum 120 caractères' })\n"
    "      .refine((v) => /[a-zA-Z0-9]/.test(v), {\n"
    "        message: 'Le nom doit contenir au moins une lettre ou un chiffre',\n"
    "      }),\n"
    "  }),\n"
)
assert new_disc_schema in s, "ancre schéma new-discipline introuvable"
stage_schema = (
    "  z.object({\n"
    "    destinationKind: z.literal('stage'),\n"
    "    stageId: z\n"
    "      .number({ message: 'Sélectionne un stage.' })\n"
    "      .int()\n"
    "      .positive('Sélectionne un stage.'),\n"
    "  }),\n"
)
s = s.replace(new_disc_schema, stage_schema)

# ── 2. type Destination : retirer new-discipline, ajouter stage, folder→containerName ──
type_new_disc = (
    "  | {\n"
    "      kind: 'new-discipline';\n"
    "      categoryId: number;\n"
    "      proposedDisciplineName: string;\n"
    "    }\n"
)
assert type_new_disc in s, "ancre type new-discipline introuvable"
type_stage = (
    "  | {\n"
    "      kind: 'stage';\n"
    "      stageId: number;\n"
    "    }\n"
)
s = s.replace(type_new_disc, type_stage)

type_common = (
    "  | {\n"
    "      kind: 'common_repository';\n"
    "      folder?: string;\n"
    "    }\n"
)
assert type_common in s, "ancre type common_repository (folder?) introuvable"
s = s.replace(
    type_common,
    "  | {\n"
    "      kind: 'common_repository';\n"
    "      containerName?: string;\n"
    "    }\n",
)

# ── 3. submit : retirer branche new-discipline, ajouter stage, corriger common_repository ──
submit_new_disc = (
    "    } else if (values.destinationKind === 'new-discipline') {\n"
    "      destination = {\n"
    "        kind: 'new-discipline',\n"
    "        categoryId: values.categoryId,\n"
    "        proposedDisciplineName: values.proposedDisciplineName.trim(),\n"
    "      };\n"
)
assert submit_new_disc in s, "ancre submit new-discipline introuvable"
submit_stage = (
    "    } else if (values.destinationKind === 'stage') {\n"
    "      destination = {\n"
    "        kind: 'stage',\n"
    "        stageId: values.stageId,\n"
    "      };\n"
)
s = s.replace(submit_new_disc, submit_stage)

submit_common = (
    "    } else {\n"
    "      const folder = values.containerName?.trim();\n"
    "      destination = { kind: 'common_repository', folder: folder ? folder : undefined };\n"
    "    }\n"
)
assert submit_common in s, "ancre submit common_repository introuvable"
s = s.replace(
    submit_common,
    "    } else {\n"
    "      const containerName = values.containerName?.trim();\n"
    "      destination = {\n"
    "        kind: 'common_repository',\n"
    "        containerName: containerName ? containerName : undefined,\n"
    "      };\n"
    "    }\n",
)

p.write_text(s, encoding="utf-8")
print("✓ B3 : schéma + type + submit — stage ajouté, new-discipline retiré, containerName corrigé")

# rapport : où l'UI référence encore new-discipline (à traiter en B4)
import re
resid = [f"{i}:{ln.strip()}" for i, ln in enumerate(s.splitlines(),1)
         if "new-discipline" in ln or "proposedDisciplineName" in ln]
if resid:
    print("\n— résidus new-discipline / proposedDisciplineName (UI → B4) :")
    for r in resid: print("   ", r)
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web… (des erreurs UI new-discipline sont ATTENDUES → B4)"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "--- erreurs (les new-discipline/proposedDisciplineName sont pour B4) ---"
  grep -nE "error TS|new-discipline|proposedDisciplineName|stageId|containerName" /tmp/akfc_tc.log | head -30
  echo "(NORMAL si ça ne casse QUE sur l'UI new-discipline — B4 les résout. Sinon, colle-moi.)"
  exit 0
fi
echo "OK — typecheck vert (l'UI ne référençait pas new-discipline, ou déjà nettoyée)"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
echo "(pas de commit auto : on committe B3+B4 ensemble une fois l'UI faite)"