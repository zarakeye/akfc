#!/usr/bin/env bash
# AKFC — LoginForm : toggle œil (inline, style login conservé) + lien "Mot de passe oublié ?".
# Usage : bash apply-login-eye-and-forgot.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
F="apps/web/src/features/auth/components/LoginForm.tsx"
[ -f "$F" ] || { echo "ERREUR: $F introuvable." >&2; exit 1; }
if grep -q 'showPassword' "$F" 2>/dev/null; then echo "— déjà appliqué"; exit 0; fi

python3 - "$F" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

# imports
imp = 'import { AUTH_ERRORS } from "@features/auth/errors/auth.errors";'
assert s.count(imp) == 1, "ancre import AUTH_ERRORS"
s = s.replace(imp, imp + '\nimport Link from "next/link";\nimport { Eye, EyeOff } from "lucide-react";')

# state
st = "  const [error, setError] = useState<string | null>(null);"
assert s.count(st) == 1, "ancre state error"
s = s.replace(st, st + "\n  const [showPassword, setShowPassword] = useState(false);")

# input password → wrap relatif + œil
old_input = '''        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Password"
          required
          aria-invalid={!!error && (!password || password.length < 12)}
          className="border rounded bg-white px-2 py-1"
        />'''
new_input = '''        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Password"
            required
            aria-invalid={!!error && (!password || password.length < 12)}
            className="border rounded bg-white px-2 py-1 pr-9"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 transition-colors hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>'''
assert s.count(old_input) == 1, "ancre input password"
s = s.replace(old_input, new_input)

# lien mot de passe oublié (après l'affichage d'erreur)
errline = '      {error && <p className="text-red-500">{error}</p>}'
assert s.count(errline) == 1, "ancre ligne error"
s = s.replace(
    errline,
    errline
    + '\n\n      <Link\n        href="/auth/forgot-password"\n        className="text-sm text-blue-600 hover:underline"\n      >\n        Mot de passe oublié ?\n      </Link>',
)

p.write_text(s, encoding="utf-8")
print("  ok  LoginForm : œil + lien mot de passe oublié")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modification"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(auth): login — toggle œil + lien mot de passe oublié" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }