export interface SymbolEntry {
  filepath: string
  snippetRange: string
}

export const docsSymbolRegistry: Record<string, SymbolEntry> = {
  AuthLoginSchema: {
    filepath: "packages/contracts/schemas/auth/auth.schema.ts",
    snippetRange: "1-11",
  },

  createTRPCContext: {
    filepath: "packages/backend/src/trpc/core.ts",
    snippetRange: "1-35",
  },
}