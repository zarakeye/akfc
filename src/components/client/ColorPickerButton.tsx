import { useState, useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import PaletteIcon from "@mui/icons-material/Palette";
import { HexColorPicker } from "react-colorful";

export default function ColorPickerButton({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#000000");
  const rootRef = useRef<HTMLDivElement>(null);

  // Fermer sur clic extérieur
  useEffect(() => {
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

  const applyColor = (value: string) => {
    setColor(value);
    editor.chain().focus().setColor(value).run();
  };

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