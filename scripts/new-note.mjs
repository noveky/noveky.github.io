import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const title = process.argv.slice(2).join(' ').trim()

if (!title) {
  console.error('Usage: npm run note:new -- "A title for the note"')
  process.exit(1)
}

const slug = title
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

if (!slug) {
  console.error('The title must contain at least one letter or number.')
  process.exit(1)
}

const notesDirectory = fileURLToPath(new URL('../content/notes/', import.meta.url))
const path = join(notesDirectory, `${slug}.md`)
const today = new Date().toISOString().slice(0, 10)
const content = `---\ntitle: ${title}\ndek: A short sentence about this note.\ndate: ${today}\ndraft: true\n---\n\nBegin writing here.\n`

await mkdir(notesDirectory, { recursive: true })
try {
  await writeFile(path, content, { flag: 'wx' })
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error(`A note already exists at content/notes/${slug}.md`)
    process.exit(1)
  }
  throw error
}

console.log(`Created content/notes/${slug}.md`)
