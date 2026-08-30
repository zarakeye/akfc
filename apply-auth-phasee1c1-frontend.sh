#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE E1c-1 (frontend) : suppression du rôle côté UI.
#
#   Suppressions (features cloisonnées) :
#     - app/(admin)/dashboard/roles/  + /permissions/
#     - features/admin/roles/         + /permissions/
#     - features/admin/users/components/UpdateUserRoleById.tsx
#     - features/admin/users/actions/createUserForm.action.ts   (mort)
#   Éditions :
#     - users/[id]/edit/page.tsx  → réécrite : suppression conservée, rôle retiré,
#                                   renvoi vers la gestion des groupes.
#     - users/[id]/page.tsx       → retire l'include + l'affichage rôle/permissions.
#     - UsersTable / UserCard     → retire la colonne / la ligne rôle.
#     - ControlPanelSidebar       → retire les items Rôles + Permissions.
#
# Frontend pur (le backend garde encore role/routers, inutilisés → E1c-2). Les
# schémas contracts, partagés avec le backend, sont retirés en E1c-2. Typecheck web.
#
# Usage : bash apply-auth-phaseE1c1-frontend.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseE1c1-frontend.sh   (clone)
#
set -euo pipefail

W="apps/web/src"
[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

# garde-fou : UpdateUserRoleById importé ailleurs ?
if grep -rln 'UpdateUserRoleById' "$W" --include=*.tsx --include=*.ts 2>/dev/null \
   | grep -v 'components/UpdateUserRoleById.tsx' | grep -q .; then
  echo "ATTENTION: UpdateUserRoleById est importé ailleurs — vérifie avant suppression :"
  grep -rln 'UpdateUserRoleById' "$W" --include=*.tsx --include=*.ts | grep -v 'components/UpdateUserRoleById.tsx'
  exit 1
fi

# ── Suppressions ─────────────────────────────────────────────────────────────
rm -rf "$W/app/(admin)/dashboard/roles" "$W/app/(admin)/dashboard/permissions"
rm -rf "$W/features/admin/roles" "$W/features/admin/permissions"
rm -f  "$W/features/admin/users/components/UpdateUserRoleById.tsx"
rm -f  "$W/features/admin/users/actions/createUserForm.action.ts"
echo "features roles/permissions + UpdateUserRoleById + createUserAction supprimés"

# ── Réécriture page d'édition user ──────────────────────────────────────────
cat > "$W/app/(admin)/dashboard/users/[id]/edit/page.tsx" <<'TSX'
"use client";

import { JSX, use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Édition d'un utilisateur — `/(admin)/dashboard/users/[id]/edit`.
 *
 * Les accès sont désormais gérés par l'appartenance aux GROUPES (le groupe
 * Administrateurs confère l'admin) — voir la gestion des groupes de membres.
 * Cette page ne conserve que la SUPPRESSION, bloquée sur soi-même.
 */
export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): JSX.Element {
  const router = useRouter();
  const { id } = use(params);
  const utils = trpc.useUtils();
  const sessionUserId = useSessionStore((s) => s.session?.user?.id);

  const deleteMutation = trpc.user.delete.useMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: user, isLoading, isError } = trpc.user.getById.useQuery({ id });

  if (isLoading) return <div>Chargement…</div>;
  if (isError || !user) {
    return <div className="text-red-600">Utilisateur introuvable.</div>;
  }

  const isSelf = sessionUserId === user.id;
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.pseudo ||
    user.email;

  const handleDelete = async () => {
    if (
      !window.confirm("Supprimer cet utilisateur ? Cette action est définitive.")
    ) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync({ id: user.id });
      await utils.user.getAll.invalidate();
      router.push("/dashboard/users");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/dashboard/users/${user.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la fiche
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSelf || deleteMutation.isPending}
          className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Éditer {displayName}</h2>

      <section className="max-w-md space-y-2 text-sm text-muted-foreground">
        <p>
          Les accès sont gérés via les{" "}
          <Link
            href="/dashboard/groups"
            className="underline hover:text-foreground"
          >
            groupes de membres
          </Link>{" "}
          (le groupe Administrateurs confère l'accès admin).
        </p>
        {isSelf && <p className="text-xs">Tu ne peux pas te supprimer.</p>}
        {actionError && (
          <pre className="mt-3 whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {actionError}
          </pre>
        )}
      </section>
    </div>
  );
}
TSX
echo "réécrit  users/[id]/edit/page.tsx"

# ── Éditions ciblées ─────────────────────────────────────────────────────────
python3 - <<'PY'
import pathlib, sys

W = "apps/web/src"

def edit(path, old, new, *, required=True):
    p = pathlib.Path(path)
    if not p.exists():
        if required: print(f"ERREUR: {path} introuvable", file=sys.stderr); sys.exit(1)
        return
    s = p.read_text(encoding="utf-8")
    if old not in s:
        if new and new in s: print(f"— {path}: déjà fait"); return
        print(f"ERREUR: ancre introuvable dans {path}", file=sys.stderr); sys.exit(1)
    assert s.count(old) == 1, f"ancre multiple dans {path}"
    p.write_text(s.replace(old, new), encoding="utf-8")
    print(f"✓ {path}")

# users/[id]/page.tsx : include + affichage
PAGE = f"{W}/app/(admin)/dashboard/users/[id]/page.tsx"
edit(PAGE,
"""  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      role: {
        include: { permissions: { include: { permission: true } } },
      },
    },
  });""",
"""  const user = await prisma.user.findUnique({
    where: { id },
  });""")
edit(PAGE,
"""        <div>
          <dt className="font-medium text-muted-foreground">Rôle</dt>
          <dd>{user.role?.name ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-muted-foreground">
            Permissions héritées du rôle
          </dt>
          <dd>
            {user.role?.permissions && user.role.permissions.length > 0 ? (
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {user.role.permissions.map((rp) => (
                  <li
                    key={rp.permission.id}
                    className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs"
                  >
                    {rp.permission.name}
                  </li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </dd>
        </div>
""", "")

# UsersTable
UT = f"{W}/features/admin/users/components/UsersTable.tsx"
edit(UT, "type UserRow = { id: string; email: string; role: string };",
         "type UserRow = { id: string; email: string };")
edit(UT, '    role: u.role?.name ?? "—",\n', "")
edit(UT, '    { property: "role", displayName: "Rôle", type: "string" },\n', "")

# UserCard
edit(f"{W}/features/admin/users/components/UserCard.tsx",
     '      {user?.role && <p className="text-gray-600">Rôle: {user.role.name}</p>}\n',
     "")

# Sidebar : items Rôles + Permissions
edit(f"{W}/features/app-shell/ControlPanelSidebar.tsx",
'        { label: "Rôles", href: "/dashboard/roles", createHref: "/dashboard/roles/create", createAlt: "Créer un nouveau rôle" },\n'
'        { label: "Permissions", href: "/dashboard/permissions", createHref: "/dashboard/permissions/create", createAlt: "Créer une permission" },\n',
"")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO :"; grep -nE "error TS|role|Role" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(auth): phase E1c-1 — suppression du rôle côté frontend (features, fiche user, sidebar)" \
  && echo "commit $(git rev-parse --short HEAD)"