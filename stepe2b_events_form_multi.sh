#!/usr/bin/env bash
###############################################################################
# E2b — Bascule FRONT ADMIN : saisir 0..N disciplines sur un événement
#
#   1. events/router.ts : getByIdAdmin + getBySlug exposent `disciplineLinks`
#      (manquait à E2a — l'en-tête l'annonçait sans l'implémenter).
#   2. EventForm.tsx :
#      - EventFormInput : disciplineIds[] + externalDisciplineLabels[]
#      - initial élargi (Event & { disciplineLinks })
#      - état en tableaux (compat : retombe sur les champs dépréciés)
#      - UI : cases à cocher multi-disciplines + éditeur de labels (chips)
#
# Les pages PUBLIQUES ne sont pas touchées : elles lisent encore les colonnes
# dépréciées, que le dual-write d'E2a maintient → elles continuent de marcher
# (en n'affichant que la 1re discipline). Elles seront basculées en E2c.
#
# Requiert E1 + E2a appliqués et migrés.
###############################################################################
set -euo pipefail

cd "$(dirname "$0")"
echo "== Repo : $(pwd) =="
test -f package.json || { echo "ERREUR: lance-moi depuis la racine du monorepo."; exit 1; }

if ! grep -q "disciplineIds" packages/backend/src/modules/events/router.ts 2>/dev/null; then
  echo "ERREUR: E2a absent. Applique stepE2a_events_m2n_backend.sh d'abord."; exit 1
fi
if grep -q "externalDisciplineLabels" apps/web/src/features/admin/events/forms/EventForm.tsx 2>/dev/null; then
  echo "Déjà appliqué. Rien à faire."; exit 0
fi

# --------------------------------------------------------------------------- #
# 1. router : exposer disciplineLinks                                         #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "packages/backend/src/modules/events/router.ts"
s = open(p, encoding="utf-8").read()

# getByIdAdmin
a = '''      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
        },
      });'''
b = '''      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
          // Disciplines enseignées (0..N) — alimente le formulaire admin.
          disciplineLinks: {
            select: { disciplineId: true, discipline: { select: { name: true } } },
          },
        },
      });'''
assert s.count(a) == 1, f"[1.byId] : {s.count(a)} match(es)."
s = s.replace(a, b)

# getBySlug
a = '''        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
        },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
      }
      return event;
    }),

  create: protectedProcedure'''
b = '''        relationLoadStrategy: "join",
        include: {
          sessions: { orderBy: { date: "asc" } },
          // Disciplines enseignées (0..N) — pour l'affichage public.
          disciplineLinks: {
            select: {
              disciplineId: true,
              discipline: { select: { name: true, slug: true } },
            },
          },
        },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found." });
      }
      return event;
    }),

  create: protectedProcedure'''
assert s.count(a) == 1, f"[1.bySlug] : {s.count(a)} match(es)."
s = s.replace(a, b)

open(p, "w", encoding="utf-8").write(s)
print("  [1] events/router.ts : disciplineLinks exposés OK")
PY

# --------------------------------------------------------------------------- #
# 2. EventForm                                                                #
# --------------------------------------------------------------------------- #
python3 - << 'PY'
p = "apps/web/src/features/admin/events/forms/EventForm.tsx"
s = open(p, encoding="utf-8").read()

def sub(a, b, tag):
    global s
    assert s.count(a) == 1, f"[{tag}] : {s.count(a)} match(es) (attendu 1)."
    s = s.replace(a, b)

# 2.1 imports : trpc + retirer DisciplineSelect (mono)
sub('''import { DisciplineSelect } from "@features/admin/common/components/DisciplineSelect";
import { OriginSelect } from "@features/admin/common/components/OriginSelect";''',
'''import { trpc } from "@trpc/trpcClient";
import { OriginSelect } from "@features/admin/common/components/OriginSelect";''',
"2.1.imports")

# 2.2 EventFormInput : tableaux
sub('''  audience: Audience;
  disciplineId: number | null;
  externalDisciplineLabel: string | null;
  originId: number | null;''',
'''  audience: Audience;
  /** Disciplines ENSEIGNÉES présentées (0..N). */
  disciplineIds: number[];
  /** Disciplines NON enseignées, libellés libres (0..N). */
  externalDisciplineLabels: string[];
  originId: number | null;''',
"2.2.input")

# 2.3 initial : élargi
sub('''  /** Pré-remplissage en mode édition. Absent en création. */
  initial?: Event;''',
'''  /**
   * Pré-remplissage en mode édition. Absent en création.
   * `disciplineLinks` vient de `event.getByIdAdmin` (0..N disciplines).
   */
  initial?: Event & {
    disciplineLinks?: { disciplineId: number }[];
  };''',
"2.3.initial")

# 2.4 état en tableaux
sub('''  const [disciplineId, setDisciplineId] = useState<number>(
    initial?.disciplineId ?? 0,
  );
  const [externalDisciplineLabel, setExternalDisciplineLabel] =
    useState<string>(initial?.externalDisciplineLabel ?? "");''',
'''  // 0..N disciplines enseignées. Compat : si l'événement date d'avant la
  // jointure, on retombe sur la colonne dépréciée `disciplineId`.
  const [disciplineIds, setDisciplineIds] = useState<number[]>(
    initial?.disciplineLinks?.map((l) => l.disciplineId) ??
      (initial?.disciplineId != null ? [initial.disciplineId] : []),
  );
  // 0..N libellés de disciplines non enseignées (même compat).
  const [externalLabels, setExternalLabels] = useState<string[]>(
    initial?.externalDisciplineLabels?.length
      ? initial.externalDisciplineLabels
      : initial?.externalDisciplineLabel
        ? [initial.externalDisciplineLabel]
        : [],
  );
  const [labelDraft, setLabelDraft] = useState<string>("");

  const disciplinesQuery = trpc.discipline.getAll.useQuery();
  const allDisciplines = disciplinesQuery.data ?? [];

  const toggleDiscipline = (id: number) => {
    setDisciplineIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const addLabel = () => {
    const value = labelDraft.trim();
    if (!value) return;
    setExternalLabels((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setLabelDraft("");
  };''',
"2.4.state")

# 2.5 validation + payload
sub('''    const disciplineIdFinal = disciplineId === 0 ? null : disciplineId;
    const externalDisciplineLabelFinal =
      externalDisciplineLabel.trim() === ""
        ? null
        : externalDisciplineLabel.trim();
    const originIdFinal = originId;

    if (
      disciplineIdFinal === null &&
      externalDisciplineLabelFinal === null &&
      originIdFinal === null
    ) {''',
'''    // Un libellé encore dans le champ de saisie (pas « Ajouté ») compte
    // quand même : ne pas perdre silencieusement ce qui est tapé.
    const pendingLabel = labelDraft.trim();
    const externalLabelsFinal = pendingLabel
      ? [...new Set([...externalLabels, pendingLabel])]
      : externalLabels;
    const originIdFinal = originId;

    if (
      disciplineIds.length === 0 &&
      externalLabelsFinal.length === 0 &&
      originIdFinal === null
    ) {''',
"2.5.validation")

sub('''        audience,
        disciplineId: disciplineIdFinal,
        externalDisciplineLabel: externalDisciplineLabelFinal,
        originId: originIdFinal,''',
'''        audience,
        disciplineIds,
        externalDisciplineLabels: externalLabelsFinal,
        originId: originIdFinal,''',
"2.5.payload")

# 2.6 UI
sub('''        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Discipline du club</span>
          <DisciplineSelect value={disciplineId} onChange={setDisciplineId} />
          <span className="text-xs text-muted-foreground">
            Laisser sur « Aucune » pour un événement non rattaché à une
            discipline (repas, conférence culturelle…).
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">
            Discipline externe (libellé libre)
          </span>
          <input
            type="text"
            value={externalDisciplineLabel}
            onChange={(e) => setExternalDisciplineLabel(e.target.value)}
            placeholder="Cérémonie du thé"
            className="rounded border border-input bg-background px-2 py-1"
          />
        </label>''',
'''        <div className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Disciplines du club</span>
          {disciplinesQuery.isLoading ? (
            <span className="text-xs text-muted-foreground">Chargement…</span>
          ) : allDisciplines.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Aucune discipline enregistrée.
            </span>
          ) : (
            <div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto rounded border border-input p-2 sm:grid-cols-2">
              {allDisciplines.map((d) => (
                <label key={d.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={disciplineIds.includes(d.id)}
                    onChange={() => toggleDiscipline(d.id)}
                  />
                  <span>{d.name}</span>
                </label>
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            Coche 0, une ou plusieurs disciplines — un événement peut en
            présenter plusieurs (forum des associations, démonstration).
          </span>
        </div>

        <div className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">
            Disciplines externes (libellés libres)
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLabel();
                }
              }}
              placeholder="Calligraphie chinoise"
              className="flex-1 rounded border border-input bg-background px-2 py-1"
            />
            <button
              type="button"
              onClick={addLabel}
              disabled={labelDraft.trim() === ""}
              className="rounded border border-input px-2 py-1 text-xs disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
          {externalLabels.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-1">
              {externalLabels.map((lbl) => (
                <li
                  key={lbl}
                  className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
                >
                  <span>{lbl}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setExternalLabels((prev) => prev.filter((x) => x !== lbl))
                    }
                    aria-label={`Retirer ${lbl}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <span className="text-xs text-muted-foreground">
            Pour les domaines que le club n'enseigne pas.
          </span>
        </div>''',
"2.6.ui")

open(p, "w", encoding="utf-8").write(s)
print("  [2] EventForm.tsx : multi-disciplines + multi-labels OK")
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
git commit -m "feat(events): admin form supports 0..N disciplines and external labels"
echo "OK — E2b commité."