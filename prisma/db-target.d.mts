/** Types de prisma/db-target.mjs (garde « pas la production depuis un poste de développement »). */
export function hostOf(url: string | undefined): string | null;
export function assertLocalTarget(url: string | undefined, what: string): void;
