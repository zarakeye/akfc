#!/usr/bin/env bash
#
# AKFC — Retirer le bloc « Accès aux pages publiques » de la page d'accueil.
#
# Les trois cartes Nos disciplines / Agenda / La galerie (tableau `activities`
# + sa section JSX). On retire les trois pièces ensemble, sinon le typecheck
# casse : la section JSX, le tableau `activities`, et les imports d'icônes
# devenus inutiles (`Award`/`Calendar`/`Images`). `ArrowRight` reste (utilisé
# par les deux CTA « Nous contacter »).
#
# Usage normal (Stéphane) : depuis la racine du repo.
#   bash apply-home-remove-activities.sh
# Usage Claude sur clone :
#   AKFC_APPLY_ONLY=1 bash apply-home-remove-activities.sh
#
set -euo pipefail

PAGE="apps/web/src/app/(public)/page.tsx"

if [ ! -f "package.json" ] || [ ! -f "$PAGE" ]; then
  echo "ERREUR: lance ce script depuis la racine du repo AKFC ($PAGE attendu)." >&2
  exit 1
fi

python3 - "$PAGE" <<'PY'
import sys, pathlib

p = pathlib.Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "const activities = [" not in s:
    print("déjà appliqué — rien à faire")
    sys.exit(0)

# ── 1) Import : retirer Award, Calendar, Images (garder ArrowRight) ─────────
IMP_OLD = '''import { Award, Calendar, Images, ArrowRight } from "lucide-react";'''
IMP_NEW = '''import { ArrowRight } from "lucide-react";'''
assert s.count(IMP_OLD) == 1, "ancre import lucide introuvable/multiple — abandon"
s = s.replace(IMP_OLD, IMP_NEW)

# ── 2) Tableau `activities` (+ sa ligne vide suivante) ──────────────────────
ARR_OLD = '''  const activities = [
    {
      href: "/disciplines",
      icon: Award,
      title: "Nos disciplines",
      desc: "Les arts martiaux et pratiques enseignés au club.",
    },
    {
      href: "/agenda",
      icon: Calendar,
      title: "Agenda",
      desc: "Stages et évènements à venir, du plus proche au plus lointain.",
    },
    {
      href: "/gallery",
      icon: Images,
      title: "La galerie",
      desc: "Images des entraînements, stages et moments partagés.",
    },
  ];

'''
assert s.count(ARR_OLD) == 1, "ancre tableau activities introuvable/multiple — abandon"
s = s.replace(ARR_OLD, "")

# ── 3) Section JSX « Accès aux pages publiques » (+ sa ligne vide suivante) ─
JSX_OLD = '''      {/* Accès aux pages publiques */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map(({ href, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <Icon className="h-8 w-8 text-emerald-600" />
                <p className="text-lg font-semibold">{title}</p>
                <p className="flex-1 text-sm text-gray-600">{desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                  Voir
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

'''
assert s.count(JSX_OLD) == 1, "ancre section JSX introuvable/multiple — abandon"
s = s.replace(JSX_OLD, "")

p.write_text(s, encoding="utf-8")
print("patch home OK (bloc Accès aux pages publiques retiré)")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "APPLY_ONLY — pas de typecheck ni commit"
  exit 0
fi

if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  echo "aucune modification — rien à typechecker/committer"
  exit 0
fi

if node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null; then
  TC="check"
else
  TC="typecheck"
fi
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ typecheck ÉCHOUÉ — pas de commit. Erreurs :"
  grep -nE "error TS|Error:|erreur" /tmp/akfc_tc.log | head -15 || true
  echo "----- fin du log -----"; tail -4 /tmp/akfc_tc.log
  exit 1
fi
echo "✅ typecheck OK"

git add -A
if git commit -m "feat(home): retirer le bloc Accès aux pages publiques (disciplines/agenda/galeries)" > /tmp/akfc_commit.log 2>&1; then
  echo "✅ commit $(git rev-parse --short HEAD)"
else
  echo "❌ commit échoué :"; head -10 /tmp/akfc_commit.log; exit 1
fi