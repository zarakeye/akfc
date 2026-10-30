/**
 * Début du jour EN COURS au club (Europe/Paris), exprimé comme minuit UTC de cette date.
 *
 * Les séances sont stockées à midi UTC de leur jour (voir `sessionDateSchema`). Pour savoir si une
 * séance est « à venir », on la compare à ce début de journée, et non à l'instant présent : une
 * séance d'aujourd'hui à 18h (stockée à 12h UTC) resterait sinon « passée » dès 13h ou 14h à Paris.
 *
 * Le jour est pris dans le fuseau du club, pas dans celui du serveur : à 0h30 à Paris (22h30 UTC
 * la veille), c'est bien aujourd'hui qui commence.
 */
export function startOfClubDay(now: Date): Date {
  // « en-CA » formate en AAAA-MM-JJ.
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${ymd}T00:00:00.000Z`);
}
