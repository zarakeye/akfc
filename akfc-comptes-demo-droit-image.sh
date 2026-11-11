#!/usr/bin/env bash
# AKFC — ajoute à la base LOCALE du Mac deux comptes de démo pour tester le droit à l'image :
#   majeur@akfc.localdemo : membre majeur (il donne son autorisation en ligne, avec son mot de passe)
#   mineur@akfc.localdemo : membre mineur, fiche complète ; son parent référent est
#                           « Parent Démo » (mère), parent@akfc.localdemo — sans compte, c'est voulu :
#                           ses e-mails arrivent dans Mailpit (http://localhost:8026).
# Mot de passe : le même que ton compte membre de démo existant (membre…@akfc.localdemo) ; le script
# recopie son empreinte, sans jamais l'afficher. Mêmes groupes que lui (hors groupe Administrateurs).
#
# Sur le MAC uniquement, base locale seulement (garde prisma/db-target.mjs). Relançable : remet les
# deux comptes dans cet état. Ne modifie pas le repo, ne commite rien, ne touche à aucun autre compte.
# Usage (racine du repo) : bash akfc-comptes-demo-droit-image.sh
set -euo pipefail
cd "$(dirname "$0")"
[ -f pnpm-workspace.yaml ] || { echo "À lancer à la racine du repo."; exit 1; }
[ "$(uname)" = "Darwin" ] || { echo "❌ ce script est pour le Mac (poste de dev), pas pour le serveur. Rien n'a été touché."; exit 1; }
[ -f .env ] || { echo "❌ pas de .env à la racine."; exit 1; }
grep -q "guardianRelation" prisma/schema.prisma || { echo "❌ lancer d'abord apply-fix-circuit-parent.sh (et pnpm db:migrate)."; exit 1; }

# La garde du poste de dev : refuse une base (ou un stockage) hors de la machine.
node --env-file=.env prisma/db-target.mjs >/dev/null || { echo "❌ .env ne vise pas la base locale : arrêt, rien n'a été touché."; exit 1; }

node --env-file=.env --input-type=module - <<'JS'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DOMAIN = "@akfc.localdemo";
try {
  // La migration du circuit parent doit être passée sur la base locale.
  const col = await prisma.$queryRaw`SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'guardianRelation'`;
  if (col.length === 0) {
    console.log("❌ la base locale n'a pas la migration 20261213000000_guardian_consent : lance « pnpm db:migrate », puis relance ce script. Rien n'a été touché.");
    process.exitCode = 1;
    process.exit();
  }
  // Le modèle : ton compte membre de démo (le premier « membre…@akfc.localdemo » par ordre alphabétique).
  const template = await prisma.user.findFirst({
    where: { email: { startsWith: "membre", endsWith: DOMAIN } },
    orderBy: { email: "asc" },
    select: {
      email: true,
      password: true,
      memberGroupMemberships: { select: { groupId: true, access: true, group: { select: { isAdminGroup: true } } } },
    },
  });
  if (!template) {
    console.log(`❌ aucun compte membre…${DOMAIN} dans la base locale : rien n'a été créé.`);
    process.exit(1);
  }
  const groups = template.memberGroupMemberships.filter((m) => !m.group.isAdminGroup);

  const accounts = [
    {
      email: `majeur${DOMAIN}`,
      firstName: "Majeur",
      lastName: "Démo",
      legalAge: "ADULT",
      birthDate: null,
      birthDateVerified: false,
      guardianName: null,
      guardianRelation: null,
      guardianEmail: null,
    },
    {
      email: `mineur${DOMAIN}`,
      firstName: "Mineur",
      lastName: "Démo",
      legalAge: "MINOR",
      birthDate: new Date("2012-05-04T00:00:00.000Z"),
      birthDateVerified: true,
      guardianName: "Parent Démo",
      guardianRelation: "mère",
      guardianEmail: `parent${DOMAIN}`,
    },
  ];
  for (const a of accounts) {
    const data = { ...a, password: template.password, emailVerified: true, isFirstLogin: false };
    const user = await prisma.user.upsert({ where: { email: a.email }, update: data, create: data, select: { id: true } });
    for (const g of groups) {
      await prisma.memberGroupMembership.upsert({
        where: { groupId_userId: { groupId: g.groupId, userId: user.id } },
        update: {},
        create: { groupId: g.groupId, userId: user.id, access: g.access },
      });
    }
  }
  console.log(`✅ majeur${DOMAIN} et mineur${DOMAIN} prêts : même mot de passe que ${template.email}, ${groups.length} groupe(s).`);
  console.log(`   Parent du mineur : parent${DOMAIN} (sans compte) ; ses e-mails : http://localhost:8026`);
} catch (e) {
  // Le message utile de Prisma, sans sa pile : ses premières lignes non vides.
  const lines = String(e?.message ?? e).split("\n").map((l) => l.trim()).filter(Boolean);
  console.log("❌ " + lines.slice(-2).join(" — "));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
JS
[ $? -eq 0 ] || exit 1
echo "Test : connecte-toi en mineur@akfc.localdemo → profil → « Indiquer mes souhaits » → « Envoyer à mon parent »,"
echo "       puis ouvre l'e-mail du parent dans Mailpit et son lien, dans une fenêtre de navigation privée."