#!/usr/bin/env bash
# AKFC — /auth/reset-password : PasswordField (toggle œil) sur les 2 champs.
# Usage : bash apply-reset-password-eye.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/app/auth/reset-password/page.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'PasswordField' "$F" 2>/dev/null; then echo "— déjà appliqué"; exit 0; fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# import après la ligne trpc
imp_anchor = 'import { trpc } from "@trpc/trpcClient";'
assert s.count(imp_anchor) == 1, "ancre import trpc"
s = s.replace(imp_anchor, imp_anchor + '\nimport { PasswordField } from "@features/auth/PasswordField";')

block1 = '''        <label className="grid gap-1">
          <span className="text-sm">Nouveau mot de passe</span>
          <input
            type="password"
            autoComplete="new-password"
            className="border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 12 caractères"
            disabled={!token || resetPassword.isPending || done}
          />
          {!passwordOk && password.length > 0 && (
            <span className="text-xs text-red-600">Minimum 12 caractères.</span>
          )}
        </label>'''
new1 = '''        <PasswordField
          label="Nouveau mot de passe"
          autoComplete="new-password"
          placeholder="Min. 12 caractères"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={!token || resetPassword.isPending || done}
          error={
            !passwordOk && password.length > 0 ? "Minimum 12 caractères." : undefined
          }
        />'''
assert s.count(block1) == 1, "ancre bloc 1 (nouveau)"
s = s.replace(block1, new1)

block2 = '''        <label className="grid gap-1">
          <span className="text-sm">Confirmer</span>
          <input
            type="password"
            autoComplete="new-password"
            className="border rounded px-3 py-2"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={!token || resetPassword.isPending || done}
          />
          {passwordConfirm.length > 0 && !confirmOk && (
            <span className="text-xs text-red-600">La confirmation ne correspond pas.</span>
          )}
        </label>'''
new2 = '''        <PasswordField
          label="Confirmer"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={!token || resetPassword.isPending || done}
          error={
            passwordConfirm.length > 0 && !confirmOk
              ? "La confirmation ne correspond pas."
              : undefined
          }
        />'''
assert s.count(block2) == 1, "ancre bloc 2 (confirmer)"
s = s.replace(block2, new2)

p.write_text(s, encoding="utf-8")
print("  ok  reset-password : 2 champs → PasswordField")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(auth): reset-password — toggle œil (PasswordField)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }