#!/usr/bin/env bash
#
# AKFC — Changement de mot de passe (connecté), INCRÉMENT 1 : contrat + backend.
#
# - contrat : changePasswordSchema (partagé front/back).
# - backend : auth.changePassword (protégé) — vérifie le mot de passe ACTUEL
#   (verifyPassword), refuse si identique, bcrypt.hash(12), user.update, et
#   supprime les AUTRES sessions (déconnecte les autres appareils, garde le
#   courant via le sessionId du cookie). Le tout en transaction.
#
# La base étant STATEFUL (table Session vérifiée à chaque requête), supprimer
# une ligne Session déconnecte l'appareil au prochain appel — sans toucher au JWT.
#
# Périmètre : contracts + auth/router. Un typecheck.
# Usage : bash apply-change-password-1-backend.sh
#
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
SCHEMA="packages/contracts/src/auth/auth.schema.ts"
ROUTER="packages/backend/src/modules/auth/router.ts"
[ -f "$SCHEMA" ] || { echo "ERREUR: $SCHEMA introuvable." >&2; exit 1; }
[ -f "$ROUTER" ] || { echo "ERREUR: $ROUTER introuvable." >&2; exit 1; }

python3 - "$SCHEMA" "$ROUTER" <<'PY'
import sys, pathlib
SCHEMA, ROUTER = sys.argv[1], sys.argv[2]

# --- contrat : append changePasswordSchema (idempotent) ---
sp = pathlib.Path(SCHEMA); s = sp.read_text(encoding="utf-8")
if "changePasswordSchema" not in s:
    s = s.rstrip() + '''

/**
 * Changement de mot de passe pour un utilisateur CONNECTÉ.
 * `currentPassword` : vérifié côté serveur (doit correspondre au hash actuel).
 * `newPassword` : min 12 (même règle que la connexion / le reset).
 * (La confirmation est validée côté formulaire, pas nécessaire au serveur.)
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(12, "Le nouveau mot de passe doit faire au moins 12 caractères"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
'''
    sp.write_text(s, encoding="utf-8")
    print(f"  ok  {SCHEMA} (changePasswordSchema ajouté)")
else:
    print(f"  — {SCHEMA} : changePasswordSchema déjà présent")

# --- backend : imports + mutation ---
rp = pathlib.Path(ROUTER); r = rp.read_text(encoding="utf-8")

if "changePassword:" in r:
    print(f"  — {ROUTER} : changePassword déjà présent"); sys.exit(0)

# imports après `import bcrypt from "bcryptjs";`
anchor_imp = 'import bcrypt from "bcryptjs";'
assert r.count(anchor_imp) == 1, "ancre import bcrypt"
r = r.replace(
    anchor_imp,
    anchor_imp
    + '\nimport { verifyPassword } from "@backend/lib/auth/password";'
    + '\nimport { getToken, verifyJwt } from "@backend/lib/session/session.server";'
    + '\nimport { changePasswordSchema } from "@contracts/auth/auth.schema";',
)

# mutation insérée après le bloc logout
anchor_logout = '''  logout: protectedProcedure.mutation(async () => {
    await deleteSessionFromCookie();

    return {
      success: true,
    };
  }),'''
assert r.count(anchor_logout) == 1, "ancre logout"
mutation = '''

  /**
   * Changement de mot de passe (utilisateur connecté).
   * Vérifie le mot de passe actuel, refuse un nouveau identique, re-hash, et
   * DÉCONNECTE LES AUTRES APPAREILS (supprime leurs sessions ; garde la
   * courante via le sessionId du cookie).
   */
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.sessionClient.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Utilisateur introuvable" });
      }

      const ok = await verifyPassword(input.currentPassword, user.password);
      if (!ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mot de passe actuel incorrect",
        });
      }

      const same = await verifyPassword(input.newPassword, user.password);
      if (same) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Le nouveau mot de passe doit être différent de l'actuel",
        });
      }

      const hashed = await bcrypt.hash(input.newPassword, 12);
      const payload = verifyJwt(await getToken());
      const currentSessionId = payload?.sessionId ?? null;

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { password: hashed },
        });
        await tx.session.deleteMany({
          where: {
            userId,
            ...(currentSessionId ? { NOT: { id: currentSessionId } } : {}),
          },
        });
      });

      return { success: true };
    }),'''
r = r.replace(anchor_logout, anchor_logout + mutation)
rp.write_text(r, encoding="utf-8")
print(f"  ok  {ROUTER} (auth.changePassword ajouté)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY — pas de typecheck ni commit"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then TC="check"; else TC="typecheck"; fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"
git add -A
git commit -m "feat(auth): changePassword (connecté) — vérif mdp actuel + déconnexion des autres appareils" > /tmp/akfc_commit.log 2>&1 \
  && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit: rien ou échec"; tail -3 /tmp/akfc_commit.log; }