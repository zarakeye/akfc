#!/usr/bin/env bash
#
# AKFC — Auth role→groupe, PHASE E1b : couper `role` de la session / auth.
#
#   1. prisma-extended.types.ts  — UserEnhanced(Strict)/SessionEnhancedStrict :
#                                  plus de Role/Permission (juste User de base).
#   2. auth.service.ts           — login : findUnique sans include role ;
#                                  normalizedUser = user.
#   3. getSessionFromRequest.ts  — SessionDB sans role ; mapper sans role ;
#                                  include simplifié ; imports Role/Permission ôtés.
#   4. session.types.ts          — SessionClient.user perd le champ `role`.
#
# createSessionJWT ne lit que user.id → aucun impact. `isAdmin` (phase A) reste la
# source. Ancres choisies HORS des zones modifiées en phase A.
#
# Typecheck backend + web (session.types est partagé). Si un composant client lit
# encore `session.user.role` (oubli de C1), le typecheck web le dira → tu me le
# donnes.
#
# Usage : bash apply-auth-phaseE1b-session.sh
#         AKFC_APPLY_ONLY=1 bash apply-auth-phaseE1b-session.sh   (clone)
#
set -euo pipefail

PRISMAEXT="packages/backend/src/types/prisma-extended.types.ts"
AUTHSVC="packages/backend/src/modules/auth/services/auth.service.ts"
GSFR="packages/backend/src/modules/auth/getSessionFromRequest.ts"
TYPES="packages/contracts/src/auth/session.types.ts"

[ -f "package.json" ] || { echo "ERREUR: lance-moi à la racine du repo." >&2; exit 1; }
for f in "$PRISMAEXT" "$AUTHSVC" "$GSFR" "$TYPES"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done

if [ "${AKFC_APPLY_ONLY:-0}" != "1" ]; then
  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
  if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "⚠️  Tu es sur '$BRANCH' — attendu : feat/auth-role-to-group. (Ctrl-C pour annuler.)"; sleep 3
  fi
fi

# ── 1. prisma-extended (réécriture) ─────────────────────────────────────────
cat > "$PRISMAEXT" <<'TS'
import { Session, User } from "@prisma/client";

/**
 * Types "enrichis" hérités : jadis User + Role + Permission. L'auth étant passée
 * aux groupes (isAdmin dérivé de l'appartenance au groupe Administrateurs), il ne
 * reste que le User de base. Conservés pour ne pas casser les signatures
 * existantes (createSessionJWT, loginService).
 */
export type UserEnhanced = User | null;

export type UserEnhancedStrict = User;

export type SessionEnhancedStrict = Session & {
  user: User | null;
};
TS
echo "réécrit  $PRISMAEXT"

# ── 2. auth.service ──────────────────────────────────────────────────────────
python3 - "$AUTHSVC" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

inc_old = (
    "  const user = await prisma.user.findUnique({\n"
    "    where: { email },\n"
    "    // 🚀 JOIN SQL au lieu de SELECT en cascade (cf. note dans\n"
    "    // getSessionFromRequest pour le détail).\n"
    '    relationLoadStrategy: "join",\n'
    "    include: {\n"
    "      role: {\n"
    "        include: {\n"
    "          permissions: {\n"
    "            include: {\n"
    "              permission: true,\n"
    "            },\n"
    "          },\n"
    "        },\n"
    "      },\n"
    "    }\n"
    "  });\n"
)
inc_new = (
    "  const user = await prisma.user.findUnique({\n"
    "    where: { email },\n"
    "  });\n"
)
if inc_old in s:
    assert s.count(inc_old) == 1, "ancre include (auth.service) multiple"
    s = s.replace(inc_old, inc_new)
elif inc_new not in s:
    print("ERREUR: ancre include auth.service introuvable", file=sys.stderr); sys.exit(1)

norm_old = (
    "  const normalizedUser: UserEnhancedStrict = {\n"
    "    ...user,\n"
    "    role: user.role\n"
    "      ? {\n"
    "          ...user.role,\n"
    "          permissions: user.role.permissions.map((p) => p.permission),\n"
    "        }\n"
    "      : null,\n"
    "  };\n"
)
norm_new = "  const normalizedUser: UserEnhancedStrict = user;\n"
if norm_old in s:
    assert s.count(norm_old) == 1, "ancre normalizedUser multiple"
    s = s.replace(norm_old, norm_new)
elif norm_new not in s:
    print("ERREUR: ancre normalizedUser introuvable", file=sys.stderr); sys.exit(1)

p.write_text(s, encoding="utf-8")
print("auth.service : role retiré (include + normalizedUser)")
PY

# ── 3. getSessionFromRequest ─────────────────────────────────────────────────
python3 - "$GSFR" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")

edits = [
    # imports
    ('import type { Permission, Role, Session, User } from "@prisma/client";',
     'import type { Session, User } from "@prisma/client";'),
    # SessionDB
    ("type SessionDB = Session & {\n"
     "  user: (User & {\n"
     "    role: (Role & {\n"
     "      permissions: {\n"
     "        permission: Permission;\n"
     "      }[];\n"
     "    }) | null;\n"
     "  }) | null;\n"
     "};\n",
     "type SessionDB = Session & {\n"
     "  user: User | null;\n"
     "};\n"),
    # const role
    ("  const role = session.user!.role;\n\n  return {\n",
     "  return {\n"),
    # role output block
    ("\n      role: role\n"
     "        ? {\n"
     "            id: role.id,\n"
     "            name: role.name,\n"
     "            permissions: role.permissions.map((rp) => rp.permission.name),\n"
     "          }\n"
     "        : null,",
     ""),
    # include
    ("    // Pour cette query qui traverse Session \u2192 User \u2192 Role \u2192 RolePermissions\n"
     "    // \u2192 Permission (4 niveaux d'include), le mode 'query' par d\u00e9faut \u00e9mettait\n"
     "    // 5 SELECT en cascade \u2014 soit 5 round-trips DB par requ\u00eate HTTP. Avec\n"
     "    // 'join', Prisma \u00e9met 1 seul SELECT avec des LATERAL JOIN.\n"
     "    // C'est un findUnique (donc 0 ou 1 ligne), il n'y a aucun risque\n"
     "    // de multiplication de lignes li\u00e9e aux relations 1-N.\n"
     '    relationLoadStrategy: "join",\n'
     "    include: {\n"
     "      user: {\n"
     "        include: {\n"
     "          role: {\n"
     "            include: {\n"
     "              permissions: {\n"
     "                include: {\n"
     "                  permission: true,\n"
     "                },\n"
     "              },\n"
     "            },\n"
     "          },\n"
     "        },\n"
     "      },\n"
     "    },\n",
     "    include: {\n"
     "      user: true,\n"
     "    },\n"),
]
for old, new in edits:
    if old not in s:
        # tolérance : peut-être déjà appliqué
        if new and new in s:
            continue
        print(f"ERREUR: ancre getSessionFromRequest introuvable :\n{old[:60]}...", file=sys.stderr); sys.exit(1)
    assert s.count(old) == 1, f"ancre multiple getSessionFromRequest : {old[:50]}"
    s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("getSessionFromRequest : role retiré (SessionDB, mapper, include, imports)")
PY

# ── 4. session.types ─────────────────────────────────────────────────────────
python3 - "$TYPES" <<'PY'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); s = p.read_text(encoding="utf-8")
old = (
    "\n    role: {\n"
    "      id: number;\n"
    "      name: string;\n"
    "      permissions: string[];\n"
    "    } | null;"
)
if old not in s:
    if "role: {" not in s:
        print("session.types : role déjà retiré"); sys.exit(0)
    print("ERREUR: ancre role (session.types) introuvable", file=sys.stderr); sys.exit(1)
assert s.count(old) == 1, "ancre role (session.types) multiple"
s = s.replace(old, "")
p.write_text(s, encoding="utf-8")
print("session.types : champ role retiré")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck, ni commit"; exit 0
fi

echo "typecheck backend…"
if ! pnpm --filter backend typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck backend KO :"; grep -nE "error TS|Error:" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "typecheck web…"
if ! pnpm --filter web typecheck > /tmp/akfc_tc.log 2>&1; then
  echo "typecheck web KO (un composant lit peut-être encore session.user.role) :"; grep -nE "error TS|role" /tmp/akfc_tc.log | head -20; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "OK"

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then echo "aucune modif"; exit 0; fi
git add -A
git commit -m "refactor(auth): phase E1b — role retiré de la session/auth (types, login, session loading)" \
  && echo "commit $(git rev-parse --short HEAD)"