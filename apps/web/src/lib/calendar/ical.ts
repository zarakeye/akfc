/**
 * Générateur iCalendar (RFC 5545) minimal mais correct, pour exporter
 * les sessions d'un stage ou d'un événement vers Google Calendar,
 * Apple Calendar, Outlook, etc.
 *
 * ─── Modèle temporel ────────────────────────────────────────────────
 *
 * Une session AKFC = une **date** (jour pur, stocké à midi UTC pour
 * neutraliser le fuseau) + deux **heures HHMM** (`beginTime`/`endTime`)
 * en **heure locale du club** (Europe/Paris).
 *
 * On extrait le jour en UTC (`getUTC*`, cohérent avec le stockage midi
 * UTC), on y colle l'heure HHMM, et on marque le tout `TZID=Europe/Paris`.
 * Le client agenda interprète donc « 15 mars 10h00 » comme 10h heure de
 * Paris — exactement ce qu'on veut.
 *
 * C'est précisément ce qui rend HHMM exploitable pour l'agenda :
 * `1830` devient `T183000`, conversion directe sans calcul.
 */

const CLUB_TZID = "Europe/Paris";

export interface ICalEventInput {
  /** Identifiant unique et stable de l'événement (UID iCal). */
  uid: string;
  /** Jour de la session (stocké à midi UTC). */
  date: Date;
  /** Heure de début au format HHMM (1830 = 18h30). */
  beginTime: number;
  /** Heure de fin au format HHMM. */
  endTime: number;
  /** Titre affiché dans l'agenda. */
  summary: string;
  /** Lieu (optionnel). */
  location?: string | null;
  /** Description libre (optionnel). */
  description?: string | null;
}

export interface BuildICalendarOptions {
  /** Nom du calendrier affiché par certains clients (X-WR-CALNAME). */
  calendarName?: string;
}

/**
 * Construit le contenu d'un fichier `.ics` à partir d'une liste
 * d'événements. Retourne une string prête à servir avec le
 * Content-Type `text/calendar`.
 */
export function buildICalendar(
  events: ICalEventInput[],
  options: BuildICalendarOptions = {},
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AKFC//Agenda//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  if (options.calendarName) {
    lines.push(`X-WR-CALNAME:${escapeICalText(options.calendarName)}`);
    lines.push(`X-WR-TIMEZONE:${CLUB_TZID}`);
  }

  // Instant de génération (DTSTAMP). En route API (pas de composant
  // React) `new Date()` est parfaitement légitime.
  const stamp = toUtcStamp(new Date());

  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(
      `DTSTART;TZID=${CLUB_TZID}:${formatLocalICalStamp(ev.date, ev.beginTime)}`,
    );
    lines.push(`DTEND;TZID=${CLUB_TZID}:${formatLocalICalStamp(ev.date, ev.endTime)}`);
    lines.push(`SUMMARY:${escapeICalText(ev.summary)}`);
    if (ev.location) {
      lines.push(`LOCATION:${escapeICalText(ev.location)}`);
    }
    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeICalText(ev.description)}`);
    }
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  // RFC 5545 : séparateur de ligne = CRLF, lignes repliées à 75 car.
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Helpers internes                                                       */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * `Date` (jour, midi UTC) + HHMM → `YYYYMMDDTHHMMSS` (heure locale,
 * sans suffixe Z). Le jour est extrait en UTC pour être indépendant du
 * fuseau du runtime ; l'heure vient du HHMM. À marquer `TZID=Europe/Paris`.
 *
 * Exporté car réutilisé par `calendar-links.ts` pour construire le
 * paramètre `dates` des deep-links Google Calendar (même format).
 */
export function formatLocalICalStamp(date: Date, hhmm: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getUTCFullYear();
  const mo = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(Math.floor(hhmm / 100));
  const mi = pad(hhmm % 100);
  return `${y}${mo}${d}T${h}${mi}00`;
}

/** `Date` → `YYYYMMDDTHHMMSSZ` en UTC, pour DTSTAMP. */
function toUtcStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Échappe les caractères réservés iCal dans une valeur texte :
 * backslash, point-virgule, virgule, et retours à la ligne.
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Repli des lignes longues (RFC 5545 §3.1) : une ligne de plus de 75
 * caractères est coupée et poursuivie sur la ligne suivante préfixée
 * d'une espace. On compte en caractères (et non en octets) pour ne pas
 * couper au milieu d'un caractère accentué multi-octets — ce qui peut
 * faire dépasser légèrement 75 octets, toléré par les parsers.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let remaining = line.slice(75);
  while (remaining.length > 74) {
    chunks.push(" " + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  if (remaining.length > 0) chunks.push(" " + remaining);
  return chunks.join("\r\n");
}