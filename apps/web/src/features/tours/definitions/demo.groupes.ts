import type { Tour } from "../tour.types";

/**
 * La démo — un groupe de bout en bout : le créer, le retrouver dans la liste, y ajouter le membre
 * majeur, constater qu'il y est ; puis, plus tard, le supprimer. Contrairement au tuto du site
 * (« Créer un groupe »), ces tutos valident pour de vrai : la démo est jetable.
 *
 * Un parcours se rejoue : un second groupe du même nom peut exister, et le membre y être déjà.
 * Une étape déjà faite s'efface (`skipWhen`), sur la preuve qu'elle l'est.
 */
const NAME = "Équipe compétition";
const MEMBER = "membre@sandbox.local";

export const demoGroupesCreer: Tour = {
  id: "demo.groupes.creer",
  title: "Créer un groupe et y ajouter un membre",
  description: "Créer un groupe collaboratif, le retrouver dans la liste, y ajouter le membre majeur.",
  audience: "admin",
  routes: [/^\/dashboard\/groups/],
  startRoute: "/dashboard/groups",
  doc: "/docs/dev/membres/les-groupes",
  demoOnly: true,
  steps: [
    {
      target: "groups.list.create",
      title: "Ouvrez le formulaire",
      body: "Les groupes décident de ce que voient les membres. Cliquez sur « Créer un groupe ».",
      advance: { kind: "click" },
    },
    {
      target: "groups.form.name",
      title: "Le nom",
      body: "Un nom parlant pour les membres.",
      advance: { kind: "input" },
      expect: NAME,
    },
    {
      target: "groups.form.collaborative",
      title: "Un espace partagé",
      body: "Cochez « Espace collaboratif » : le groupe aura son dossier, avec des éditeurs et des lecteurs.",
      advance: { kind: "click" },
    },
    {
      target: "groups.form.submit",
      title: "Créer",
      body: "Cette fois, on crée pour de vrai : la démo est faite pour ça.",
      advance: { kind: "click" },
    },
    {
      target: "groups.list.table",
      targetText: NAME,
      title: "Le voilà dans la liste",
      body: "Le groupe est créé : collaboratif, sans membre pour l'instant.",
      advance: { kind: "next" },
    },
    {
      target: "groups.list.table",
      targetText: NAME,
      title: "Ouvrez-le",
      body: "Un clic sur sa ligne ouvre le groupe.",
      advance: { kind: "click" },
    },
    {
      target: "groups.detail.add",
      targetText: MEMBER,
      targetPick: "button",
      title: "Ajoutez le membre majeur",
      body: "La colonne « Ajouter » liste les membres qui n'y sont pas encore. Cliquez sur « Ajouter » en face du membre majeur.",
      advance: { kind: "click" },
      // Parcours rejoué : le membre est peut-être déjà dans ce groupe ; l'étape s'efface alors.
      skipWhen: { target: "groups.detail.members", text: MEMBER },
    },
    {
      target: "groups.detail.members",
      targetText: MEMBER,
      title: "Il est dans le groupe",
      body: "Éditeur par défaut : il peut déposer et ranger des fichiers dans l'espace du groupe. Un clic sur « éditeur » le passerait lecteur.",
      advance: { kind: "next" },
    },
    {
      target: "groups.detail.back",
      title: "Retour à la liste",
      body: "Vérifions dans la liste.",
      advance: { kind: "click" },
    },
    {
      target: "groups.list.table",
      targetText: NAME,
      title: "Un membre",
      body: "La colonne « Membres » le compte. Connectez-vous ensuite en membre majeur : l'espace du groupe l'attend dans « Mes espaces ».",
      advance: { kind: "next" },
    },
  ],
};

export const demoGroupesSupprimer: Tour = {
  id: "demo.groupes.supprimer",
  title: "Supprimer un groupe",
  description: "Retrouver le groupe dans la liste, l'ouvrir, le supprimer, constater qu'il a disparu.",
  audience: "admin",
  routes: [/^\/dashboard\/groups/],
  startRoute: "/dashboard/groups",
  doc: "/docs/dev/membres/les-groupes",
  demoOnly: true,
  steps: [
    {
      target: "groups.list.table",
      targetText: NAME,
      title: "Retrouvez-le",
      body: "Dans la liste, ouvrez le groupe créé tout à l'heure.",
      advance: { kind: "click" },
    },
    {
      target: "groups.detail.delete",
      title: "La zone dangereuse",
      body: "En bas de la page. Un groupe dont l'espace contient encore des fichiers ne peut pas être supprimé.",
      advance: { kind: "click" },
    },
    {
      target: "groups.detail.confirm-delete",
      title: "Confirmez",
      body: "Une confirmation, parce que l'espace du groupe part avec lui.",
      advance: { kind: "click" },
    },
    {
      target: "groups.list.table",
      title: "Disparu",
      body: `« ${NAME} » n'est plus dans la liste.`,
      advance: { kind: "next" },
    },
  ],
};
