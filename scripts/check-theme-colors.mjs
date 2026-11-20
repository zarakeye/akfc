#!/usr/bin/env node
// Garde : pas de couleur Tailwind écrite en dur dans le code du site (apps/web/src).
// Les couleurs passent par les rôles du thème déclarés dans globals.css (bg-card,
// text-muted-foreground, border-border, bg-brand, text-success, bg-warning-muted…), qui
// basculent tout seuls en mode sombre. Une classe comme `bg-white` ou `text-gray-600` reste
// claire sur un fond sombre : ce contrôle la signale avant le commit.
//
// Restent permis partout : le blanc et le noir translucides (`bg-black/50`, `text-white/70`),
// des voiles posés sur une image ou une vidéo, et les valeurs arbitraires (`bg-[#fff]`), qui
// disent explicitement qu'une couleur ne doit pas suivre le thème.
// Les fichiers d'EXCEPTIONS gardent des couleurs fixes pour une raison écrite à côté.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "apps/web/src");

const PALETTE =
  "white|black|gray|slate|zinc|neutral|stone|red|rose|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink";
const UTIL =
  "bg|text|border|border-[trblxy]|ring|ring-offset|divide|outline|placeholder|fill|stroke|from|to|via|shadow|decoration|accent|caret";
// Préfixes de variante éventuels (hover:, dark:, md:, [&_mark]:…), puis l'utilitaire et la couleur.
const CLASS = new RegExp(
  `(?<![\\w\\-/\\[])(?:[\\w\\-\\[\\]&>*_.():]+:)*(?:${UTIL})-(${PALETTE})(?:-(\\d{2,3}))?(\\/\\d+)?(?![\\w\\-])`,
  "g",
);

/** Fichier → raison de garder des couleurs fixes. */
const EXCEPTIONS = {
  // Façade sombre dans les deux thèmes.
  "features/app-shell/Header.tsx": "en-tête noir dans les deux thèmes",
  "features/app-shell/Footer.tsx": "pied de page noir dans les deux thèmes",
  "features/app-shell/UserMenu.tsx": "nom affiché dans l'en-tête noir",
  "features/app-shell/NotificationBell.tsx": "cloche posée dans l'en-tête noir",
  "features/app-shell/OurActivitiesMenu.tsx": "menu de l'en-tête noir",
  "features/app-shell/navEntries.ts": "reflet émeraude des menus de l'en-tête noir",
  "features/theme/ThemeToggle.tsx": "variante posée sur l'en-tête noir",
  "features/app-shell/ControlPanelSidebar.tsx": "barre latérale sombre dans les deux thèmes",
  "app/(admin)/dashboard/layout.tsx": "tiroir mobile de la barre latérale sombre",
  "features/breaking-news/BreakingNewsTicker.tsx": "bandeau défilant sur fond sombre",
  // Posé sur une image ou une vidéo, pas sur la page.
  "features/app-shell/HomeCarousel.tsx": "légendes et chevrons sur les photos",
  "features/gallery-public/GalleryLightbox.tsx": "visionneuse plein écran sur fond noir",
  "features/gallery-public/GalleryGrid.tsx": "icône lecture sur les vignettes vidéo",
  "features/gallery-crop/components/Cropper.tsx": "outil de recadrage sur fond noir",
  "features/avatar/CameraCapture.tsx": "flash blanc réel et boutons sur la vidéo",
  "features/avatar/AvatarUploader.tsx": "indicateur de chargement sur la photo",
  "features/media/PersoPhotoUploader.tsx": "bandeau d'état sur les vignettes",
  "features/admin/library/forms/DragNDropForm.tsx": "bandeau d'état sur les vignettes",
  "features/finder-core/components/GridItem.tsx": "icônes et badges posés sur les vignettes",
  "features/finder-core/components/FinderTreeFile.tsx": "icône lecture et point d'état des fichiers",
  "features/finder-core/components/PreviewPanel.tsx": "lecteur vidéo sur fond noir",
  "features/finder-core/dnd/dragGhost.ts": "vert de la zone de dépôt pendant le glisser",
  "features/finder-core/components/PickerCart.tsx": "bouton « retirer » posé sur les vignettes",
  "features/page-builder/blocks/media-text/editor.client.tsx": "vignette vidéo de l'éditeur",
  "features/page-builder/blocks/float-text/editor.client.tsx": "vignette vidéo de l'éditeur",
  "features/page-builder/blocks/image-gallery/editor.client.tsx": "icône lecture sur les vignettes",
  "features/admin/galleries/components/MediaItemsEditor.tsx": "icône lecture sur les vignettes",
  "app/(admin)/dashboard/galleries/[id]/page.tsx": "icône lecture sur les vignettes",
  "features/admin/site-settings/LogoPreview.tsx": "fond sombre choisi d'après la couleur du logo",
  "features/page-builder/components/SiteLogoImage.tsx": "fond sombre choisi d'après la couleur du logo",
  // Couleurs qui portent un sens, pareilles dans les deux thèmes.
  "features/tickets/ticketUi.ts": "badges de statut des demandes (avec variantes sombres)",
  "features/app-shell/DraftPageBadge.tsx": "pastille « page non publiée »",
  "features/editorial/editorialGate.tsx": "pastille « page non publiée »",
  "features/member-documents/DocumentsNavLink.tsx": "infobulle sombre",
  // Doc : palettes dessinées exprès.
  "features/docs/ui/Callout.tsx": "palette pastel des cinq types d'encadré",
  "features/docs/entities/EntityExplorer.tsx": "palette du schéma des entités (créer, lire, modifier, supprimer)",
  "features/docs/ui/FileIcon.tsx": "couleurs des types de fichiers",
  "features/docs/ui/CodeSnippet.tsx": "bloc de code sombre dans les deux thèmes",
  "features/docs/ui/CodeFenceClient.tsx": "bloc de code sombre dans les deux thèmes",
  "features/docs/ui/CodeExampleClient.tsx": "bloc de code sombre dans les deux thèmes",
  "features/docs/ui/CodeWalktroughClient.tsx": "bloc de code sombre dans les deux thèmes",
  "features/docs/ui/CodeHeader.tsx": "bloc de code sombre dans les deux thèmes",
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

const problems = [];
const seenExceptions = new Set();
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).split(path.sep).join("/");
  const lines = fs.readFileSync(file, "utf8").split("\n");
  let found = false;
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // commentaires
    for (const m of line.matchAll(CLASS)) {
      const [cls, color, , alpha] = m;
      if ((color === "white" || color === "black") && alpha) continue;
      found = true;
      if (!EXCEPTIONS[rel]) problems.push(`${rel}:${i + 1}  ${cls}`);
    }
  });
  if (found && EXCEPTIONS[rel]) seenExceptions.add(rel);
}

// Une exception qui n'a plus de couleur fixe doit sortir de la liste.
const stale = Object.keys(EXCEPTIONS).filter((f) => !seenExceptions.has(f));

if (problems.length || stale.length) {
  if (problems.length) {
    console.error(`✗ ${problems.length} couleur(s) écrite(s) en dur (utiliser un rôle du thème, voir globals.css) :`);
    for (const p of problems.slice(0, 30)) console.error(`  ${p}`);
    if (problems.length > 30) console.error(`  … et ${problems.length - 30} autre(s)`);
  }
  if (stale.length) {
    console.error("✗ Exception(s) devenue(s) inutile(s), à retirer de scripts/check-theme-colors.mjs :");
    for (const s of stale) console.error(`  ${s}`);
  }
  process.exit(1);
}
console.log(`✓ couleurs : rôles du thème partout (${Object.keys(EXCEPTIONS).length} exceptions justifiées)`);
