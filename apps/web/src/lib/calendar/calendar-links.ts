import { formatLocalICalStamp } from "@lib/calendar/ical";

/**
 * Génération des liens « Ajouter à l'agenda » deep-link pour Google
 * Calendar et Outlook web. Fonctions pures, appelables côté serveur
 * (les pages publiques sont des Server Components qui calculent ces
 * URLs au rendu).
 *
 * ─── Le piège du fuseau, géré différemment selon le service ─────────
 *
 * Une session AKFC a une heure **locale du club** (Europe/Paris). Les
 * deux services ne l'expriment pas pareil :
 *
 * - **Google** accepte un format « heure murale » + un paramètre `ctz`
 *   qui dit dans quel fuseau l'interpréter. On envoie donc le HHMM tel
 *   quel (via `formatLocalICalStamp`) + `ctz=Europe/Paris`. Aucun
 *   calcul de fuseau nécessaire, et c'est correct même si l'utilisateur
 *   est ailleurs dans le monde.
 *
 * - **Outlook** veut un instant absolu (ISO 8601). On convertit donc
 *   l'heure murale de Paris en UTC, en tenant compte du passage
 *   heure d'été / hiver (CET +01:00 / CEST +02:00) via `parisWallTimeToUTC`.
 */

const CLUB_TZID = "Europe/Paris";

export interface CalendarEventDetail {
  title: string;
  /** Jour de la session (stocké à midi UTC). */
  date: Date;
  /** Heure de début au format HHMM. */
  beginTime: number;
  /** Heure de fin au format HHMM. */
  endTime: number;
  location?: string | null;
  description?: string | null;
}

/**
 * Deep-link « Ajouter à Google Calendar ». Le format `dates` est
 * `YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS` en heure murale, accompagné de
 * `ctz=Europe/Paris` pour l'interprétation.
 */
export function googleCalendarUrl(event: CalendarEventDetail): string {
  const start = formatLocalICalStamp(event.date, event.beginTime);
  const end = formatLocalICalStamp(event.date, event.endTime);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    ctz: CLUB_TZID,
  });
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Deep-link « Ajouter à Outlook » (outlook.live.com, comptes
 * personnels). `startdt`/`enddt` en ISO 8601 UTC (instant absolu).
 *
 * Pour Outlook professionnel (Microsoft 365), l'hôte est
 * `outlook.office.com` — même chemin et mêmes paramètres. Si tes
 * adhérents sont surtout sur des comptes pro, change l'hôte ci-dessous
 * ou expose les deux liens.
 */
export function outlookCalendarUrl(event: CalendarEventDetail): string {
  const startUtc = parisWallTimeToUTC(event.date, event.beginTime).toISOString();
  const endUtc = parisWallTimeToUTC(event.date, event.endTime).toISOString();

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: startUtc,
    enddt: endUtc,
  });
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("body", event.description);

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Conversion heure murale Paris → instant UTC                            */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Convertit un « wall time » Europe/Paris (jour stocké à midi UTC +
 * HHMM) en instant UTC absolu, en tenant compte du DST.
 *
 * Méthode : on pose un instant candidat en supposant que l'heure murale
 * est en UTC, on demande à Paris quelle heure il afficherait pour cet
 * instant, et on en déduit l'offset (±60 ou ±120 min) à retrancher.
 *
 * Edge case négligeable : les deux heures inexistantes/ambiguës de la
 * nuit de bascule DST — sans impact pour des horaires de stage normaux.
 */
function parisWallTimeToUTC(date: Date, hhmm: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = Math.floor(hhmm / 100);
  const minute = hhmm % 100;

  const utcGuess = Date.UTC(year, month, day, hour, minute);
  const offsetMinutes = parisOffsetMinutes(new Date(utcGuess));
  return new Date(utcGuess - offsetMinutes * 60_000);
}

/**
 * Offset d'Europe/Paris (en minutes) pour un instant donné : différence
 * entre l'heure murale qu'affiche Paris et l'heure UTC. +60 en hiver,
 * +120 en été. Calculé via `Intl.formatToParts` (robuste, sans lib).
 */
function parisOffsetMinutes(instant: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: CLUB_TZID,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  // `hour` peut sortir "24" à minuit selon l'environnement → normalise.
  const hour = get("hour") % 24;
  const asWallUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second"),
  );
  return Math.round((asWallUTC - instant.getTime()) / 60_000);
}