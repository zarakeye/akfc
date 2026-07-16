#!/usr/bin/env bash
###############################################################################
# E2c — Affichage : montrer TOUTES les disciplines d'un événement
#
#   1. events/router.ts : getAllAdmin expose `disciplineLinks` + labels.
#   2. EventsTable.tsx : rattachement = toutes les disciplines + labels
#      (et suppression de la query `discipline.getAll`, devenue inutile).
#   3. (public)/events/page.tsx : idem sur la liste publique.
#   4. (public)/events/[slug]/page.tsx : idem sur la fiche publique.
#
# Le calcul du `rattachement` passe d'une CHAÎNE DE FALLBACK (1re valeur non
# nulle) à une CONCATÉNATION (toutes les disciplines + tous les labels, sinon
# l'origine). Le JSX est inchangé : c'est toujours une string.
#
# Requiert E1 + E2a + E2b appliqués et migrés.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "disciplineIds" packages/backend/src/modules/events/router.ts 2>/dev/null; then
  echo "ERREUR: E2a absent. Applique la chaîne E d'abord."; exit 1
fi
if grep -q "buildRattachement" apps/web/src/features/admin/events/components/EventsTable.tsx 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. router : getAllAdmin expose disciplineLinks                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/events/router.ts"
s = open(p, encoding="utf-8").read()
a = '''      return ctx.prisma.event.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
      });'''
b = '''      return ctx.prisma.event.findMany({
        orderBy: [
          { publicationDate: { sort: "desc", nulls: "first" } },
          { createdAt: "desc" },
        ],
        include: {
          // Disciplines enseignées (0..N) — alimente la colonne
          // « rattachement » de la table admin.
          disciplineLinks: {
            select: { discipline: { select: { name: true } } },
          },
        },
      });'''
assert s.count(a) == 1, f"[1] getAllAdmin : {s.count(a)} match(es)."
open(p, "w", encoding="utf-8").write(s.replace(a, b))
print("  [1] events/router.ts : getAllAdmin + disciplineLinks OK")
PY

# --------------------------------------------------------------------------- #
# 2. EventsTable                                                              #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/admin/events/components/EventsTable.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

# 2.1 helper module-level (hors composant : React Compiler STRICT, aucune
#     réassignation pendant le rendu).
sub('''  const router = useRouter();
  const { data: events, isLoading, isError } = trpc.event.getAllAdmin.useQuery();
  const { data: disciplines } = trpc.discipline.getAll.useQuery();
  const { data: origins } = trpc.origin.getAll.useQuery();

  const disciplineById = useMemo(() => {
    const map = new Map<number, string>();
    (disciplines ?? []).forEach((d) => map.set(d.id, d.name));
    return map;
  }, [disciplines]);

  const originById''',
'''  const router = useRouter();
  const { data: events, isLoading, isError } = trpc.event.getAllAdmin.useQuery();
  const { data: origins } = trpc.origin.getAll.useQuery();

  const originById''',
"2.1.dropQuery")

# 2.2 rattachement = toutes les disciplines + tous les labels
sub('''    rattachement:
      (e.disciplineId != null ? disciplineById.get(e.disciplineId) : undefined) ??
      e.externalDisciplineLabel ??
      (e.originId != null ? originById.get(e.originId) : undefined) ??
      '—',''',
'''    rattachement: buildRattachement(
      e.disciplineLinks.map((l) => l.discipline.name),
      e.externalDisciplineLabels,
      e.originId != null ? originById.get(e.originId) : undefined,
    ),''',
"2.2.rattachement")

# 2.3 le helper lui-même, juste avant le composant
anchor = "export function EventsTable"
if s.count(anchor) != 1:
    anchor = "export default function EventsTable"
assert s.count(anchor) == 1, f"[2.3] ancre composant : {s.count(anchor)} match(es)."
helper = '''/**
 * Rattachement affiché : TOUTES les disciplines enseignées + TOUS les labels
 * externes (un événement peut en présenter plusieurs). À défaut, l'origine
 * culturelle. Fonction module-level : aucune réassignation pendant le rendu
 * (React Compiler STRICT).
 */
function buildRattachement(
  disciplineNames: string[],
  externalLabels: string[],
  originName: string | undefined,
): string {
  const parts = [...disciplineNames, ...externalLabels];
  if (parts.length > 0) return parts.join(', ');
  return originName ?? '—';
}

''' + anchor
s = s.replace(anchor, helper)

open(p, "w", encoding="utf-8").write(s)
print("  [2] EventsTable.tsx : rattachement multi OK")
PY

# --------------------------------------------------------------------------- #
# 3. (public)/events/page.tsx                                                 #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/app/(public)/events/page.tsx"
s = open(p, encoding="utf-8").read()

a = '''    include: {
      discipline: { select: { name: true } },
      origin: { select: { name: true, flag: true } },'''
b = '''    include: {
      // Disciplines enseignées (0..N) présentées lors de l'événement.
      disciplineLinks: { select: { discipline: { select: { name: true } } } },
      origin: { select: { name: true, flag: true } },'''
assert s.count(a) == 1, f"[3.include] : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''            const rattachement =
              event.discipline?.name ??
              event.externalDisciplineLabel ??
              event.origin?.name ??
              null;'''
b = '''            // Toutes les disciplines + tous les labels externes ; à défaut,
            // l'origine culturelle.
            const rattachements = [
              ...event.disciplineLinks.map((l) => l.discipline.name),
              ...event.externalDisciplineLabels,
            ];
            const rattachement =
              rattachements.length > 0
                ? rattachements.join(', ')
                : (event.origin?.name ?? null);'''
assert s.count(a) == 1, f"[3.calc] : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [3] (public)/events/page.tsx : rattachement multi OK")
PY

# --------------------------------------------------------------------------- #
# 4. (public)/events/[slug]/page.tsx                                          #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/app/(public)/events/[slug]/page.tsx"
s = open(p, encoding="utf-8").read()

a = '''      discipline: { select: { name: true, slug: true } },'''
b = '''      // Disciplines enseignées (0..N) présentées lors de l'événement.
      disciplineLinks: {
        select: { discipline: { select: { name: true, slug: true } } },
      },'''
assert s.count(a) == 1, f"[4.include] : {s.count(a)} match(es)."
s = s.replace(a, b)

a = '''  const rattachement =
    event.discipline?.name ??
    event.externalDisciplineLabel ??
    event.origin?.name ??
    null;'''
b = '''  // Toutes les disciplines + tous les labels externes ; à défaut, l'origine.
  const rattachements = [
    ...event.disciplineLinks.map((l) => l.discipline.name),
    ...event.externalDisciplineLabels,
  ];
  const rattachement =
    rattachements.length > 0
      ? rattachements.join(', ')
      : (event.origin?.name ?? null);'''
assert s.count(a) == 1, f"[4.calc] : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [4] (public)/events/[slug]/page.tsx : rattachement multi OK")
PY

echo
echo "== Éditions appliquées =="
if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then
  echo "AKFC_APPLY_ONLY=1 → tooling & commit sautés."; exit 0
fi

echo "== typecheck backend =="
pnpm --filter backend typecheck
echo "== typecheck web (serveur arrêté + .next vidé recommandé) =="
pnpm typecheck

echo "== typecheck OK -> commit =="
git add -A
git commit -m "feat(events): display all disciplines and external labels (admin table + public pages)"
echo "OK — E2c commité."