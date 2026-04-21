export function parseMdxJsonString(value?: string): string {
  if (!value?.trim()) return ""

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === "string" ? parsed : ""
  } catch {
    return value
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\")
  }
}
