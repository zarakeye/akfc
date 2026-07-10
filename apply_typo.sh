#!/bin/bash
# Typo du contenu rendu (.tiptap-rendered) via @tailwindcss/typography.
# À lancer depuis la RACINE du monorepo : bash apply_typo.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

echo "-> Installation du plugin"
pnpm add -w -D @tailwindcss/typography

echo "-> Edition de globals.css et view.server.tsx"
python3 << 'PYAPPLY'
CSS_BLOCK = '\n\n/* ── Rendu public du contenu tiptap (.tiptap-rendered, cf. view.server) ──\n   La typographie (titres, listes, hr, figures…) est portée par\n   @tailwindcss/typography via la classe `prose` posée sur le wrapper.\n   Ici : uniquement ce que le plugin ne connaît pas — les task lists\n   tiptap (ul[data-type="taskList"]). Le surlignage multicolore et\n   text-align passent en styles inline, non écrasés par prose. */\n.tiptap-rendered ul[data-type="taskList"] {\n  list-style: none;\n  padding-left: 0;\n}\n.tiptap-rendered ul[data-type="taskList"] li {\n  display: flex;\n  align-items: flex-start;\n  gap: 0.5rem;\n}\n.tiptap-rendered ul[data-type="taskList"] li > label {\n  margin-top: 0.3em;\n}\n.tiptap-rendered ul[data-type="taskList"] li > div {\n  flex: 1 1 auto;\n}\n'

from pathlib import Path

g = Path("apps/web/src/app/globals.css")
src = g.read_text()
assert "@plugin \"@tailwindcss/typography\"" not in src, "deja applique ?"
old = '@import "tw-animate-css";'
assert src.count(old) == 1, "import tw-animate-css introuvable"
src = src.replace(old, old + '\n@plugin "@tailwindcss/typography";', 1)
src = src.rstrip("\n") + CSS_BLOCK
g.write_text(src)

v = Path("apps/web/src/features/page-builder/blocks/tiptap/view.server.tsx")
src = v.read_text()
old = 'className="tiptap-rendered max-w-none"'
assert src.count(old) == 1, "wrapper introuvable dans view.server.tsx"
v.write_text(src.replace(old, 'className="tiptap-rendered prose max-w-none"', 1))
print("2 fichiers edites.")

PYAPPLY

echo
echo "Validation :"
pnpm --filter web typecheck