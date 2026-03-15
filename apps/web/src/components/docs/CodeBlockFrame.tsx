interface CodeBlockFrameProps {
  html: string
}

export function CodeBlockFrame({ html }: CodeBlockFrameProps) {
  return (
    <div
      className="docs-codeblock text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default CodeBlockFrame