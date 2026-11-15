#!/usr/bin/env bash
# Base LOCALE uniquement — les 4 comptes @akfc.localdemo dont la majorité n'est pas renseignée :
#   - les 2 premiers (ordre alphabétique des adresses) → majeurs, renommés majeur1@ / majeur2@akfc.localdemo ;
#   - les 2 suivants → mineurs, renommés mineur1@ / mineur2@akfc.localdemo, avec un parent référent :
#     parent1@parent.localdemo (mère), parent2@parent.localdemo (père). Sans date de naissance :
#     c'est le parent qui la donnera en validant. Les e-mails partent dans la boîte de test locale.
# Les mots de passe ne changent pas. Rien d'autre n'est modifié.
#
# Sécurités : la garde prisma/db-target.mjs refuse une base qui n'est pas locale ; seuls les comptes
# @akfc.localdemo sont concernés (les autres, ex. membre@akfc.demo, ne sont pas touchés) ; le script
# s'arrête s'il n'en trouve pas exactement 4, ou si majeur1@akfc.localdemo
# existe déjà (déjà appliqué) ; il affiche la correspondance et attend votre « o » avant d'écrire.
# Pas de migration, pas de commit (aucun fichier du dépôt ne change).
#
# Usage (racine du repo) : bash localdemo-majorite.sh
set -euo pipefail

[ -f package.json ] && [ -f prisma/db-target.mjs ] || { echo "❌ à lancer à la racine du repo AKFC"; exit 1; }
[ -f .env ] || { echo "❌ .env introuvable"; exit 1; }

node --env-file=.env prisma/db-target.mjs >/dev/null || { echo "❌ base non locale : arrêt"; exit 1; }

TMP="prisma/.tmp-localdemo-majorite.mjs"
trap 'rm -f "$TMP"' EXIT
cat > "$TMP" <<'EOF'
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";

const DOMAIN = "@akfc.localdemo";
const prisma = new PrismaClient();
try {
  if (await prisma.user.findUnique({ where: { email: `majeur1${DOMAIN}` }, select: { id: true } })) {
    console.log("ℹ️  majeur1@akfc.localdemo existe déjà : rien à faire.");
    process.exit(0);
  }
  const users = await prisma.user.findMany({
    where: { legalAge: "UNKNOWN", email: { endsWith: DOMAIN } },
    select: { id: true, email: true, firstName: true, lastName: true },
    orderBy: { email: "asc" },
  });
  const others = await prisma.user.count({ where: { legalAge: "UNKNOWN", NOT: { email: { endsWith: DOMAIN } } } });
  if (others) console.log(`ℹ️  ${others} autre(s) compte(s) sans majorité, hors @akfc.localdemo : non touché(s).`);
  if (users.length !== 4) {
    console.log(`❌ attendu : 4 comptes @akfc.localdemo sans majorité ; trouvé ${users.length} :`);
    for (const u of users) console.log("   - " + u.email);
    process.exit(1);
  }
  const plan = [
    { u: users[0], email: `majeur1${DOMAIN}`, legalAge: "ADULT" },
    { u: users[1], email: `majeur2${DOMAIN}`, legalAge: "ADULT" },
    { u: users[2], email: `mineur1${DOMAIN}`, legalAge: "MINOR", n: 1, relation: "mère", parentFirst: "Claire" },
    { u: users[3], email: `mineur2${DOMAIN}`, legalAge: "MINOR", n: 2, relation: "père", parentFirst: "Marc" },
  ];
  for (const p of plan) {
    const label = p.legalAge === "ADULT" ? "majeur" : `mineur, parent : parent${p.n}@parent.localdemo (${p.relation})`;
    console.log(`   ${p.u.email.padEnd(28)} → ${p.email.padEnd(26)} ${label}`);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ok = (await rl.question("Appliquer ? (o/N) ")).trim().toLowerCase() === "o";
  rl.close();
  if (!ok) {
    console.log("Abandon, rien n'a changé.");
    process.exit(0);
  }
  await prisma.$transaction(
    plan.map((p) => {
      if (p.legalAge === "ADULT") {
        return prisma.user.update({ where: { id: p.u.id }, data: { email: p.email, legalAge: "ADULT" }, select: { id: true } });
      }
      // Le mineur doit avoir prénom et nom (le parent les voit) ; on ne complète que s'ils manquent.
      const firstName = p.u.firstName?.trim() || "Mineur";
      const lastName = p.u.lastName?.trim() || (p.n === 1 ? "Un" : "Deux");
      return prisma.user.update({
        where: { id: p.u.id },
        data: {
          email: p.email,
          firstName,
          lastName,
          legalAge: "MINOR",
          guardianName: `${p.parentFirst} ${lastName}`,
          guardianRelation: p.relation,
          guardianEmail: `parent${p.n}@parent.localdemo`,
          guardianPhone: `06 00 00 00 0${p.n}`,
        },
        select: { id: true },
      });
    }),
  );
  console.log("✅ 2 majeurs, 2 mineurs (mots de passe inchangés).");
} finally {
  await prisma.$disconnect();
}
EOF
node --env-file=.env "$TMP"