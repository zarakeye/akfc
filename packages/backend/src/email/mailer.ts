import nodemailer, { type Transporter } from "nodemailer";

/**
 * Transport SMTP partagé (nodemailer), configuré par l'environnement :
 * SMTP_HOST, SMTP_PORT (587 par défaut : STARTTLS ; 465 : TLS direct), SMTP_USER, SMTP_PASSWORD.
 * Créé à la première utilisation : un SMTP absent ne bloque pas le démarrage de l'application.
 */
let transporter: Transporter | null = null;

/** Vrai si les variables SMTP indispensables sont renseignées. */
export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export function getMailTransport(): Transporter {
  if (!transporter) {
    const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      // 587 = port de soumission : STARTTLS exigé (jamais d'identifiants en clair).
      requireTLS: port === 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

/**
 * Adresse d'expédition : SMTP_FROM_NOREPLY si c'est une adresse complète, sinon le compte SMTP
 * lui-même (Gmail, par exemple, n'accepte que le compte authentifié ou ses alias déclarés).
 */
export function mailFrom(displayName: string): string {
  const noreply = process.env.SMTP_FROM_NOREPLY?.trim();
  const address = noreply && noreply.includes("@") ? noreply : (process.env.SMTP_USER ?? "");
  return `${displayName} <${address}>`;
}

/**
 * Adresse de réponse des e-mails automatiques (SMTP_REPLY_TO, ex. contact@akfc.fr) : un membre qui
 * répond écrit au club et non à l'adresse d'envoi. Non définie : pas d'en-tête Reply-To.
 */
export function mailReplyTo(): string | undefined {
  return process.env.SMTP_REPLY_TO?.trim() || undefined;
}

/** URL publique canonique du site (même règle que l'e-mail de bienvenue et config/siteUrl.ts). */
export function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://akfc.fr").replace(/\/+$/, "");
}
