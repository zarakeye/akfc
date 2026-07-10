// "use client";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Props                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

export interface TimeInputProps {
  /**
   * Heure stockée au **format HHMM** (entier compact), aligné sur
   * `Course.beginTime`, `StageSession.beginTime`, `EventSession.beginTime`
   * dans le schéma Prisma.
   *
   * Convention :
   *   - `0`    → 00:00
   *   - `905`  → 09:05
   *   - `1830` → 18:30
   *   - `2359` → 23:59
   *
   * Les deux derniers digits sont les minutes (0-59), les autres sont
   * les heures (0-23). Format compact et **lisible en DB sans calcul
   * mental** (1830 se lit immédiatement comme 18h30).
   */
  value: number;
  /** Notifié au changement avec la nouvelle valeur HHMM. */
  onChange: (value: number) => void;
  /** Optionnel : ID de l'input des heures (pour `<label htmlFor>`). */
  id?: string;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Composant                                                              */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Saisie d'une heure en deux champs : heures (0-23) et minutes (0-59),
 * recomposés au **format HHMM** stocké en DB.
 *
 * Projection :
 *   HHMM    →   { hours: Math.floor(value/100), minutes: value%100 }
 *   hours, minutes  →   hours*100 + minutes
 *
 * Les valeurs hors borne sont **clampées au moment du changement**
 * plutôt qu'au blur — ça évite l'état intermédiaire incohérent
 * (par ex. 25h pendant la frappe). Si tu tapes 99 dans les minutes,
 * le champ corrige immédiatement à 59.
 *
 * Les minutes sont affichées sur 2 digits (`String(m).padStart(2, "0")`)
 * pour que `1805` apparaisse comme `18h05` plutôt que `18h5`.
 */
export function TimeInput({ value, onChange, id }: TimeInputProps) {
  const hours = Math.floor(value / 100);
  const minutes = value % 100;

  const handleHoursChange = (raw: number) => {
    const h = clamp(raw, 0, 23);
    onChange(h * 100 + minutes);
  };

  const handleMinutesChange = (raw: number) => {
    const m = clamp(raw, 0, 59);
    onChange(hours * 100 + m);
  };

  return (
    <div className="flex items-center gap-1">
      <input
        id={id}
        type="number"
        min={0}
        max={23}
        value={hours}
        onChange={(e) => handleHoursChange(Number(e.target.value))}
        className="w-16 rounded border border-input bg-background px-2 py-1 text-sm"
        aria-label="Heures"
      />
      <span className="text-sm text-muted-foreground">h</span>
      <input
        type="number"
        min={0}
        max={59}
        value={String(minutes).padStart(2, "0")}
        onChange={(e) => handleMinutesChange(Number(e.target.value))}
        className="w-16 rounded border border-input bg-background px-2 py-1 text-sm"
        aria-label="Minutes"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helper d'affichage                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}