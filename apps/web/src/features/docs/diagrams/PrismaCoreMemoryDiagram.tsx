import type { JSX } from "react"

/*
 * Noyau relationnel du projet (vue mentale) : la table de jointure disparaît, il reste les idées à
 * garder en tête. Pendant de PrismaCoreErdDiagram (vue technique).
 */

function Node({ cx, cy, title, sub, stroke }: { cx: number; cy: number; title: string; sub: string; stroke: string }): JSX.Element {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="135" ry="78" fill="#0f172a" stroke={stroke} strokeWidth="2.5" />
      <text x={cx} y={cy - 6} fill="#f8fafc" fontSize="24" fontWeight="700" textAnchor="middle">{title}</text>
      <text x={cx} y={cy + 24} fill="#94a3b8" fontSize="15" textAnchor="middle">{sub}</text>
    </g>
  )
}

const MARKERS = [
  ["a", "#60a5fa"],
  ["b", "#a78bfa"],
  ["c", "#34d399"],
] as const

export default function PrismaCoreMemoryDiagram(): JSX.Element {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="text-sm font-semibold text-foreground">Vue mentale — ce qu’il faut retenir</div>
        <p className="mt-1 text-sm text-muted-foreground">
          La table de jointure est retirée : il reste un membre, ses groupes et ses sessions.
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <svg viewBox="0 0 1120 560" className="h-auto min-w-[920px] w-full text-foreground" role="img" aria-label="Vue mentale : un membre appartient à des groupes, un groupe contient des sous-groupes, un membre ouvre des sessions">
          <defs>
            {MARKERS.map(([id, color]) => (
              <marker key={id} id={`memory-arrow-${id}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10Z" fill={color} />
              </marker>
            ))}
          </defs>

          <path d="M 335 230 L 640 230" stroke="#60a5fa" strokeWidth="3" markerEnd="url(#memory-arrow-a)" />
          <text x="488" y="205" fill="currentColor" fontSize="17" fontWeight="700" textAnchor="middle">appartient à des groupes</text>
          <text x="488" y="262" fill="currentColor" opacity="0.7" fontSize="14" textAnchor="middle">niveau : VIEWER ou EDITOR</text>

          <path d="M 200 310 L 200 388" stroke="#34d399" strokeWidth="3" markerEnd="url(#memory-arrow-c)" />
          <text x="214" y="356" fill="currentColor" fontSize="17" fontWeight="700">ouvre des sessions</text>

          <path d="M 905 290 C 1070 350, 1070 110, 905 170" fill="none" stroke="#a78bfa" strokeWidth="3" markerEnd="url(#memory-arrow-b)" />
          <text x="960" y="100" fill="currentColor" fontSize="17" fontWeight="700" textAnchor="middle">contient des sous-groupes</text>

          <Node cx={200} cy={230} title="Membre" sub="User" stroke="#60a5fa" />
          <Node cx={780} cy={230} title="Groupe" sub="MemberGroup" stroke="#a78bfa" />
          <Node cx={200} cy={466} title="Session" sub="Session" stroke="#34d399" />

          <rect x="560" y="390" width="440" height="110" rx="16" fill="#111827" stroke="#f59e0b" strokeWidth="2" />
          <text x="780" y="430" fill="#fde68a" fontSize="17" fontWeight="700" textAnchor="middle">Être administrateur</text>
          <text x="780" y="460" fill="#cbd5e1" fontSize="15" textAnchor="middle">= appartenir au groupe marqué isAdminGroup</text>
          <text x="780" y="484" fill="#94a3b8" fontSize="14" textAnchor="middle">aucun champ de User ne le dit</text>
        </svg>
      </div>
    </figure>
  )
}
