#!/usr/bin/env bash
# AKFC — Footer : colonne « Horaires » alimentée par les cours (Centre de contrôle > Cours).
#  - lib : formatHHMMCompact (1800 → « 18h », 1830 → « 18h30 ») + DAY_LABELS (jours FR)
#  - features/app-shell/buildFooterSchedule.ts : mise en forme PURE (testée)
#  - Footer : lit les créneaux des disciplines PUBLIÉES ; discipline en gras (lien si page) ;
#    repli sur l'affichage statique si aucun créneau OU si la requête échoue (le footer est
#    rendu sur toutes les pages : jamais de 500 à cause de lui).
# Usage : bash apply-footer-schedule.sh
set -euo pipefail
[ -f "package.json" ] || { echo "ERREUR: racine du repo." >&2; exit 1; }
FMT_TIME="apps/web/src/lib/time/formatHHMM.ts"
FMT="apps/web/src/lib/format/index.ts"
FN="apps/web/src/features/app-shell/buildFooterSchedule.ts"
FOOTER="apps/web/src/features/app-shell/Footer.tsx"
for f in "$FMT_TIME" "$FMT" "$FOOTER"; do [ -f "$f" ] || { echo "ERREUR: $f introuvable." >&2; exit 1; }; done
[ -f "$FN" ] && grep -q 'buildFooterSchedule' "$FOOTER" && { echo "— déjà appliqué"; exit 0; }

cat > "$FN" <<'TS'
import { formatHHMMCompact } from "@lib/time/formatHHMM";
import { AUDIENCE_LABELS, DAY_LABELS } from "@lib/format";

/**
 * Met en forme les créneaux de cours pour la colonne « Horaires » du footer.
 * Fonction PURE (aucun accès base) : testable, et le footer reste lisible.
 *
 * - disciplines triées par nom ; jours du lundi au dimanche ; créneaux par heure ;
 * - plusieurs créneaux le même jour → une ligne (« 18h – 19h, 19h – 20h ») ;
 * - public visé ajouté SEULEMENT si la discipline a des créneaux pour des publics
 *   différents (sinon des lignes identiques seraient indiscernables).
 */
export type FooterScheduleRow = {
  day: string;
  beginTime: number;
  endTime: number;
  audience: string;
  discipline: { id: number; name: string; slug: string | null };
};

export type FooterScheduleGroup = {
  id: number;
  name: string;
  slug: string | null;
  days: { day: string; label: string; slots: string }[];
};

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export function buildFooterSchedule(rows: FooterScheduleRow[]): FooterScheduleGroup[] {
  const byDiscipline = new Map<number, FooterScheduleRow[]>();
  for (const r of rows) {
    const list = byDiscipline.get(r.discipline.id) ?? [];
    list.push(r);
    byDiscipline.set(r.discipline.id, list);
  }

  const groups: FooterScheduleGroup[] = [];
  for (const list of byDiscipline.values()) {
    const { id, name, slug } = list[0].discipline;
    const showAudience = new Set(list.map((r) => r.audience)).size > 1;
    const sorted = [...list].sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.beginTime - b.beginTime,
    );
    const days: FooterScheduleGroup["days"] = [];
    for (const r of sorted) {
      const slot =
        `${formatHHMMCompact(r.beginTime)} – ${formatHHMMCompact(r.endTime)}` +
        (showAudience ? ` (${AUDIENCE_LABELS[r.audience] ?? r.audience})` : "");
      const last = days[days.length - 1];
      if (last && last.day === r.day) last.slots += `, ${slot}`;
      else days.push({ day: r.day, label: (DAY_LABELS[r.day] ?? r.day).toLowerCase(), slots: slot });
    }
    groups.push({ id, name, slug, days });
  }
  return groups.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
TS
echo "  ok  $FN"

python3 - "$FMT_TIME" "$FMT" "$FOOTER" <<'PY'
import sys, pathlib
FMT_TIME, FMT, FOOTER = sys.argv[1:4]
def load(p): return pathlib.Path(p).read_text(encoding="utf-8")
def save(p, s): pathlib.Path(p).write_text(s, encoding="utf-8")
def one(s, old, new, label):
    assert s.count(old) == 1, f"{label} : ancre ×{s.count(old)}"
    return s.replace(old, new)

s = load(FMT_TIME)
if "formatHHMMCompact" not in s:
    s = s.rstrip() + '''

/**
 * Variante compacte : les minutes nulles sont omises.
 *
 *   formatHHMMCompact(1800)  // "18h"
 *   formatHHMMCompact(1830)  // "18h30"
 */
export function formatHHMMCompact(hhmm: number): string {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
'''
    save(FMT_TIME, s); print("  ok  formatHHMMCompact")

s = load(FMT)
if "DAY_LABELS" not in s:
    s = one(s, '  ALL_AGES: "Tous publics",\n};\n', '''  ALL_AGES: "Tous publics",
};

/** `Day` → libellé affichable (majuscule initiale). */
export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
  SUNDAY: "Dimanche",
};
''', "DAY_LABELS")
    save(FMT, s); print("  ok  DAY_LABELS")

s = load(FOOTER)
sig = "export default async function Footer(): Promise<JSX.Element> {\n"
assert s.count(sig) == 1, "Footer n'est pas un Server Component async (chantier logo non appliqué ?)"
imp = 'import { CLUB_INFO, FOOTER_LEGAL_LINKS } from "@features/app-shell/clubInfo";\n'
extra = 'import { buildFooterSchedule } from "@features/app-shell/buildFooterSchedule";\n'
if "@backend/prisma" not in s: extra += 'import { prisma } from "@backend/prisma";\n'
s = one(s, imp, imp + extra, "Footer imports")
s = one(s, sig, sig + '''  // Créneaux des disciplines PUBLIÉES pour la colonne « Horaires ». Le footer est rendu
  // sur TOUTES les pages : une erreur ici ne doit jamais casser le site → repli statique.
  const now = new Date();
  const schedule = buildFooterSchedule(
    await prisma.course
      .findMany({
        where: { discipline: { publicationDate: { not: null, lte: now } } },
        select: {
          day: true,
          beginTime: true,
          endTime: true,
          audience: true,
          discipline: { select: { id: true, name: true, slug: true } },
        },
      })
      .catch(() => []),
  );
''', "Footer requête")
s = one(s, "            {CLUB_INFO.hours.length > 0 ? (\n", '''            {schedule.length > 0 ? (
              <ul className="flex flex-col gap-3 text-sm text-white/80">
                {schedule.map((g) => (
                  <li key={g.id}>
                    {g.slug ? (
                      <Link
                        href={`/disciplines/${g.slug}`}
                        className="font-bold text-white transition-colors hover:text-emerald-300"
                      >
                        {g.name}
                      </Link>
                    ) : (
                      <span className="font-bold text-white">{g.name}</span>
                    )}
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 pl-3">
                      {g.days.map((d) => (
                        <div key={d.day} className="contents">
                          <dt>{d.label} :</dt>
                          <dd>{d.slots}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            ) : CLUB_INFO.hours.length > 0 ? (
''', "Footer colonne Horaires")
save(FOOTER, s); print("  ok  Footer : colonne Horaires branchée sur les cours")
PY

if [ "${AKFC_APPLY_ONLY:-0}" = "1" ]; then echo "APPLY_ONLY"; exit 0; fi
TC=$(node -e "process.exit((require('./package.json').scripts||{}).check?0:1)" 2>/dev/null && echo check || echo typecheck)
echo "typecheck via: pnpm $TC"
if ! pnpm "$TC" > /tmp/akfc_tc.log 2>&1; then
  echo "❌ ÉCHEC — pas de commit :"; grep -nE "conventions Next|error TS|Error:" /tmp/akfc_tc.log | head -15; tail -4 /tmp/akfc_tc.log; exit 1
fi
echo "✅ typecheck OK"; git add -A
git commit -m "feat(footer): horaires par discipline depuis les cours publiés (repli statique si vide ou erreur)" >/tmp/c.log 2>&1 && echo "✅ commit $(git rev-parse --short HEAD)" || { echo "commit KO"; tail -3 /tmp/c.log; }