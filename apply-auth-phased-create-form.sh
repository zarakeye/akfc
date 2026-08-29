#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE D : création d'utilisateur par GROUPE.
#
#   1. CreateUserForm.tsx  — select de GROUPE (trpc.memberGroups.list) au lieu de
#                            rôle ; input { email, groupId }.
#   2. create page.tsx     — passe `groupId` à la mutation.
#   3. users.create        — input { email, groupId } ; crée l'utilisateur AVEC
#                            une adhésion (MemberGroupMembership, access EDITOR),
#                            plus de `roleId`.
#
# L'appartenance au groupe Administrateurs confère l'admin (source unique posée
# aux phases A-C). Le server action mort `createUserAction` (référencé nulle part)
# est laissé tel quel — à retirer en Phase E (il lit encore roleId).
#
# 2 fichiers web + 1 backend, typecheck web + backend.
#
# Usage : bash apply-auth-phaseD-create-form.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseD-create-form.sh   (clone)
#
set -euo pipefail

FORM="apps/web/src/features/admin/users/forms/CreateUserForm.tsx"
PAGE="apps/web/src/app/(admin)/dashboard/users/create/page.tsx"
ROUTER="packages/backend/src/modules/users/router.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$FORM" "$PAGE" "$ROUTER"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

# ── 1. Formulaire (réécriture complète) ─────────────────────────────────────
cat > "$FORM" <<'TSX'
"use client";

import { useState } from "react";
import { trpc } from "@trpc/trpcClient";

export interface CreateUserFormInput {
  email: string;
  groupId: string;
}

export interface CreateUserFormProps {
  onSubmit: (input: CreateUserFormInput) => Promise<void>;
  submitLabel?: string;
}

/**
 * Form de création d'utilisateur. On assigne un GROUPE : l'appartenance au groupe
 * Administrateurs confère l'admin (source de vérité unique). Le mot de passe est
 * généré côté serveur et envoyé par email — l'admin ne le saisit jamais.
 */
export function CreateUserForm({
  onSubmit,
  submitLabel = "Créer",
}: CreateUserFormProps) {
  const [email, setEmail] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Liste des groupes pour le sélecteur (procédure admin).
  const { data: groups } = trpc.memberGroups.list.useQuery();

  const handleSubmit = async () => {
    setSubmitError(null);
    if (email.trim() === "") {
      setSubmitError("L'email est obligatoire.");
      return;
    }
    if (groupId === "") {
      setSubmitError("Choisis un groupe.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), groupId });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Groupe</span>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        >
          <option value="">— Choisir —</option>
          {(groups ?? []).map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Création…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
TSX
echo "réécrit  $FORM"

# ── 2. Page : passe groupId ──────────────────────────────────────────────────
python3 - "$PAGE" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "input.groupId" in s:
    print("page : déjà migrée"); sys.exit(0)
old = "      roleId: input.roleId,\n"
assert s.count(old) == 1, "ancre roleId (page) introuvable/multiple"
s = s.replace(old, "      groupId: input.groupId,\n")
p.write_text(s, encoding="utf-8")
print("page : passe groupId")
PY

# ── 3. Mutation users.create ─────────────────────────────────────────────────
python3 - "$ROUTER" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
if "memberGroupMemberships" in s and "input.groupId" in s:
    print("mutation create : déjà migrée"); sys.exit(0)

# input
inp_old = "        roleId: z.number(),\n"
assert s.count(inp_old) == 1, "ancre input roleId introuvable/multiple"
s = s.replace(inp_old, "        groupId: z.string(),\n")

# data : roleId → adhésion
data_old = "          roleId: input.roleId,\n"
assert s.count(data_old) == 1, "ancre data roleId introuvable/multiple"
data_new = (
    "          memberGroupMemberships: {\n"
    "            create: {\n"
    "              group: { connect: { id: input.groupId } },\n"
    '              access: "EDITOR",\n'
    "            },\n"
    "          },\n"
)
s = s.replace(data_old, data_new)
p.write_text(s, encoding="utf-8")
print("mutation create : input groupId + adhésion créée")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "feat(auth): phase D — création d'utilisateur par groupe (adhésion) au lieu de rôle" \
  && echo "commit $(git rev-parse --short HEAD)"