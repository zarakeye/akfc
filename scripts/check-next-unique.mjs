// Garde : UNE SEULE copie de Next.js dans pnpm-lock.yaml.
//
// pnpm installe une copie d'un paquet par combinaison de ses dépendances « pairs » (peer). Si
// apps/web et packages/backend ne voient pas les mêmes (par exemple deux versions de @types/node),
// chacun reçoit SA copie de next. Or le backend lit la requête par next/headers : avec une autre
// copie que celle du serveur, il n'y trouve ni cookies ni en-têtes, et la session disparaît.
// La garde échoue avant que ça n'arrive en production.
import fs from "node:fs";

const lock = fs.readFileSync("pnpm-lock.yaml", "utf8");
// Lockfile v9 : « packages: » décrit chaque version une fois ; « snapshots: » liste les copies installées.
const snapshots = lock.slice(lock.indexOf("\nsnapshots:"));
const copies = [...new Set([...snapshots.matchAll(/^ {2}next@([^:]+):$/gm)].map((m) => m[1]))];
if (copies.length !== 1) {
  console.error(`✗ Next.js : ${copies.length} copie(s) dans pnpm-lock.yaml (une seule attendue) :`);
  for (const c of copies) console.error(`  - next@${c.slice(0, 140)}`);
  console.error("  Alignez les dépendances « pairs » des paquets qui importent next (souvent @types/node).");
  process.exit(1);
}
console.log("✓ Next.js : une seule copie dans le lockfile");
