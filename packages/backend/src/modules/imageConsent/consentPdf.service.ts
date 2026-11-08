import fs from "node:fs";
import path from "node:path";

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import { compareWishes, type ConsentChoices, type ImageUsageValue, type LegalAgeValue } from "@contracts/legal/imageConsent";

/**
 * Formulaire d'autorisation de droit à l'image (apps/web/public/documents), rempli par le serveur.
 *
 * - PRÉ-REMPLI : identité du membre (nom, prénom, date de naissance, e-mail) et qui signe (le membre
 *   majeur, ou son représentant légal : case cochée et nom du parent). Le reste est laissé à la main.
 * - RÉCAPITULATIF d'une autorisation donnée en ligne : en plus, les usages Oui / Non, le choix après
 *   le départ, « fait à / le », et dans le cadre de signature la mention de la confirmation en ligne.
 *   Le document est figé (champs aplatis) : c'est la preuve rangée avec les formulaires papier.
 *
 * Les noms de champs sont ceux du PDF : ne pas les changer sans mettre ce fichier à jour.
 */

const BLANK_FORM_FILE = "autorisation-droit-image.pdf";

/** Champs Oui / Non du PDF, par usage. */
const USAGE_FIELDS: Record<ImageUsageValue, string> = {
  MEMBER_SPACE: "espace",
  PUBLIC_SITE: "site",
  SOCIAL_NETWORKS: "reseaux",
  PRINT: "imprimes",
  PRESS: "presse",
};

/** Le PDF vierge : apps/web/public en dev (cwd = apps/web), /app/apps/web/public en production. */
function blankFormPath(): string {
  const candidates = [
    path.join(process.cwd(), "public", "documents", BLANK_FORM_FILE),
    path.join(process.cwd(), "apps", "web", "public", "documents", BLANK_FORM_FILE),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error(`Formulaire vierge introuvable (${BLANK_FORM_FILE}).`);
  return found;
}

export type ConsentPdfMember = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  birthDate: Date | null;
  legalAge: LegalAgeValue;
  guardianName: string | null;
  /** Qualité du parent (« mère »…), pré-remplie pour un mineur. */
  guardianRelation?: string | null;
};

export type ConsentPdfConfirmation = {
  usages: readonly ImageUsageValue[];
  keepAfterLeave: boolean | null;
  /** Nom du signataire : le membre, ou le parent. */
  signerName: string;
  /** Qualité du parent (« mère »…) ; null : le membre lui-même. */
  signerQuality: string | null;
  confirmedAt: Date;
  /** Lignes ajoutées dans le cadre de signature (voie, adresse vérifiée, version du texte). */
  signatureLines: string[];
  /**
   * Validation par le parent : les souhaits du membre mineur qu'il a reçus. Une page est ajoutée
   * à la fin du formulaire : souhaits du membre et choix du parent, côte à côte, changements marqués.
   */
  memberWishes?: ConsentChoices | null;
};

function frDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
}

function frDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "long", timeStyle: "short" });
}

/** Date de naissance : jour stocké à minuit UTC, affiché tel quel (pas de décalage de fuseau). */
function birthDay(d: Date): string {
  return d.toLocaleDateString("fr-FR", { timeZone: "UTC" });
}

/** Dernière page : souhaits du membre mineur et choix validés par son parent, ligne par ligne. */
function drawWishesPage(
  doc: PDFDocument,
  font: PDFFont,
  bold: PDFFont,
  confirmation: ConsentPdfConfirmation,
  wishes: ConsentChoices,
): void {
  const rows = compareWishes(wishes, confirmation);
  const page = doc.addPage([595.28, 841.89]);
  const ink = rgb(0.1, 0.1, 0.1);
  const grey = rgb(0.35, 0.35, 0.35);
  const accent = rgb(0.7, 0.1, 0.1);
  let y = 780;
  page.drawText("Souhaits du membre et choix du parent", { x: 50, y, size: 15, font: bold, color: ink });
  y -= 22;
  const changes = rows.filter((r) => r.changed).length;
  const intro = [
    "Le membre mineur a d'abord indiqué ses souhaits ; son parent référent les a reçus pré-cochés,",
    `pouvait les modifier, et a validé l'autorisation le ${frDateTime(confirmation.confirmedAt)}.`,
    "Ce sont les choix du parent qui font foi.",
    changes ? `${changes} réponse(s) modifiée(s) par le parent, marquée(s) ci-dessous.` : "Le parent n'a modifié aucune réponse.",
  ];
  for (const line of intro) {
    page.drawText(line, { x: 50, y, size: 9.5, font, color: grey });
    y -= 13;
  }
  y -= 14;
  const cols = [50, 260, 380, 500];
  ["Usage", "Souhait du membre", "Choix du parent", ""].forEach((h, i) =>
    page.drawText(h, { x: cols[i], y, size: 9.5, font: bold, color: ink }),
  );
  y -= 6;
  page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.7, color: grey });
  y -= 16;
  for (const r of rows) {
    const f = r.changed ? bold : font;
    const c = r.changed ? accent : ink;
    page.drawText(r.label, { x: cols[0], y, size: 9.5, font: f, color: c, maxWidth: 200 });
    page.drawText(r.wished, { x: cols[1], y, size: 9.5, font, color: ink });
    page.drawText(r.final, { x: cols[2], y, size: 9.5, font: f, color: c });
    if (r.changed) page.drawText("modifié", { x: cols[3], y, size: 9, font: bold, color: accent });
    y -= 18;
  }
}

/**
 * Formulaire rempli. Sans `confirmation` : pré-rempli à imprimer (champs laissés modifiables).
 * Avec : récapitulatif d'une autorisation en ligne, figé.
 */
export async function buildConsentPdf(
  member: ConsentPdfMember,
  confirmation?: ConsentPdfConfirmation,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(fs.readFileSync(blankFormPath()));
  const form = doc.getForm();
  const text = (name: string, value: string | null | undefined): void => {
    if (value) form.getTextField(name).setText(value);
  };
  const check = (name: string, on: boolean): void => {
    const box = form.getCheckBox(name);
    if (on) box.check();
    else box.uncheck();
  };

  text("membre_nom", member.lastName?.trim());
  text("membre_prenom", member.firstName?.trim());
  text("membre_naissance", member.birthDate ? birthDay(member.birthDate) : null);
  text("membre_email", member.email);
  const minor = member.legalAge === "MINOR";
  if (member.legalAge !== "UNKNOWN") {
    check("signataire_majeur", !minor);
    check("signataire_representant", minor);
  }
  if (minor) {
    text("representant_nom", member.guardianName?.trim());
    text("representant_qualite", member.guardianRelation?.trim());
  }

  if (confirmation) {
    if (minor) {
      text("representant_nom", confirmation.signerName);
      text("representant_qualite", confirmation.signerQuality);
    }
    for (const [usage, field] of Object.entries(USAGE_FIELDS) as [ImageUsageValue, string][]) {
      const yes = confirmation.usages.includes(usage);
      check(`usage_${field}_oui`, yes);
      check(`usage_${field}_non`, !yes);
    }
    if (confirmation.keepAfterLeave !== null) {
      check("depart_archives", confirmation.keepAfterLeave);
      check("depart_retrait", !confirmation.keepAfterLeave);
    }
    text("fait_a", "En ligne");
    text("fait_le", frDate(confirmation.confirmedAt));

    // Cadre de signature (page 1, sous « Signature du membre majeur ou du représentant légal »).
    const page = doc.getPage(0);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const lines = [
      `Confirmé en ligne par ${confirmation.signerName}${confirmation.signerQuality ? ` (${confirmation.signerQuality})` : ""}`,
      `le ${frDateTime(confirmation.confirmedAt)}`,
      ...confirmation.signatureLines,
    ];
    let y = 84;
    page.drawText(lines[0], { x: 53, y, size: 8.5, font: bold, color: rgb(0.1, 0.1, 0.1), maxWidth: 240 });
    for (const line of lines.slice(1)) {
      y -= 11;
      page.drawText(line, { x: 53, y, size: 8, font, color: rgb(0.2, 0.2, 0.2), maxWidth: 240 });
    }
    form.updateFieldAppearances(font);
    form.flatten();

    if (confirmation.memberWishes) drawWishesPage(doc, font, bold, confirmation, confirmation.memberWishes);
  }

  return doc.save();
}
