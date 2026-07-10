#!/bin/bash
# Header : ajoute le lien 'Mon profil' dans le UserMenu + import Link.
# Edits idempotents. À lancer depuis la RACINE : bash apply_header_profil_link.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : racine requise." >&2; exit 1; }

python3 << 'PYINNER'
from pathlib import Path

p = Path("apps/web/src/features/app-shell/UserMenu.tsx")
if not p.exists():
    raise SystemExit("ABSENT: UserMenu.tsx")
s = p.read_text()

if "next/link" not in s:
    anchor = 'import { useRouter } from "next/navigation";'
    if s.count(anchor) != 1:
        raise SystemExit("ANCRE import (useRouter) introuvable - a signaler")
    s = s.replace(anchor, anchor + '\nimport Link from "next/link";', 1)
    print("  applique: import Link")
else:
    print("  deja present: import Link")

if "Mon profil" in s:
    print("  deja present: lien Mon profil")
else:
    anchor = '<p className="px-4 py-2 text-sm text-gray-700">{user.email}</p>'
    if s.count(anchor) != 1:
        raise SystemExit("ANCRE email introuvable - colle-moi ton bloc open")
    link = anchor + "\n" + "\n".join([
        '          <Link',
        '            href="/profil"',
        '            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"',
        '            onClick={() => setOpen(false)}',
        '          >',
        '            Mon profil',
        '          </Link>',
    ])
    s = s.replace(anchor, link, 1)
    print("  applique: lien Mon profil")

p.write_text(s)
PYINNER

echo
pnpm --filter web typecheck