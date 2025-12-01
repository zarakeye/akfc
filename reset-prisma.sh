#!/bin/bash
set -e

echo "🔄 Suppression du client Prisma existant..."
rm -rf node_modules/@prisma/client

echo "📦 Réinstallation de @prisma/client..."
pnpm add @prisma/client

echo "⚙️ Génération du client avec moteur binary..."
PRISMA_ENGINE_TYPE=binary pnpm prisma generate

echo "✅ Vérification..."
if [ -f node_modules/@prisma/client/runtime/index.js ]; then
  echo "Prisma client généré avec moteur binary ✔️"
else
  echo "❌ Toujours pas de runtime Node, vérifie ta config"
fi
