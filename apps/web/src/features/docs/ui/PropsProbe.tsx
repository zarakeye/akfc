// apps/web/src/features/docs/ui/PropsProbe.tsx
interface PropsProbeProps {
  title?: string
  codeJson?: string
  language?: string
  children?: React.ReactNode
}

export default function PropsProbe(props: PropsProbeProps) {
  return (
    <div className="my-6 rounded-2xl border border-info/40 bg-info-muted p-4 text-sm text-info">
      <p className="font-semibold">PropsProbe</p>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs">
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  )
}