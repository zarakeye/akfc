// apps/web/src/features/docs/ui/PropsProbe.tsx
interface PropsProbeProps {
  title?: string
  codeJson?: string
  language?: string
  children?: React.ReactNode
}

export default function PropsProbe(props: PropsProbeProps) {
  return (
    <div className="my-6 rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
      <p className="font-semibold">PropsProbe</p>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs">
        {JSON.stringify(props, null, 2)}
      </pre>
    </div>
  )
}