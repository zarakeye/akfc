#!/usr/bin/env bash
#
# AKFC — Chantier B, B1 : destination d'upload « stage » + ouverture entités aux membres.
#
#   1. contract : + kind `stage` { stageId } dans uploadDestinationSchema.
#   2. resolver : branche `stage` → `${appRoot}/stages/${slug}` (calquée sur event ;
#      MediaAsset n'a pas de stageId → rattachement par le chemin, comme group).
#   3. garde assertUploadDestinationAllowed : `stage` autorisé pour tout connecté,
#      ET on RELÂCHE la restriction admin d'A2 sur discipline/event (les membres
#      déposent désormais vers les entités ; la LECTURE reste admin via
#      assertCanReadPath). Seul `group` garde assertCanWriteGroupSpace.
#
# Le contenu déposé suit la voie habituelle (status "pending", géré par l'admin).
# Register : aucun changement (un asset `stage` a categoryId/disciplineId/eventId
# à null — rattachement par le chemin).
#
# Backend (contract + resolver + guard). typecheck backend + web.
#
# Usage : bash apply-B1-stage-destination.sh
#         AKFC_APPLY_ONLY=1 bash apply-B1-stage-destination.sh   (clone)
#
set -euo pipefail

CONTRACT="packages/contracts/src/cloudinary/upload.schema.ts"
RESOLVER="packages/backend/src/modules/cloudinary/services/resolvePendingUploadFolder.service.ts"
GUARD="packages/backend/src/modules/storage/assertUploadDestinationAllowed.service.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$CONTRACT" "$RESOLVER" "$GUARD"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "NOTE: tu es sur '$BRANCH'. (Ctrl-C pour annuler.)"; sleep 2
  fi
fi

# ── 1. contract : kind stage ─────────────────────────────────────────────────
python3 - "$CONTRACT" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'z.literal("stage")' in s:
    print("— contract : stage déjà présent"); sys.exit(0)
# insérer la destination stage juste avant la destination group
anchor = (
    "  // Espace d'un groupe collaboratif : dépôt réservé aux éditeurs/admins\n"
)
assert anchor in s, "ancre destination group (contract) introuvable"
stage = (
    "  // `stage` : contenus d'un stage existant (interne ou externe au club).\n"
    "  // Le stage est créé par les admins ; on en choisit un ici. Rattachement\n"
    "  // par le chemin `stages/…` (MediaAsset n'a pas de stageId).\n"
    "  z.object({\n"
    '    kind: z.literal("stage"),\n'
    "    stageId: z.number().int().positive(),\n"
    "  }),\n"
)
s = s.replace(anchor, stage + anchor)
p.write_text(s, encoding="utf-8"); print("✓ contract : kind stage ajouté")
PY

# ── 2. resolver : branche stage (calquée sur event) ─────────────────────────
python3 - "$RESOLVER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if 'destination.kind === "stage"' in s:
    print("— resolver : stage déjà présent"); sys.exit(0)
# ancre : l'ouverture de la branche event (non touchée par le renommage)
anchor = '  /* ── Destination événement ── */\n  if (destination.kind === "event") {\n'
assert anchor in s, "ancre branche event (resolver) introuvable"
stage = (
    "  /* ── Destination stage ── */\n"
    '  if (destination.kind === "stage") {\n'
    "    const stage = await prisma.stage.findUnique({\n"
    "      where: { id: destination.stageId },\n"
    "      select: { id: true, slug: true },\n"
    "    });\n"
    "    if (!stage) {\n"
    "      throw new Error(`Stage not found (id=${destination.stageId})`);\n"
    "    }\n"
    "    // `Stage.slug` est nullable (le temps du backfill) → fallback sur l'id.\n"
    "    const stageSlug = stage.slug ? slug(stage.slug) : `stage-${stage.id}`;\n"
    "    return `${appRoot}/stages/${stageSlug || `stage-${stage.id}`}`;\n"
    "  }\n"
    "\n"
)
s = s.replace(anchor, stage + anchor)
p.write_text(s, encoding="utf-8"); print("✓ resolver : branche stage → stages/{slug}")
PY

# ── 3. garde : stage autorisé + entités ouvertes aux membres ────────────────
python3 - "$GUARD" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if '"stage"' in s and "existing-discipline" not in s.split('case "group":')[-1].split('return;')[0]:
    pass  # (heuristique molle ; on se fie surtout au bloc ci-dessous)

# On remplace tout le switch par une version : group→assertCanWriteGroupSpace,
# tout le reste (entités + common_repository + perso + stage) → tout connecté.
old = (
    "  switch (destination.kind) {\n"
    "    case \"group\":\n"
    "      await assertCanWriteGroupSpace({\n"
    "        prisma,\n"
    "        userId,\n"
    "        groupId: destination.groupId,\n"
    "      });\n"
    "      return;\n"
    "    case \"common_repository\":\n"
    "    case \"perso\":\n"
    "      return;\n"
    "    case \"existing-discipline\":\n"
    "    case \"new-discipline\":\n"
    "    case \"event\":\n"
    "      if (!(await isAdminByGroup(prisma, userId))) {\n"
    "        throw new TRPCError({\n"
    "          code: \"FORBIDDEN\",\n"
    "          message: \"Cette destination est réservée aux administrateurs.\",\n"
    "        });\n"
    "      }\n"
    "      return;\n"
    "  }\n"
)
new = (
    "  // `group` : droit d'écriture sur l'espace. Toutes les autres destinations\n"
    "  // (entités discipline/stage/event, common_repository, perso) sont ouvertes\n"
    "  // à TOUT UTILISATEUR CONNECTÉ pour l'ÉCRITURE : un membre peut déposer, le\n"
    "  // contenu part `pending`, et la LECTURE reste admin (assertCanReadPath).\n"
    "  if (destination.kind === \"group\") {\n"
    "    await assertCanWriteGroupSpace({ prisma, userId, groupId: destination.groupId });\n"
    "  }\n"
)
if old in s:
    s = s.replace(old, new)
    print("✓ garde : entités ouvertes aux membres (seul group gardé)")
else:
    print("!! switch du garde introuvable tel quel — colle-moi le corps de assertUploadDestinationAllowed"); sys.exit(1)

# isAdminByGroup / TRPCError peuvent devenir inutilisés → nettoyage imports si besoin
import re
if "isAdminByGroup(" not in s:
    s = re.sub(r'^import \{ isAdminByGroup \}.*\n', '', s, flags=re.M)
if "TRPCError" not in s.replace("import", "", 1):
    # ne retire que si plus aucune autre occurrence
    if s.count("TRPCError") == 1:
        s = re.sub(r'^import \{ TRPCError \}.*\n', '', s, flags=re.M)
p.write_text(s, encoding="utf-8")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|stage|isAdminByGroup|TRPCError" /tmp/akfc_tc.log | head -20; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|stage" /tmp/akfc_tc.log | head; tail -6 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(B1): destination stage (stages/{slug}) + entités ouvertes aux membres en écriture" \
  && echo "commit $(git rev-parse --short HEAD)"