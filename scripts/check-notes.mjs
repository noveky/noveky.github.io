import { readdir, readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const notesDirectory = new URL('../content/notes/', import.meta.url)
const files = (await readdir(notesDirectory)).filter((file) => file.endsWith('.md')).sort()
const errors = []

for (const file of files) {
  const source = await readFile(new URL(file, notesDirectory), 'utf8')
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  const slug = basename(file, '.md')

  if (!match) {
    errors.push(`${file}: missing frontmatter fenced by ---`)
    continue
  }

  const fields = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':')
        return separator === -1
          ? [line, '']
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      }),
  )

  for (const field of ['title', 'dek', 'date']) {
    if (!fields[field]) errors.push(`${file}: missing ${field}`)
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date ?? '')) {
    errors.push(`${file}: date must use YYYY-MM-DD`)
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`${file}: filename must be a lowercase hyphenated slug`)
  }

  if (!match[2].trim()) errors.push(`${file}: body is empty`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Checked ${files.length} note${files.length === 1 ? '' : 's'}.`)
