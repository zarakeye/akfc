#!/bin/bash
# Chantier BreakingNews — B.1 : modèle + migration + permission.
# ⚠ KILL LE SERVEUR DEV AVANT DE LANCER (rituel post-schéma inclus).
# À lancer depuis la RACINE du monorepo : bash apply_b1_breaking_news.sh
set -euo pipefail
[ -f pnpm-workspace.yaml ] || { echo "ERREUR : à lancer depuis la racine du monorepo." >&2; exit 1; }

read -r -p "Le serveur dev est-il coupé ? (o/N) " rep
[ "$rep" = "o" ] || { echo "Coupe-le d'abord (le rituel Prisma l'exige)." >&2; exit 1; }

echo "-> 1/5 Édition du schéma"
python3 << 'PYAPPLY'
MODEL = "\n\n// ═══════════════════════════════════════════════════════════════════════\n// BREAKING NEWS — la « voix du club »\n// ═══════════════════════════════════════════════════════════════════════\n\n/// Actualité courte, diffusée par le ruban défilant et la sidebar\n/// escamotable du site public. Distincte de Post (réflexions commentables,\n/// avec interactions) : la BreakingNews est UNIDIRECTIONNELLE — pas\n/// d'auteur affiché (c'est le club qui parle), pas de commentaires, pas\n/// de réactions.\n///\n/// `publicationDate` suit le pattern maison (Stage/Event/Post) :\n/// null = brouillon, future = programmée, passée = publiée.\n/// `expiresAt` retire l'actu du ruban et de la sidebar après échéance\n/// (null = sans expiration) — une actu est éphémère par nature.\nmodel BreakingNews {\n  id    Int    @id @default(autoincrement())\n  title String\n\n  /// Corps court en texte brut — le ruban défile mal du texte riche,\n  /// et une actu de deux lignes n'a pas besoin de ProseMirror.\n  body String\n\n  /// Lien optionnel, interne (« /#post-12 » — un vote sur le mur) ou\n  /// externe. C'est le CTA de la fiche Announcement, PAS la cible du\n  /// clic sur le ruban (qui ouvre la sidebar).\n  href String?\n\n  publicationDate DateTime?\n  expiresAt       DateTime?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([publicationDate])\n}\n"
from pathlib import Path
p = Path("prisma/schema.prisma")
src = p.read_text()
assert "model BreakingNews" not in src, "modele deja present ?"
if not src.endswith("\n"):
    src += "\n"
src += MODEL.lstrip("\n") if src.endswith("\n\n") else MODEL
p.write_text(src)
print("schema.prisma : modele BreakingNews ajoute")

PYAPPLY

echo "-> 2/5 prisma db push"
npx prisma db push

echo "-> 3/5 Comblement du trou de migration"
mkdir -p 'prisma/migrations/20260703090000_breaking_news'
cat > 'prisma/migrations/20260703090000_breaking_news/migration.sql' << 'SQLEOF'
-- BreakingNews : actualités courtes (ruban + sidebar du site public).
CREATE TABLE "BreakingNews" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "publicationDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakingNews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BreakingNews_publicationDate_idx" ON "BreakingNews"("publicationDate");

-- Permission de gestion (le rattachement aux rôles se fait via l'UI admin).
INSERT INTO "Permission" ("name", "description")
VALUES ('manage_breaking_news', 'Gérer les actualités (BreakingNews)')
ON CONFLICT ("name") DO NOTHING;
SQLEOF
npx prisma migrate resolve --applied 20260703090000_breaking_news

echo "-> 4/5 Insertion locale de la permission (resolve ne rejoue pas le SQL)"
set -a; source <(grep -E '^DATABASE_URL=' .env); set +a
psql "${DATABASE_URL%%\?*}" -c "INSERT INTO \"Permission\" (\"name\", \"description\") VALUES ('manage_breaking_news', 'Gérer les actualités (BreakingNews)') ON CONFLICT (\"name\") DO NOTHING;"

echo "-> 5/5 Rituel post-schéma"
rm -rf apps/web/.next
npx prisma generate

echo
echo "B.1 terminé. Rattache la permission 'manage_breaking_news' à ton rôle"
echo "admin via le dashboard (Permissions), puis relance le serveur dev."