import { STORAGE_REGION_LABEL, type StorageRegion } from "./legalSettings.schema";

/*
 * Les traitements de données personnelles du site, décrits UNE fois : la politique de
 * confidentialité (page publique) et le registre des traitements (art. 30 RGPD, tableau de bord)
 * en sont deux présentations. Toute évolution du site qui collecte une donnée nouvelle s'ajoute
 * ici, et les deux documents suivent.
 */

export type RetentionSettings = {
  accountRetentionMonths: number;
  ticketRetentionMonths: number;
  backupRetentionDays: number | null;
  /** Séjour dans la corbeille avant la suppression définitive (90 jours par défaut). */
  trashRetentionDays?: number;
  storageRegion: StorageRegion;
};

export type Processor = { name: string; role: string; location: string; transfer: string | null };

export type ProcessingActivity = {
  id: string;
  /** Intitulé court (registre). */
  name: string;
  /** Finalité, formulée pour la personne concernée (« Vous donner accès… »). */
  purpose: string;
  /** Personnes concernées. */
  people: string;
  /** Données traitées. */
  data: string;
  /** Base légale (art. 6 RGPD), en clair. */
  legalBasis: string;
  /** Qui y accède au sein du club. */
  recipients: string;
  /** Prestataires impliqués (noms de PROCESSORS). */
  processors: string[];
  retention: string;
};

const months = (n: number): string => (n % 12 === 0 ? `${n / 12} an${n / 12 > 1 ? "s" : ""}` : `${n} mois`);

export function processors(s: Pick<RetentionSettings, "storageRegion">): Processor[] {
  const dpf = "Société américaine adhérant au cadre de protection des données UE–États-Unis (Data Privacy Framework)";
  return [
    { name: "Hetzner Online GmbH", role: "Hébergement du site et de sa base de données", location: "Allemagne", transfer: null },
    { name: "OVH SAS", role: "Messagerie (e-mails du site, boîtes @akfc.fr)", location: "France", transfer: null },
    {
      name: "Cloudflare (R2)",
      role: "Stockage des photos, vidéos et documents, et des sauvegardes chiffrées",
      location: s.storageRegion ? STORAGE_REGION_LABEL[s.storageRegion] : "à préciser",
      transfer: dpf,
    },
  ];
}

export function processingActivities(s: RetentionSettings): ProcessingActivity[] {
  const account = `Pendant l'adhésion, puis ${months(s.accountRetentionMonths)} au plus après la fin de la dernière adhésion`;
  return [
    {
      id: "members",
      name: "Gestion des membres et de l'espace membres",
      purpose: "Vous donner accès à l'espace membres et organiser la vie du club (groupes, informations, documents).",
      people: "Membres de l'association",
      data: "Nom, prénom, e-mail, mot de passe (jamais stocké en clair), date d'adhésion, groupes, date de la dernière connexion ; si renseignés : date de naissance, majorité, téléphone, pseudo, photo, présentation",
      legalBasis: "Exécution de l'adhésion à l'association",
      recipients: "Administrateurs du site ; membres du bureau, en relais en cas d'indisponibilité (boîte e-mail du club)",
      processors: ["Hetzner Online GmbH", "Cloudflare (R2)"],
      retention: account,
    },
    {
      id: "instructors",
      name: "Présentation publique des instructeurs",
      purpose: "Présenter les enseignants sur la page publique « Nos instructeurs ».",
      people: "Instructeurs du club",
      data: "Nom, photo, biographie",
      legalBasis: "Accord de chaque instructeur",
      recipients: "Public (page en accès libre)",
      processors: ["Hetzner Online GmbH", "Cloudflare (R2)"],
      retention: "Tant que l'instructeur enseigne au club et ne retire pas son accord",
    },
    {
      id: "requests",
      name: "Suivi des demandes adressées au club",
      purpose: "Répondre à chaque demande écrite depuis l'espace membres et la suivre jusqu'à sa clôture.",
      people: "Membres qui écrivent au club",
      data: "Nom, e-mail, messages et réponses, historique de traitement",
      legalBasis: "Intérêt légitime de l'association (répondre à ses membres)",
      recipients: "Administrateurs et membres du groupe chargé de la catégorie de la demande",
      processors: ["Hetzner Online GmbH", "OVH SAS"],
      retention: `${months(s.ticketRetentionMonths)} après le dernier échange, puis suppression`,
    },
    {
      id: "correspondence",
      name: "Correspondance avec le public",
      purpose: "Répondre aux messages envoyés à l'adresse e-mail ou au WhatsApp de l'association.",
      people: "Toute personne qui écrit à l'association",
      data: "Nom, coordonnées, contenu des messages",
      legalBasis: "Intérêt légitime de l'association (répondre aux personnes qui la contactent)",
      recipients: "Membres du bureau qui consultent la boîte ou le WhatsApp de l'association",
      processors: ["OVH SAS"],
      retention: `${months(s.ticketRetentionMonths)} après le dernier échange`,
    },
    {
      id: "documents",
      name: "Mise à disposition de documents",
      purpose: "Vous transmettre les documents du club et vos documents personnels (licence, attestation…), visibles par vous seul et les administrateurs.",
      people: "Membres de l'association",
      data: "Documents déposés, destinataires, état de lecture",
      legalBasis: "Exécution de l'adhésion à l'association",
      recipients: "Le membre concerné, les membres des groupes destinataires, les administrateurs",
      processors: ["Hetzner Online GmbH", "Cloudflare (R2)"],
      retention: account,
    },
    {
      id: "media",
      name: "Photos et vidéos des activités",
      purpose: "Publier les photos et vidéos des cours, stages et événements, en galerie publique ou réservée aux membres.",
      people: "Membres et participants photographiés ; pour un membre mineur, son parent référent",
      data: "Image et voix des personnes reconnaissables ; identification des personnes sur chaque média (tags posés à la main par un administrateur, jamais de reconnaissance faciale) et, le cas échéant, leur refus d'un média précis ; formulaire d'autorisation signé (usages choisis, nom et qualité du signataire) ; pour un mineur, nom, qualité et e-mail du parent référent, les souhaits indiqués par le mineur et le lien envoyé à son parent (adresse, date, validité ; seule une empreinte du lien est gardée)",
      legalBasis: "Autorisation de la personne (de ses parents pour un mineur)",
      recipients: "Public ou membres, selon la galerie et les usages autorisés ; le formulaire : la personne et les administrateurs",
      processors: ["Hetzner Online GmbH", "Cloudflare (R2)"],
      retention:
        `Images : tant que l'autorisation n'est pas retirée, et au plus tard un an après le départ sauf accord pour un usage au-delà ; mises à la corbeille : supprimées définitivement ${s.trashRetentionDays ?? 90} jours après ; formulaire signé : durée de l'adhésion, puis 5 ans ; souhaits d'un mineur non validés : 30 jours après l'expiration du lien`,
    },
    {
      id: "security",
      name: "Sécurité du site",
      purpose: "Vous garder connecté et limiter les envois abusifs de messages.",
      people: "Utilisateurs du site",
      data: "Cookie de session ; adresse IP, utilisée sur le moment et non enregistrée",
      legalBasis: "Intérêt légitime de l'association (sécurité du site)",
      recipients: "Aucun",
      processors: ["Hetzner Online GmbH"],
      retention: s.backupRetentionDays
        ? `Session : 7 jours au plus ; sauvegardes : ${s.backupRetentionDays} jours`
        : "Session : 7 jours au plus",
    },
  ];
}

/** Mesures de sécurité communes à tous les traitements (registre, politique). */
export const SECURITY_MEASURES = [
  "Connexions chiffrées (HTTPS)",
  "Mots de passe stockés sous forme d'empreinte, jamais en clair",
  "Accès réservés aux personnes habilitées (administrateurs, groupes responsables)",
  "Documents et photos réservés servis seulement après vérification de la session",
  "Sauvegardes chiffrées chaque nuit, stockées à part",
] as const;
