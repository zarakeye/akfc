/**
 * La garde du poste de développement : `pnpm dev` ne démarre pas sur la base ou le stockage de la
 * production. Le hook de démarrage (instrumentation.ts) y écrirait aussitôt — segments, dossiers,
 * groupes —, puis chaque action du site local.
 *
 * Module à part, pour le runtime Node seul : instrumentation.ts est compilé AUSSI pour l'Edge, et
 * Turbopack y signale tout `process.exit` écrit dans le fichier, même derrière un `return`. Importé
 * sous `process.env.NEXT_RUNTIME === "nodejs"`, ce module n'entre pas dans la compilation Edge.
 */
export async function assertDevTargets(): Promise<void> {
  const { assertLocalTarget } = await import("../../../../prisma/db-target.mjs");
  try {
    assertLocalTarget(process.env.DATABASE_URL, "La base");
    assertLocalTarget(process.env.R2_ENDPOINT, "Le stockage");
  } catch (err) {
    console.error(`\n❌ ${err instanceof Error ? err.message : err}\n`);
    process.exit(1);
  }
}
