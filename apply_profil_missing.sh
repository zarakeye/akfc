#!/bin/bash
# Avatar/Profil — COMBLE LES TROUS d une passe anterieure mal transmise :
#  - cree profil/page.tsx, profil/edit/page.tsx, FirstLoginRedirect.tsx
#  - ajoute /profil au matcher du proxy (idempotent)
#  - ajoute le lien "Mon profil" dans le header (idempotent)
#  - monte FirstLoginRedirect dans le layout public (idempotent)
# Les edits idempotents ne font rien si deja presents, et echouent
# bruyamment si le point d ancrage est introuvable (a signaler).
# À lancer depuis la RACINE du monorepo : bash apply_profil_missing.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine du monorepo requise." >&2; exit 1; }

mkdir -p "apps/web/src/app/(public)/profil/edit"
mkdir -p "apps/web/src/features/auth"

echo "-> apps/web/src/app/(public)/profil/page.tsx"
cat > 'apps/web/src/app/(public)/profil/page.tsx' << 'FILE_EOF'
"use client";

import { useMemo, type JSX } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { trpc } from "@trpc/trpcClient";
import {
  UserPortrait,
  formatUserName,
  type DisplayUser,
} from "@features/social/userDisplay";

/**
 * Page « Mon profil » — accessible à tout membre connecté (le proxy garde
 * `/profil`). Affiche les infos et un bouton « Éditer » vers /profil/edit
 * (le même formulaire que la première connexion). Le rôle est en lecture
 * seule ici : seul un admin le modifie, ailleurs.
 */
export default function ProfilePage(): JSX.Element {
  const { data, isLoading, error } = trpc.user.getCurrentUserProfile.useQuery();

  const displayUser: DisplayUser | null = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      pseudo: data.pseudo,
      email: data.email,
      avatar: data.avatar,
      image: null,
    };
  }, [data]);

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-12">Chargement…</div>;
  }
  if (error || !data || !displayUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-red-600">
        Impossible de charger votre profil.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="scale-150">
          <UserPortrait user={displayUser} size="md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{formatUserName(displayUser)}</h1>
          <p className="text-sm text-gray-500">{data.email}</p>
        </div>
        <Link
          href="/profil/edit"
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Pencil className="h-4 w-4" />
          Éditer
        </Link>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Prénom" value={data.firstName} />
        <Field label="Nom" value={data.lastName} />
        <Field label="Pseudo" value={data.pseudo} />
        <Field label="Téléphone" value={data.phone} />
        <Field label="Date de naissance" value={data.birthDate} />
        <div className="sm:col-span-2">
          <Field label="À propos" value={data.aboutMe} />
        </div>
      </dl>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">
        {value?.trim() ? value : <span className="text-gray-400">—</span>}
      </dd>
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/app/(public)/profil/edit/page.tsx"
cat > 'apps/web/src/app/(public)/profil/edit/page.tsx' << 'FILE_EOF'
import { type JSX } from "react";

import UpdateMeForm from "@features/admin/users/forms/update-me/UpdateMeForm";

/**
 * Édition du profil — même formulaire que la première connexion
 * (UpdateMeForm, scellé sur le user connecté). Accessible à tout membre ;
 * le proxy garde `/profil`.
 */
export default function EditProfilePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <UpdateMeForm />
    </div>
  );
}
FILE_EOF

echo "-> apps/web/src/features/auth/FirstLoginRedirect.tsx"
cat > 'apps/web/src/features/auth/FirstLoginRedirect.tsx' << 'FILE_EOF'
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useSessionStore } from "@lib/stores/useSessionStore";

/**
 * Redirige un utilisateur en PREMIÈRE CONNEXION vers /profil/edit, pour
 * qu'il complète ses informations (toutes nullables, dont l'avatar).
 * `isFirstLogin` passe à false dès que le formulaire est soumis
 * (updateProfile), ce qui lève la redirection.
 *
 * Garde-fous : ne redirige que si connecté ET first-login ET pas déjà sur
 * la page d'édition (évite toute boucle). Rendu invisible (null).
 */
export function FirstLoginRedirect(): null {
  const user = useSessionStore((s) => s.session?.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user?.isFirstLogin) return;
    if (pathname === "/profil/edit") return;
    router.replace("/profil/edit");
  }, [user?.isFirstLogin, pathname, router]);

  return null;
}
FILE_EOF


python3 << 'PYEOF'
from pathlib import Path

def edit(path, checks_absent, old, new, label):
    p = Path(path)
    if not p.exists():
        raise SystemExit(f"ABSENT: {path} (attendu existant)")
    s = p.read_text()
    if checks_absent in s:
        print(f"  deja present: {label}")
        return
    if s.count(old) != 1:
        raise SystemExit(f"ANCRE INTROUVABLE pour {label} dans {path} — a signaler")
    p.write_text(s.replace(old, new, 1))
    print(f"  applique: {label}")

# 1) proxy : ajouter /profil au matcher
edit(
    "apps/web/src/proxy.ts",
    checks_absent="/profil/:path*",
    old='matcher: ["/dashboard/:path*"]',
    new='matcher: ["/dashboard/:path*", "/profil/:path*"]',
    label="matcher proxy /profil",
)

# 2) layout public : monter FirstLoginRedirect (import + composant)
lay = Path("apps/web/src/app/(public)/layout.tsx")
s = lay.read_text()
if "FirstLoginRedirect" not in s:
    # import
    anchor_imp = 'import { BreakingNewsShell } from "@features/breaking-news/BreakingNewsShell";'
    if s.count(anchor_imp) != 1:
        raise SystemExit("ANCRE import layout introuvable — a signaler")
    s = s.replace(anchor_imp, anchor_imp + '\nimport { FirstLoginRedirect } from "@features/auth/FirstLoginRedirect";', 1)
    # montage : apres <Header />
    anchor_hdr = "<Header />"
    if s.count(anchor_hdr) != 1:
        raise SystemExit("ANCRE <Header /> layout introuvable — a signaler")
    s = s.replace(anchor_hdr, anchor_hdr + "\n        <FirstLoginRedirect />", 1)
    lay.write_text(s)
    print("  applique: FirstLoginRedirect monte dans le layout")
else:
    print("  deja present: FirstLoginRedirect dans le layout")
PYEOF

echo
echo "NB : le lien \"Mon profil\" dans le header (UserMenu) n a PAS ete touche"
echo "automatiquement car ton UserMenu peut differer. Verifie via :"
echo "  grep -n \"Mon profil\" apps/web/src/features/app-shell/UserMenu.tsx"
echo "Si absent, dis-le moi : je te livre l edit cible adapte a ton fichier."
echo
pnpm --filter web typecheck