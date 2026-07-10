import type { JSX, ReactNode } from "react";

/**
 * Rendu LECTURE d'un commentaire — mini-renderer ProseMirror maison.
 *
 * Pourquoi pas `generateHTML` de tiptap ? Parce que le backend valide le
 * contenu comme un objet OPAQUE : un utilisateur connecté malveillant
 * peut envoyer n'importe quel JSON via l'API (y compris un mark link
 * avec `href: "javascript:..."`). `generateHTML` + dangerouslySetInnerHTML
 * restituerait ce payload tel quel.
 *
 * Ce renderer inverse la logique : au lieu de faire confiance au
 * document, il ne rend QUE ce qu'il connaît — paragraphes, texte,
 * retours à la ligne, marks gras/italique/lien (protocoles http/https/
 * mailto uniquement). Tout node ou mark inconnu est ignoré en silence.
 * Zéro dangerouslySetInnerHTML, zéro dépendance.
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** Rend l'href s'il est sûr, null sinon (javascript:, data:, malformé…). */
function safeHref(href: unknown): string | null {
  if (typeof href !== "string" || href.trim() === "") return null;
  try {
    // Base factice : un href relatif est résolu (et donc autorisé, inoffensif).
    const url = new URL(href, "https://relative.invalid");
    return ALLOWED_PROTOCOLS.has(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Un node `text` et ses marks, emboîtés de l'intérieur vers l'extérieur. */
function renderText(node: Record<string, unknown>, key: number): ReactNode {
  const text = typeof node.text === "string" ? node.text : "";
  let rendered: ReactNode = text;

  const marks = Array.isArray(node.marks) ? node.marks : [];
  for (const rawMark of marks) {
    const mark = asRecord(rawMark);
    if (!mark) continue;

    if (mark.type === "bold") {
      rendered = <strong>{rendered}</strong>;
    } else if (mark.type === "italic") {
      rendered = <em>{rendered}</em>;
    } else if (mark.type === "link") {
      const href = safeHref(asRecord(mark.attrs)?.href);
      if (href) {
        rendered = (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {rendered}
          </a>
        );
      }
    }
    // mark inconnu → ignoré
  }

  return <span key={key}>{rendered}</span>;
}

/** Le contenu inline d'un paragraphe (text + hardBreak). */
function renderInline(content: unknown): ReactNode[] {
  if (!Array.isArray(content)) return [];
  const out: ReactNode[] = [];
  content.forEach((rawChild, i) => {
    const child = asRecord(rawChild);
    if (!child) return;
    if (child.type === "text") out.push(renderText(child, i));
    else if (child.type === "hardBreak") out.push(<br key={i} />);
    // node inline inconnu → ignoré
  });
  return out;
}

export function CommentContent({ doc }: { doc: unknown }): JSX.Element {
  // Garde défensive : un contenu legacy en texte brut reste affichable.
  if (typeof doc === "string") {
    return <p className="mt-1 whitespace-pre-wrap text-sm">{doc}</p>;
  }

  const root = asRecord(doc);
  const blocks = Array.isArray(root?.content) ? root.content : [];

  return (
    <div className="mt-1 text-sm">
      {blocks.map((rawBlock, i) => {
        const block = asRecord(rawBlock);
        if (block?.type !== "paragraph") return null; // bloc inconnu → ignoré
        const children = renderInline(block.content);
        return (
          <p key={i} className="whitespace-pre-wrap">
            {children.length > 0 ? children : <br />}
          </p>
        );
      })}
    </div>
  );
}
