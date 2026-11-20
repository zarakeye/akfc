import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-e2e/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Fichiers servis tels quels, écrits par d'autres (le worker de pdf.js, minifié) : pas notre code.
      "public/**",
    ],
  },
  {
    // Les boîtes natives du navigateur (confirm, alert, prompt) bloquent la page, n'ont ni titre ni bouton nommé et ignorent
    // le thème : le site a sa propre fenêtre de confirmation (useConfirm, ConfirmDialog).
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "window", property: "confirm", message: "Utiliser useConfirm() (#components/ui/useConfirm.tsx)." },
        { object: "window", property: "alert", message: "Afficher le message dans la page, pas dans une boîte du navigateur." },
        { object: "window", property: "prompt", message: "Ouvrir un champ dans la page." },
      ],
      "no-restricted-globals": [
        "error",
        { name: "confirm", message: "Utiliser useConfirm() (#components/ui/useConfirm.tsx)." },
        { name: "alert", message: "Afficher le message dans la page, pas dans une boîte du navigateur." },
        { name: "prompt", message: "Ouvrir un champ dans la page." },
      ],
    },
  },
];

export default eslintConfig;
