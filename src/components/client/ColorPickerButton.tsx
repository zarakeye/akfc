import { JSX, useState, useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import PaletteIcon from "@mui/icons-material/Palette";
import { HexColorPicker } from "react-colorful";

/**
 * Bouton pour appliquer une couleur de texte à la sélection actuelle.
 * Ouvre une palette de couleurs qui permet de choisir une couleur.
 * La couleur est stockée localement dans l'état `color`.
 * Lorsque la selection change, la couleur active est mise à jour en conséquence.
 * Si la sélection est vide ou que le curseur est dans un texte coloré, le bouton est désactivé.
 *
 * @param {Editor | null} editor - L'éditeur Tiptap actuel.
 * @returns {JSX.Element | null} Le bouton de palette de couleurs si l'éditeur est défini, sinon null.
 */
export default function ColorPickerButton({ editor }: { editor: Editor | null }): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#000000");
  const rootRef = useRef<HTMLDivElement>(null);

  // Fermer sur clic extérieur
  useEffect(() => {
    /**
     * Ferme la palette de couleurs si on clique en dehors
     * de la palette actuellement ouverte.
     * @param {MouseEvent} event - L'evenement de clic.
     */
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mettre à jour la couleur active quand la sélection/transaction change
  useEffect(() => {
    if (!editor) return; // 👈 test à l’intérieur, pas autour du hook

    /**
     * Mettre à jour la couleur active en fonction des attributs de style de texte de l'éditeur.
     * Si la couleur est définie, met à jour l'état local `color` avec cette valeur.
     */
    const updateColor = () => {
      const attrs = editor.getAttributes("textStyle");
      if (typeof attrs.color === "string" && attrs.color) {
        setColor(attrs.color);
      }
    };

    editor.on("selectionUpdate", updateColor);
    editor.on("transaction", updateColor);
    updateColor();

    return () => {
      editor.off("selectionUpdate", updateColor);
      editor.off("transaction", updateColor);
    };
  }, [editor]);

  if (!editor) return null;

  // Actif si sélection non vide OU curseur dans un texte coloré
  const hasSelectionOrMark =
    !editor.state.selection.empty || !!editor.getAttributes("textStyle").color;

  /**
   * Applique une couleur de texte à la sélection actuelle.
   * Met à jour l'état local `color` avec la valeur donnée.
   * @param {string} value - La couleur de texte à appliquer (format hexadécimal sans #)
   */
  const applyColor = (value: string) => {
    setColor(value);
    editor.chain().focus().setColor(value).run();
  };

  /**
   * Convert a hex color string to a RGB color string.
   * @param {string} hex - The hex color string (with or without #)
   * @returns {string} A RGB color string (e.g. "rgb(255, 0, 0)")
   */
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        disabled={!hasSelectionOrMark}
        onClick={() => setOpen(o => !o)}
        className={`p-2 border rounded ${
          hasSelectionOrMark ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
        }`}
        title="Couleur du texte"
      >
        <PaletteIcon style={{ fontSize: 20, color }} />
      </button>

      {open && (
        <div className="absolute mt-2 p-2 bg-white border rounded shadow z-50">
          <HexColorPicker color={color} onChange={applyColor} />
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">HEX:</span>
              <code className="px-1.5 py-0.5 bg-gray-100 rounded">{color}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">RGB:</span>
              <code className="px-1.5 py-0.5 bg-gray-100 rounded">{hexToRgb(color)}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}