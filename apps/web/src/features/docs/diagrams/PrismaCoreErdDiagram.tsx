import type { JSX } from "react"

/*
 * Noyau relationnel du projet (vue technique) : membres, sessions, groupes et adhésions, tels que
 * prisma/schema.prisma les décrit. Les boîtes et les liens sont des données : modifier le schéma,
 * c'est modifier ces tableaux.
 */

type Field = { text: string; kind?: "pk" | "fk" | "plain" }
type Box = { x: number; y: number; w: number; title: string; subtitle: string; fields: Field[] }

const BOXES: Record<"user" | "session" | "membership" | "group", Box> = {
  user: {
    x: 40, y: 70, w: 300, title: "User", subtitle: "Le membre, et son compte",
    fields: [
      { text: "PK  id: String (cuid)", kind: "pk" },
      { text: "email: String @unique" },
      { text: "password: String (bcrypt)" },
      { text: "isFirstLogin: Boolean" },
    ],
  },
  session: {
    x: 40, y: 450, w: 300, title: "Session", subtitle: "Une connexion ouverte",
    fields: [
      { text: "PK  id: String (cuid)", kind: "pk" },
      { text: "FK  userId → User (Cascade)", kind: "fk" },
      { text: "expiresAt: DateTime" },
    ],
  },
  membership: {
    x: 450, y: 250, w: 390, title: "MemberGroupMembership", subtitle: "Table de jointure, avec un attribut",
    fields: [
      { text: "PK  id: String (cuid)", kind: "pk" },
      { text: "FK  userId → User (Cascade)", kind: "fk" },
      { text: "FK  groupId → MemberGroup (Cascade)", kind: "fk" },
      { text: "access: VIEWER | EDITOR" },
      { text: "@@unique([groupId, userId])" },
    ],
  },
  group: {
    x: 960, y: 70, w: 400, title: "MemberGroup", subtitle: "Liste de diffusion ou espace",
    fields: [
      { text: "PK  id: String (cuid)", kind: "pk" },
      { text: "name: String" },
      { text: "isCollaborative: Boolean" },
      { text: "isAdminGroup: Boolean" },
      { text: "FK  parentGroupId → MemberGroup (SetNull)", kind: "fk" },
    ],
  },
}

const ROW = 30
const HEAD = 100

function boxHeight(b: Box): number {
  return HEAD + b.fields.length * ROW + 24
}

function BoxView({ b }: { b: Box }): JSX.Element {
  const h = boxHeight(b)
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={h} rx="18" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      <text x={b.x + 24} y={b.y + 40} fill="#f8fafc" fontSize="24" fontWeight="700">{b.title}</text>
      <text x={b.x + 24} y={b.y + 66} fill="#94a3b8" fontSize="14">{b.subtitle}</text>
      <rect x={b.x + 16} y={b.y + 82} width={b.w - 32} height={b.fields.length * ROW + 22} rx="12" fill="#111827" stroke="#334155" strokeWidth="1.5" />
      {b.fields.map((f, i) => (
        <text
          key={f.text}
          x={b.x + 32}
          y={b.y + HEAD + 12 + i * ROW}
          fill={f.kind === "pk" ? "#93c5fd" : f.kind === "fk" ? "#c4b5fd" : "#cbd5e1"}
          fontSize="15"
          fontWeight={f.kind === "pk" ? 700 : 400}
        >
          {f.text}
        </text>
      ))}
    </g>
  )
}

function Edge({ d, label, lx, ly }: { d: string; label: string; lx: number; ly: number }): JSX.Element {
  return (
    <g>
      <path d={d} fill="none" stroke="#64748b" strokeWidth="2" markerEnd="url(#erd-arrow)" />
      <text x={lx} y={ly} fill="currentColor" fontSize="14" fontWeight="600" textAnchor="middle">{label}</text>
    </g>
  )
}

export default function PrismaCoreErdDiagram(): JSX.Element {
  const { user, session, membership, group } = BOXES
  const groupBottom = group.y + boxHeight(group)
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="text-sm font-semibold text-foreground">Noyau relationnel — membres, sessions, groupes</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue technique fidèle au schéma : clés primaires (bleu), clés étrangères (violet), table de jointure, et
          règle de suppression de chaque lien.
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <svg viewBox="0 0 1400 680" className="h-auto min-w-[1040px] w-full text-foreground" role="img" aria-label="Diagramme du noyau relationnel : User, Session, MemberGroupMembership, MemberGroup">
          <defs>
            <marker id="erd-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10Z" fill="#64748b" />
            </marker>
          </defs>
          <Edge d={`M ${user.x + 150} ${user.y + boxHeight(user)} L ${session.x + 150} ${session.y - 6}`} label="1 — N sessions" lx={user.x + 230} ly={(user.y + boxHeight(user) + session.y) / 2} />
          <Edge d={`M ${user.x + user.w} ${user.y + 150} C 400 160, 410 300, ${membership.x - 6} ${membership.y + 60}`} label="1 — N adhésions" lx={395} ly={205} />
          <Edge d={`M ${membership.x + membership.w} ${membership.y + 60} C 900 300, 900 200, ${group.x - 6} ${group.y + 150}`} label="N — 1 groupe" lx={900} ly={300} />
          <Edge d={`M ${group.x + group.w - 40} ${groupBottom} C ${group.x + group.w - 40} ${groupBottom + 90}, ${group.x + 60} ${groupBottom + 90}, ${group.x + 60} ${groupBottom + 6}`} label="parent — sous-groupes" lx={group.x + group.w / 2} ly={groupBottom + 100} />
          <BoxView b={user} />
          <BoxView b={session} />
          <BoxView b={membership} />
          <BoxView b={group} />
        </svg>
      </div>
    </figure>
  )
}
