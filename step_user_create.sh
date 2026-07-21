#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# CRÉATION UTILISATEUR : le mot de passe est GÉNÉRÉ côté serveur et envoyé par
# email de bienvenue, au lieu d'être saisi dans le formulaire.
#
# 3 actions pour l'admin : email + rôle + submit. Le submit crée l'user et
# envoie le mdp généré à l'email, avec invitation à le modifier (isFirstLogin).
#
# Tout l'outillage EXISTE déjà (generateStrongPassword, sendPasswordEmail) — il
# était même câblé dans une SERVER ACTION parallèle jamais utilisée. La page
# passe par trpc.user.create, qui lui attendait un password. On corrige CE
# chemin (le seul réellement branché) et on nettoie le form.
#
# À lancer depuis la RACINE du repo.  AKFC_APPLY_ONLY=1 → patch sans typecheck/commit.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROUTER="packages/backend/src/modules/users/router.ts"
FORM="apps/web/src/features/admin/users/forms/CreateUserForm.tsx"
PAGE="apps/web/src/app/(admin)/dashboard/users/create/page.tsx"

for f in "$ROUTER" "$FORM" "$PAGE"; do
  test -f "$f" || { echo "✗ $f introuvable — lance depuis la racine."; exit 1; }
done

# Garde anti-double : si le router génère déjà le mdp, c'est fait.
if grep -q "generateStrongPassword" "$ROUTER"; then
  echo "→ user.create génère déjà le mot de passe, rien à faire."
  exit 0
fi

# ── 1) Backend : user.create génère le mdp + envoie l'email ─────────────────
python3 - <<'PYEOF'
import pathlib

r = pathlib.Path("packages/backend/src/modules/users/router.ts")
src = r.read_text(encoding="utf-8")

# 1a. imports (générateur + sender), après l'import bcrypt
OLD_IMP = 'import bcrypt from "bcryptjs";'
NEW_IMP = '''import bcrypt from "bcryptjs";
import generateStrongPassword from "@backend/lib/security/generatePassword";
import sendPasswordEmail from "@backend/email/templates/welcomeEmailWithPassword";'''
assert src.count(OLD_IMP) == 1, f"import bcrypt trouvé {src.count(OLD_IMP)}x"
src = src.replace(OLD_IMP, NEW_IMP)

# 1b. retirer password de l'input
OLD_INPUT = '''      z.object({
        email: z.string().email("Invalid email format"),
        password: z
          .string()
          .min(12, "Le mot de passe doit avoir au moins 12 caractères"),
        roleId: z.number(),
      }),'''
NEW_INPUT = '''      z.object({
        email: z.string().email("Invalid email format"),
        roleId: z.number(),
      }),'''
assert src.count(OLD_INPUT) == 1, "ancre input create introuvable"
src = src.replace(OLD_INPUT, NEW_INPUT)

# 1c. générer le mdp au lieu de le recevoir, + envoyer l'email après création
OLD_BODY = '''      const hash = await bcrypt.hash(input.password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hash,
          roleId: input.roleId,
        },
      });

      return {
        success: true,
        user,
      };'''
NEW_BODY = '''      // Mot de passe généré côté serveur (jamais saisi par l'admin) puis
      // envoyé à l'utilisateur par email. isFirstLogin=true (défaut Prisma)
      // le forcera à le changer à la première connexion.
      const password = generateStrongPassword();
      const hash = await bcrypt.hash(password, 12);

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: hash,
          roleId: input.roleId,
        },
      });

      // Email de bienvenue avec le mot de passe temporaire. Un échec d'envoi
      // ne doit pas annuler la création — on le logue sans jeter.
      try {
        await sendPasswordEmail(
          input.email,
          `Bienvenue`,
          password,
        );
      } catch (err) {
        console.error("[user.create] envoi email de bienvenue échoué :", err);
      }

      return {
        success: true,
        user,
      };'''
assert src.count(OLD_BODY) == 1, "ancre body create introuvable"
src = src.replace(OLD_BODY, NEW_BODY)

r.write_text(src, encoding="utf-8")
print("  ✓ backend : user.create génère le mdp + envoie l'email")
PYEOF

# ── 2) Form : retirer le champ password ─────────────────────────────────────
python3 - <<'PYEOF'
import pathlib

f = pathlib.Path("apps/web/src/features/admin/users/forms/CreateUserForm.tsx")
src = f.read_text(encoding="utf-8")

# 2a. interface : retirer password
src = src.replace("  email: string;\n  password: string;\n  roleId: number;",
                  "  email: string;\n  roleId: number;")

# 2b. state password
src = src.replace('  const [password, setPassword] = useState<string>("");\n', "")

# 2c. validation password
src = src.replace('''    if (password.length < 12) {
      setSubmitError("Le mot de passe doit faire au moins 12 caractères.");
      return;
    }
''', "")

# 2d. onSubmit : retirer password
src = src.replace("await onSubmit({ email: email.trim(), password, roleId });",
                  "await onSubmit({ email: email.trim(), roleId });")

# 2e. le champ JSX password entier
JSX_PWD = '''      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-input bg-background px-2 py-1"
        />
        <span className="text-xs text-muted-foreground">
          12 caractères minimum.
        </span>
      </label>

'''
assert src.count(JSX_PWD) == 1, "ancre champ JSX password introuvable"
src = src.replace(JSX_PWD, "")

# 2f. commentaire d'en-tête devenu faux (mentionne le mot de passe saisi)
src = src.replace(
    """ * rôle est modifiable (sur la fiche, via `updateUserRoleById`). Le mot de
 * passe est hashé côté router (bcrypt) — on l'envoie en clair via la mutation
 * tRPC `user.create`, jamais stocké tel quel.""",
    """ * rôle est modifiable (sur la fiche, via `updateUserRoleById`). Le mot de
 * passe est GÉNÉRÉ côté serveur à la création et envoyé par email — l'admin
 * ne le saisit jamais.""")

f.write_text(src, encoding="utf-8")
print("  ✓ form : champ password retiré")
PYEOF

# ── 3) Page : ne plus passer password à la mutation ─────────────────────────
python3 - <<'PYEOF'
import pathlib

p = pathlib.Path("apps/web/src/app/(admin)/dashboard/users/create/page.tsx")
src = p.read_text(encoding="utf-8")

OLD = '''    const res = await createMutation.mutateAsync({
      email: input.email,
      password: input.password,
      roleId: input.roleId,
    });'''
NEW = '''    const res = await createMutation.mutateAsync({
      email: input.email,
      roleId: input.roleId,
    });'''
assert src.count(OLD) == 1, "ancre mutateAsync introuvable"
src = src.replace(OLD, NEW)
p.write_text(src, encoding="utf-8")
print("  ✓ page : password retiré de l'appel mutation")
PYEOF

echo
echo "→ contrôle : plus aucune référence à password dans le form"
if grep -q "password" "$FORM"; then
  echo "  ⚠ 'password' subsiste dans le form :"; grep -n "password" "$FORM" | cut -c1-70
else
  echo "  ✓ form propre"
fi

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "→ AKFC_APPLY_ONLY=1 : stop avant typecheck/commit."
  exit 0
fi

echo "→ typecheck backend…"
if ! pnpm --filter backend typecheck; then echo "✗ backend ROUGE — aucun commit."; exit 1; fi
echo "→ typecheck racine…"
if ! pnpm typecheck; then echo "✗ racine ROUGE — aucun commit."; exit 1; fi

git add -A && git commit -m "feat(users): mdp genere + email de bienvenue a la creation, form simplifie (email + role)"
echo "✓ commité."