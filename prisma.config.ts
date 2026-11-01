import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { assertLocalTarget } from './prisma/db-target.mjs'

// Une commande qui touche la base (migrate, db, studio…) refuse une base distante : un .env copié
// du serveur migrerait sinon la production depuis un poste de développement. `generate`, `validate`
// et `format` ne lisent que le schéma : ils passent (l'installation lance `prisma generate`).
const SCHEMA_ONLY = ['generate', 'validate', 'format', 'version', '--version', '-v', '--help', '-h']
if (!process.argv.slice(2).some((arg) => SCHEMA_ONLY.includes(arg))) {
  assertLocalTarget(process.env.DATABASE_URL, 'La base')
  assertLocalTarget(process.env.DIRECT_DATABASE_URL, 'La base (connexion directe)')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_DATABASE_URL,
  },
  // generators: {
  //   client: {
  //     engineType: 'binary',
  //     binaryTargets: ['native', 'queryEngine', 'introspectionEngine'],
  //   }
  // },
  // migrations: {
  //   seed: 'prisma/seed.js',
  //   path: 'prisma/migrations',
  // },
})