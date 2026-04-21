import type { JSX } from "react"

export default function PrismaCoreErdDiagram(): JSX.Element {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="text-sm font-semibold text-foreground">
          Noyau relationnel — Auth / RBAC / Sessions
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue technique fidèle au modèle de données : entités, clés et table de
          jointure.
        </p>
      </div>

      <div className="overflow-x-auto p-4">
        <svg
          viewBox="0 0 1260 760"
          className="h-auto min-w-[980px] w-full"
          role="img"
          aria-label="Diagramme ERD du noyau auth RBAC sessions"
        >
          <defs>
            <marker
              id="erd-arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill="currentColor" />
            </marker>
          </defs>

          <rect x="0" y="0" width="1260" height="760" fill="transparent" />

          <g>
            <rect
              x="40"
              y="80"
              width="290"
              height="250"
              rx="18"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            <text x="68" y="120" fill="#f8fafc" fontSize="26" fontWeight="700">
              User
            </text>
            <text x="68" y="148" fill="#94a3b8" fontSize="14">
              Entité centrale du système
            </text>
            <rect
              x="60"
              y="175"
              width="250"
              height="125"
              rx="12"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="82" y="210" fill="#93c5fd" fontSize="16" fontWeight="700">
              PK  id: String
            </text>
            <text x="82" y="240" fill="#cbd5e1" fontSize="16">
              email: String @unique
            </text>
            <text x="82" y="270" fill="#cbd5e1" fontSize="16">
              password: String
            </text>
            <text x="82" y="300" fill="#cbd5e1" fontSize="16">
              FK  roleId: Int
            </text>
          </g>

          <g>
            <rect
              x="470"
              y="80"
              width="250"
              height="210"
              rx="18"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            <text x="498" y="120" fill="#f8fafc" fontSize="26" fontWeight="700">
              Role
            </text>
            <text x="498" y="148" fill="#94a3b8" fontSize="14">
              Niveau d’autorité
            </text>
            <rect
              x="490"
              y="175"
              width="210"
              height="82"
              rx="12"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="512" y="210" fill="#93c5fd" fontSize="16" fontWeight="700">
              PK  id: Int
            </text>
            <text x="512" y="240" fill="#cbd5e1" fontSize="16">
              name: String
            </text>
          </g>

          <g>
            <rect
              x="930"
              y="80"
              width="290"
              height="210"
              rx="18"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            <text x="958" y="120" fill="#f8fafc" fontSize="26" fontWeight="700">
              Permission
            </text>
            <text x="958" y="148" fill="#94a3b8" fontSize="14">
              Capacité accordée
            </text>
            <rect
              x="950"
              y="175"
              width="250"
              height="82"
              rx="12"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="972" y="210" fill="#93c5fd" fontSize="16" fontWeight="700">
              PK  id: Int
            </text>
            <text x="972" y="240" fill="#cbd5e1" fontSize="16">
              name: String
            </text>
          </g>

          <g>
            <rect
              x="625"
              y="460"
              width="330"
              height="195"
              rx="18"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            <text x="653" y="500" fill="#f8fafc" fontSize="26" fontWeight="700">
              RolePermission
            </text>
            <text x="653" y="528" fill="#94a3b8" fontSize="14">
              Table de jointure many-to-many
            </text>
            <rect
              x="645"
              y="555"
              width="290"
              height="72"
              rx="12"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="667" y="586" fill="#93c5fd" fontSize="16" fontWeight="700">
              PK / FK  roleId: Int
            </text>
            <text x="667" y="614" fill="#93c5fd" fontSize="16" fontWeight="700">
              PK / FK  permissionId: Int
            </text>
          </g>

          <g>
            <rect
              x="40"
              y="430"
              width="300"
              height="225"
              rx="18"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
            />
            <text x="68" y="470" fill="#f8fafc" fontSize="26" fontWeight="700">
              Session
            </text>
            <text x="68" y="498" fill="#94a3b8" fontSize="14">
              Persistance auth côté serveur
            </text>
            <rect
              x="60"
              y="525"
              width="260"
              height="95"
              rx="12"
              fill="#111827"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text x="82" y="556" fill="#93c5fd" fontSize="16" fontWeight="700">
              PK  id: String
            </text>
            <text x="82" y="584" fill="#cbd5e1" fontSize="16">
              FK  userId: String
            </text>
            <text x="82" y="612" fill="#cbd5e1" fontSize="16">
              expiresAt: DateTime
            </text>
          </g>

          <g stroke="#60a5fa" strokeWidth="3" fill="none" color="#60a5fa">
            <path
              d="M330 200 C390 200, 410 200, 470 200"
              markerEnd="url(#erd-arrow)"
            />
            <path
              d="M190 330 C190 380, 190 380, 190 430"
              markerEnd="url(#erd-arrow)"
            />
          </g>

          <g stroke="#a78bfa" strokeWidth="3" fill="none" color="#a78bfa">
            <path
              d="M645 290 C700 360, 740 400, 785 460"
              markerEnd="url(#erd-arrow)"
            />
            <path
              d="M1075 290 C1025 360, 975 400, 910 460"
              markerEnd="url(#erd-arrow)"
            />
          </g>

          <text x="360" y="180" fill="#dbeafe" fontSize="14" fontWeight="600">
            many users → one role
          </text>
          <text x="220" y="390" fill="#dbeafe" fontSize="14" fontWeight="600">
            one user → many sessions
          </text>
          <text x="690" y="382" fill="#ede9fe" fontSize="14" fontWeight="600">
            role ↔ join
          </text>
          <text x="958" y="382" fill="#ede9fe" fontSize="14" fontWeight="600">
            permission ↔ join
          </text>
        </svg>
      </div>

      <figcaption className="border-t bg-muted/20 px-5 py-3 text-sm text-muted-foreground">
        Lecture recommandée : commencez par <span className="font-medium text-foreground">User</span>,
        puis suivez ses dépendances vers <span className="font-medium text-foreground">Role</span> et{" "}
        <span className="font-medium text-foreground">Session</span>. La mécanique RBAC se lit ensuite
        via <span className="font-medium text-foreground">Role → RolePermission → Permission</span>.
      </figcaption>
    </figure>
  )
}