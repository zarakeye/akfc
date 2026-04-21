// SvgDiagram.tsx
export function SvgDiagram({ svg }: { svg: string }) {
  return (
    <div
      className="my-8 overflow-x-auto rounded-2xl border bg-card p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}