import fs from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const sourceDir = path.join(projectRoot, "docs")
const targetDir = path.join(projectRoot, "apps", "web", "content", "docs")

const SECTION_LABELS = {
  architecture: "Architecture",
  tutorials: "Tutorials",
}

function toTitle(input) {
  return input
    .replace(/\.md$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function inferSection(relativePath) {
  const parts = relativePath.split(path.sep)
  if (parts.length > 1) {
    return SECTION_LABELS[parts[0]] ?? toTitle(parts[0])
  }
  return "Getting Started"
}

function inferOrder(fileName) {
  const match = fileName.match(/^(\d+)[-_]/)
  return match ? Number(match[1]) : undefined
}

function removeExistingFrontmatter(content) {
  if (!content.startsWith("---\n")) return content
  const end = content.indexOf("\n---\n", 4)
  if (end === -1) return content
  return content.slice(end + 5)
}

function buildFrontmatter({ title, description, section, order }) {
  const lines = ["---"]
  lines.push(`title: "${title.replace(/"/g, '\\"')}"`)
  if (description) {
    lines.push(`description: "${description.replace(/"/g, '\\"')}"`)
  }
  lines.push(`section: "${section.replace(/"/g, '\\"')}"`)
  if (typeof order === "number") {
    lines.push(`order: ${order}`)
  }
  lines.push("---", "")
  return lines.join("\n")
}

function inferDescription(content, fallbackTitle) {
  const cleaned = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#") && !line.startsWith("---"))
  return cleaned ? cleaned.slice(0, 140) : `${fallbackTitle} documentation page.`
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const result = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...await walk(fullPath))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      result.push(fullPath)
    }
  }

  return result
}

async function migrateFile(filePath) {
  const relativePath = path.relative(sourceDir, filePath)
  const relativeDir = path.dirname(relativePath)
  const fileName = path.basename(filePath)
  const baseName = fileName.replace(/\.md$/i, "")
  const targetPath = path.join(
    targetDir,
    relativeDir === "." ? "" : relativeDir,
    `${baseName}.mdx`
  )

  const raw = await fs.readFile(filePath, "utf8")
  const content = removeExistingFrontmatter(raw).trimStart()

  const title =
    content.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    toTitle(baseName)

  const description = inferDescription(content, title)
  const section = inferSection(relativePath)
  const order = inferOrder(fileName)

  const frontmatter = buildFrontmatter({
    title,
    description,
    section,
    order,
  })

  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, `${frontmatter}${content}\n`, "utf8")

  console.log(`✔ ${relativePath} -> ${path.relative(projectRoot, targetPath)}`)
}

async function main() {
  await ensureDir(targetDir)

  const files = await walk(sourceDir)
  if (!files.length) {
    console.log("No .md files found in /docs")
    return
  }

  for (const filePath of files) {
    await migrateFile(filePath)
  }

  console.log("\nMigration completed.")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
