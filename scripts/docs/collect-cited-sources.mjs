#!/usr/bin/env node
// @ts-check
/**
 * Les fichiers que la documentation cite, recopiés dans la sortie autonome de Next.
 *
 * La doc lit le code qu'elle montre sur le disque, à chaque affichage (features/docs/lib/code.utils.ts).
 * En développement, c'est le dépôt. Dans l'image, il n'y a que la sortie autonome : le site compilé
 * et ce que le traceur a jugé utile, sans les sources de apps/web, ni les tests, ni les scripts. Les
 * extraits affichaient « Extrait introuvable ». Ce script, lancé dans le Dockerfile juste après la
 * construction, copie dans `.doc-sources/` de la sortie autonome chaque fichier cité, et lui seul :
 *   - par un attribut `filepath="…"` (CodeExample, CodeWalkthrough…) ;
 *   - par la ligne de chemin d'un bloc « ``` » (`// apps/web/proxy.ts (extrait)`).
 *
 *   node scripts/docs/collect-cited-sources.mjs [dossier de sortie]
 *   (défaut : apps/web/.next/standalone/apps/web/.doc-sources)
 *
 * Un fichier cité qui n'existe pas est signalé sans faire échouer : check-doc-snippets s'en charge.
 * Ne sort jamais du dépôt, et ne copie jamais un fichier .env.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DOCS = path.join(ROOT, "apps/web/content/docs");
const STANDALONE = path.join(ROOT, "apps/web/.next/standalone");
const dest = path.resolve(process.argv[2] ?? path.join(STANDALONE, "apps/web/.doc-sources"));

if (!process.argv[2] && !existsSync(STANDALONE)) {
  console.error("❌ apps/web/.next/standalone introuvable : à lancer après `pnpm --filter web build` (sortie autonome).");
  process.exit(1);
}

// La même règle que features/docs/lib/fenceIndex.ts : un chemin a une extension, ou c'est un
// Dockerfile, ou un fichier caché sans extension.
const PATH_LINE = /^\s*(?:\/\/|#|--)\s*(\S+\.[A-Za-z0-9]+|(?:\S+\/)?Dockerfile|(?:\S+\/)?\.[A-Za-z][\w-]*)(?:\s+\((.+)\))?\s*$/;

/** @param {string} source */
function citedPaths(source) {
  const found = new Set();
  for (const m of source.matchAll(/filepath="([^"]+)"/g)) found.add(m[1]);
  // La première ligne de chaque bloc « ``` ».
  for (const m of source.matchAll(/^```[^\n]*\n([^\n]*)/gm)) {
    const p = PATH_LINE.exec(m[1])?.[1];
    if (p) found.add(p);
  }
  return found;
}

const cited = new Set();
for (const entry of readdirSync(DOCS, { recursive: true })) {
  const file = path.join(DOCS, String(entry));
  if (file.endsWith(".mdx") && statSync(file).isFile()) {
    for (const p of citedPaths(readFileSync(file, "utf8"))) cited.add(p);
  }
}

let copied = 0;
const missing = [];
for (const p of [...cited].sort()) {
  // Un chemin relatif, dans le dépôt, et jamais un fichier d'environnement.
  if (path.isAbsolute(p) || p.split(/[\\/]/).includes("..") || /^\.env/.test(path.basename(p))) continue;
  // Les mêmes emplacements que la doc : depuis la racine, puis depuis apps/web (code.utils.ts).
  const from = [path.join(ROOT, p), path.join(ROOT, "apps/web", p)].find((f) => existsSync(f) && statSync(f).isFile());
  if (!from) {
    missing.push(p);
    continue;
  }
  // Rangé sous le chemin tel que la doc l'écrit : c'est celui qu'elle cherchera.
  const to = path.join(dest, p);
  mkdirSync(path.dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied++;
}
console.log(`✓ ${copied} fichiers cités par la doc copiés dans ${path.relative(ROOT, dest)}`);
if (missing.length) console.log(`  ${missing.length} chemins cités sans fichier : ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`);
