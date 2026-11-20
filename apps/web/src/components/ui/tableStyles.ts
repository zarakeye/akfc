import type { TableProps } from "react-ts-tab-lib";

// La bibliothèque n'exporte pas ce type sous son nom : on le lit sur les props du tableau.
type StyleClassNames = NonNullable<TableProps<Record<string, unknown>>["styleClassNames"]>;

/**
 * Habillage commun des tableaux `react-ts-tab-lib`, sur les rôles du thème.
 *
 * Sans lui, la bibliothèque applique ses couleurs par défaut (en-tête gris foncé, champ de
 * recherche blanc, texte blanc) : écrites pour un fond sombre fixe, elles ne suivent pas le
 * thème, et Tailwind ne les génère même pas toutes (il ne lit pas `node_modules`). Les classes
 * passées ici viennent de notre code : elles sont générées, et basculent avec le mode sombre.
 * Les icônes (tri, navigation) sont des SVG dont la couleur est un attribut `fill` :
 * `currentColor` leur fait suivre la couleur du texte.
 */
export const TABLE_STYLES: StyleClassNames = {
  tableBorders: "border border-border",
  tableRounded: "rounded-md overflow-hidden",
  tableHeaders: {
    backgroundColor: "bg-muted",
    textColor: "text-foreground",
    borderColor: "border-border",
  },
  sortIndicatorColor: "currentColor",
  rows: {
    oddRowBackgroundColor: "bg-card",
    evenRowBackgroundColor: "bg-muted/40",
    textColor: "text-foreground",
  },
  rangeLengthOptions: {
    buttonBackgroundColor: "bg-card hover:bg-muted",
    buttonText: "text-center text-foreground",
    buttonBorderColor: "border-border",
    menuBackgroundColor: "bg-card hover:bg-muted",
    menuTextColor: "text-foreground",
    menuBorderColor: "border-border",
  },
  searchBar: {
    label: "text-sm text-muted-foreground",
    inputBorder: "border",
    inputRounded: "rounded-md",
    inputBackgroundColor: "bg-background",
    inputBorderColor: "border-border hover:border-ring",
    inputTextColor: "text-foreground",
  },
  pagination: {
    buttonBackgroundColor: "bg-card",
    buttonBackgroundColorHover: "hover:bg-muted py-[9px]",
    buttonBorderColor: "border-border",
    textColor: "text-foreground",
    navButtonsColor: "currentColor",
    currentPageButton: "bg-brand text-brand-foreground first:rounded-l-[20px] last:rounded-r-[20px]",
    otherpages: "text-foreground hover:bg-muted first:rounded-l-[20px] last:rounded-r-[20px] cursor-pointer",
  },
};
