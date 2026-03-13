'use server';

import nodemail from "nodemailer";

const shortName = process.env.APP_SHORT_NAME || 'My App';

const transporter = nodemail.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

/**
 * Send a password email to the user.
 * @param {string} to - the recipient's email address
 * @param {string} subject - the email subject
 * @param {string} password - the temporary password
 * @returns {Promise<void>} - a promise that resolves when the email has been sent
 */
export default async function sendPasswordEmail(to: string, subject: string, password: string): Promise<void> {
  const mailInfo = {
    from: `${shortName} <${process.env.SMTP_FROM_NOREPLY}@${process.env.APP_DOLMAIN}>`,
    to,
    subject: `Création de compte ${shortName} réussie`,
    html: `
      <div style="font-family: Arial, sans-serif; maw-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Bienvenue à l'${shortName}, ${process.env.APP_FULL_NAME}</h2>
      <p>Felicitations, ton compte a bien été créé !</p>
      <p>Ton identifiant est : <strong>${to}</strong> et ton mot de passe provisoire : <strong>${password}</strong></p>
      <p>Ce mot de passe est temporaire. Lors de ta première connexion, tu devras le changer et renseigner tes informations personnelles.</p>
      <p>Si tu as des questions, n'hesitez pas a nous contacter sur <a href="mailto:${process.env.APP_SUPPORT_EMAIL}">${process.env.APP_SUPPORT_EMAIL}</a></p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #888;">Cet email a été envoyé automatiquement par l'application ${process.env.APP_FULL_NAME} et ne peut recevoir aucun message.</p>
      <p>Bonne année d'entraînement au sein de l'${process.env.APP_FULL_NAME}!</p>
      <a href="${process.env.NEXTAUTH_URL}/auth/signin" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Se connecter</a>
    `,
  };

  await transporter.sendMail(mailInfo);
}

