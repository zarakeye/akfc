import { z } from "zod";

/**
 * Jour d'une séance (stage, évènement) : une DATE PURE, sans heure. Les horaires sont à part, au
 * format HHMM, en heure locale du club.
 *
 * Convention de stockage : midi UTC du jour choisi. Midi UTC tombe le même jour calendaire partout
 * en Europe (13h ou 14h à Paris) : lu avec `getUTC*`, le jour ne glisse jamais à la veille ou au
 * lendemain, quel que soit le fuseau du serveur ou du navigateur.
 *
 * Le formulaire envoie déjà midi UTC ; le schéma l'IMPOSE, pour qu'un appel direct à l'API
 * (« 2026-03-14 », soit minuit UTC) donne exactement la même valeur en base.
 */
export const sessionDateSchema = z.coerce
  .date()
  .transform((d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12)));
