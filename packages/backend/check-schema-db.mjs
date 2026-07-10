import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Liste les colonnes réelles de la table MediaAsset en DB
const cols = await p.$queryRawUnsafe(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'MediaAsset'
  ORDER BY ordinal_position;
`);
console.log('Colonnes réelles de MediaAsset en DB:');
console.log(JSON.stringify(cols, null, 2));

// Les migrations enregistrées dans la table _prisma_migrations
const migs = await p.$queryRawUnsafe(`
  SELECT migration_name, finished_at, applied_steps_count
  FROM _prisma_migrations
  ORDER BY started_at;
`);
console.log('\nMigrations enregistrées en DB:');
console.log(JSON.stringify(migs, null, 2));

await p.$disconnect();
