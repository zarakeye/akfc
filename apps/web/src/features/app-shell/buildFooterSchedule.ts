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
