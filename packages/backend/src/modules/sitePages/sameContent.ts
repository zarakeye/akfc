/*
 * Comparaison de contenus de page indépendante de l'ordre des clés (le JSONB de Postgres ne le
 * conserve pas) : sert à reconnaître un texte de départ jamais retouché, qu'on peut alors
 * remplacer par sa nouvelle version sans rien écraser de ce qu'un administrateur a écrit.
 */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .filter((k) => o[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

export function sameContent(a: unknown, b: unknown): boolean {
  return canonical(a) === canonical(b);
}
