import type { SearchFlags } from '@features/finder-core/state/useFinderStore';

/**
 * 🎨 Split un texte en segments alternant "match" / "no match" pour le
 * rendu surligné dans les résultats de recherche.
 *
 * ─── Algorithme ──────────────────────────────────────────────────────
 *
 * On reconstruit le matcher (même logique que côté backend dans
 * `media.searchRecursive`), puis on utilise `regex.exec` en boucle pour
 * collecter toutes les positions de match, et on découpe le texte.
 *
 * Pour un usage côté UI uniquement (pas de surface de sécurité ici, on
 * fait juste un rendu visuel), on est tolérant aux regex invalides :
 * si la construction échoue, on retourne le texte intact (pas de
 * highlight, pas de plantage).
 *
 * ─── Sortie ──────────────────────────────────────────────────────────
 *
 * Tableau de `{text, isMatch}` à mapper en JSX. Si jamais aucun match
 * (cas pathologique vu qu'on n'appelle ce helper que sur les résultats
 * du backend qui matchent par définition), on retourne `[{text, isMatch: false}]`
 * pour rester safe.
 */
export type HighlightSegment = {
  text: string;
  isMatch: boolean;
};

export function highlightMatches(
  text: string,
  query: string,
  flags: SearchFlags,
): HighlightSegment[] {
  if (!query) return [{ text, isMatch: false }];

  let re: RegExp;
  try {
    if (flags.useRegex) {
      // Force le flag global pour pouvoir itérer avec exec
      const regexFlags = flags.caseSensitive ? 'g' : 'gi';
      re = new RegExp(query, regexFlags);
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = flags.wholeWord ? `\\b${escaped}\\b` : escaped;
      const regexFlags = flags.caseSensitive ? 'g' : 'gi';
      re = new RegExp(pattern, regexFlags);
    }
  } catch {
    // Regex invalide → on retourne le texte intact, pas de surlignement
    return [{ text, isMatch: false }];
  }

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    // Protection contre une regex qui match l'empty string et boucle indéfiniment
    if (match.index === re.lastIndex) {
      re.lastIndex++;
      continue;
    }

    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isMatch: false });
    }
    segments.push({ text: match[0], isMatch: true });
    lastIndex = re.lastIndex;
  }

  // Reste après le dernier match
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMatch: false });
  }

  // Cas pas de match du tout
  if (segments.length === 0) {
    return [{ text, isMatch: false }];
  }

  return segments;
}
