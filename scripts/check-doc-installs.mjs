#!/usr/bin/env node
// Garde : chaque dépendance déclarée dans un package.json du dépôt a SA commande d'installation
// dans la doc développeur (<Installer paquets="…" dans="…" [dev] />), une seule fois, au chapitre
// où elle sert pour la première fois. Et la doc n'installe rien qui ne soit pas déclaré.
// Un <Installer … par="create-next-app" /> raconte une installation faite par un générateur : il
// compte s'il correspond à une déclaration, et n'est pas une erreur sinon (le projet a pu déplacer
// la dépendance depuis).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PKGS = {
  racine: "package.json",
  web: "apps/web/package.json",
  backend: "packages/backend/package.json",
  contracts: "packages/contracts/package.json",
  "finder-core": "packages/finder-core/package.json",
};
const DOCS = path.join(ROOT, "apps/web/content/docs/dev");

const key = (dep, dans, dev) => `${dep} | ${dans}${dev ? " (dev)" : ""}`;

const declared = new Set();
for (const [dans, file] of Object.entries(PKGS)) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
  for (const [section, dev] of [["dependencies", false], ["devDependencies", true]]) {
    for (const dep of Object.keys(pkg[section] ?? {})) if (!dep.startsWith("@akfc/")) declared.add(key(dep, dans, dev));
  }
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith(".mdx") ? [path.join(dir, d.name)] : [],
  );

const seen = new Map(); // clé → chapitres (installations à taper)
const told = new Map(); // clé → chapitres (installations racontées, par un générateur)
const errors = [];
for (const file of walk(DOCS)) {
  const rel = path.relative(ROOT, file);
  // Le code cité (blocs ``` et `…`) ne compte pas : un exemple d'<Installer> n'installe rien.
  const text = fs
    .readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");
  for (const m of text.matchAll(/<Installer\b([^>]*?)\/>/g)) {
    const attrs = m[1];
    const paquets = /paquets="([^"]*)"/.exec(attrs)?.[1];
    const dans = /dans="([^"]*)"/.exec(attrs)?.[1];
    const dev = /\bdev\b(?!=)/.test(attrs.replace(/"[^"]*"/g, '""'));
    const par = /par="([^"]*)"/.test(attrs);
    if (!paquets || !dans) { errors.push(`${rel} : <Installer> sans paquets ou sans dans`); continue; }
    if (!(dans in PKGS)) { errors.push(`${rel} : dans="${dans}" n'est pas un paquet du dépôt (${Object.keys(PKGS).join(", ")})`); continue; }
    for (const dep of paquets.split(/\s+/).filter(Boolean)) {
      const k = key(dep, dans, dev);
      const map = par ? told : seen;
      map.set(k, [...(map.get(k) ?? []), rel]);
      if (!par && !declared.has(k)) errors.push(`${rel} : installe « ${k} », qui n'est déclaré dans aucun package.json à cet endroit`);
    }
  }
}
for (const [k, files] of seen) if (files.length > 1) errors.push(`« ${k} » installé plusieurs fois : ${files.join(", ")}`);
for (const k of declared) {
  const n = (seen.get(k)?.length ?? 0) + (told.get(k)?.length ?? 0);
  if (n === 0) errors.push(`« ${k} » : aucune commande d'installation dans la doc développeur`);
  else if (seen.has(k) && told.has(k)) errors.push(`« ${k} » : installé à la fois par un générateur (${told.get(k).join(", ")}) et à la main (${seen.get(k).join(", ")})`);
}

if (errors.length) {
  console.error(`✗ installations de la doc : ${errors.length} problème(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ installations de la doc : ${declared.size} dépendance(s) déclarée(s), chacune installée une fois`);
