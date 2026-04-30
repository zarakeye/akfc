import { JSX } from "react"

export default function PrismaCoreMemoryDiagram(): JSX.Element {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-5 py-4">
        <div className="text-sm font-semibold text-foreground">
          Vue mémorielle — ce qu’il faut retenir
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          On retire volontairement la table de jointure pour garder une image
          mentale lisible du système.
        </p>
      </div>

      <div className="overflow-x-auto p-4">
        <svg
          viewBox="0 0 1120 620"
          className="h-auto min-w-[920px] w-full"
          role="img"
          aria-label="Diagramme mémoriel du noyau auth RBAC sessions"
        >
          <defs>
            <marker
              id="memory-arrow-a"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill="#60a5fa" />
            </marker>
            <marker
              id="memory-arrow-b"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill="#a78bfa" />
            </marker>
            <marker
              id="memory-arrow-c"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0L10 5L0 10Z" fill="#34d399" />
            </marker>
          </defs>

          <ellipse cx="220" cy="290" rx="130" ry="86" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
          <text x="220" y="278" fill="#f8fafc" fontSize="24" fontWeight="700" textAnchor="middle">
            User
          </text>
          <text x="220" y="312" fill="#93c5fd" fontSize="16" fontWeight="700" textAnchor="middle">
            PK id: String
          </text>

          <ellipse cx="555" cy="165" rx="122" ry="76" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
          <text x="555" y="154" fill="#f8fafc" fontSize="24" fontWeight="700" textAnchor="middle">
            Role
          </text>
          <text x="555" y="188" fill="#93c5fd" fontSize="16" fontWeight="700" textAnchor="middle">
            PK id: Int
          </text>

          <ellipse cx="900" cy="165" rx="138" ry="76" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
          <text x="900" y="154" fill="#f8fafc" fontSize="24" fontWeight="700" textAnchor="middle">
            Permission
          </text>
          <text x="900" y="188" fill="#93c5fd" fontSize="16" fontWeight="700" textAnchor="middle">
            PK id: Int
          </text>

          <ellipse cx="555" cy="455" rx="132" ry="86" fill="#0f172a" stroke="#334155" strokeWidth="2.5" />
          <text x="555" y="443" fill="#f8fafc" fontSize="24" fontWeight="700" textAnchor="middle">
            Session
          </text>
          <text x="555" y="477" fill="#93c5fd" fontSize="16" fontWeight="700" textAnchor="middle">
            PK id: String
          </text>

          <path
            d="M345 240 C400 215, 445 195, 433 188"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="4"
            markerEnd="url(#memory-arrow-a)"
          />
          <text x="385" y="190" fill="#dbeafe" fontSize="15" fontWeight="600">
            belongs to
          </text>

          <path
            d="M677 165 C736 165, 770 165, 762 165"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="4"
            markerEnd="url(#memory-arrow-b)"
          />
          <text x="725" y="140" fill="#ede9fe" fontSize="15" fontWeight="600">
            has many
          </text>

          <path
            d="M325 360 C390 408, 445 438, 425 438"
            fill="none"
            stroke="#34d399"
            strokeWidth="4"
            markerEnd="url(#memory-arrow-c)"
          />
          <text x="378" y="420" fill="#d1fae5" fontSize="15" fontWeight="600">
            has many
          </text>
        </svg>
      </div>

      <figcaption className="border-t bg-muted/20 px-5 py-3 text-sm text-muted-foreground">
        Règle de lecture : <span className="font-medium text-foreground">un utilisateur appartient à un rôle</span>,{" "}
        <span className="font-medium text-foreground">un rôle donne des permissions</span>, et{" "}
        <span className="font-medium text-foreground">un utilisateur possède des sessions</span>.
      </figcaption>
    </figure>
  )
}