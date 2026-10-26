import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Fichiers servis tels quels, écrits par d'autres (le worker de pdf.js, minifié) : pas notre code.
      "public/**",
    ],
  },
];

export default eslintConfig;
