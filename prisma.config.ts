import 'dotenv/config'
import { defineConfig } from 'prisma/config'

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