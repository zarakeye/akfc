import { FileCode2, FileJson, Database, Terminal } from "lucide-react"

interface FileIconProps {
  language?: string
  filepath?: string
}

export function FileIcon({ language, filepath }: FileIconProps) {
  const ext =
    filepath?.split(".").pop()?.toLowerCase() ??
    language?.toLowerCase()

  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
      return <FileCode2 size={14} className="text-blue-400" />

    case "json":
      return <FileJson size={14} className="text-yellow-400" />

    case "prisma":
      return <Database size={14} className="text-green-400" />

    case "bash":
    case "sh":
      return <Terminal size={14} className="text-gray-400" />

    default:
      return <FileCode2 size={14} className="text-white/60" />
  }
}

export default FileIcon