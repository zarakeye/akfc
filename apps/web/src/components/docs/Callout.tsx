import type { ReactNode } from "react"

type CalloutType =
  | "info"
  | "tip"
  | "warning"
  | "danger"

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

const styles: Record<CalloutType, string> = {
  info: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  tip: "border-green-500 bg-green-50 dark:bg-green-950/30",
  warning: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
  danger: "border-red-500 bg-red-50 dark:bg-red-950/30",
}

export function Callout({
  type = "info",
  title,
  children,
}: CalloutProps) {
  return (
    <div
      className={`my-6 rounded-lg border-l-4 p-4 ${styles[type]}`}
    >
      {title && (
        <p className="mb-2 font-semibold">
          {title}
        </p>
      )}

      <div className="text-sm leading-7">
        {children}
      </div>
    </div>
  )
}