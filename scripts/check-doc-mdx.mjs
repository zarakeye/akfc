#!/usr/bin/env node
// Garde : chaque page de la doc (apps/web/content/docs/**/*.mdx) se compile en MDX.
// Une balise mal fermée ou une accolade de trop ne casse pas le typecheck : elle ne se voit
// qu'à l'ouverture de la page, en erreur 500. Ce contrôle la signale avant le commit.
// Même compilateur que le site (celui de next-mdx-remote) ; sans les plugins, qui ne changent
// rien à la syntaxe.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "apps/web/content/docs");

const fromWeb = createRequire(path.join(ROOT, "apps/web/package.json"));
const fromRemote = createRequire(fromWeb.resolve("next-mdx-remote/package.json"));
const { compile } = await import(pathToFileURL(fromRemote.resolve("@mdx-js/mdx")).href);

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
};
walk(DOCS);

const problems = [];
for (const file of files) {
  // Le frontmatter est lu à part par le site : on le retire, en gardant ses lignes pour que les
  // numéros de ligne des erreurs restent ceux du fichier.
  const src = fs.readFileSync(file, "utf8").replace(/^---\n[\s\S]*?\n---\n/, (fm) => "\n".repeat(fm.split("\n").length - 1));
  try {
    await compile(src);
  } catch (err) {
    const where = err.line ? `:${err.line}${err.column ? `:${err.column}` : ""}` : "";
    problems.push(`  - ${path.relative(ROOT, file)}${where} : ${String(err.reason ?? err.message).split("\n")[0]}`);
  }
}

if (problems.length > 0) {
  console.error(`✗ compilation MDX de la doc : ${problems.length} page(s) en erreur`);
  for (const p of problems) console.error(p);
  process.exit(1);
}
console.log(`✓ compilation MDX de la doc : ${files.length} page(s), toutes compilent`);
