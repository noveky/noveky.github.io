import { cp, mkdir, readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const notesDirectory = join(root, 'content', 'notes')
const index = join(root, 'dist', 'index.html')

await cp(index, join(root, 'dist', '404.html'))

for (const file of await readdir(notesDirectory)) {
  if (!file.endsWith('.md')) continue
  const source = await readFile(join(notesDirectory, file), 'utf8')
  if (/^draft:\s*true\s*$/m.test(source)) continue

  const slug = basename(file, '.md')
  const route = join(root, 'dist', 'blog', slug)
  await mkdir(route, { recursive: true })
  await cp(index, join(route, 'index.html'))
}

await mkdir(join(root, 'dist', 'blog'), { recursive: true })
await cp(index, join(root, 'dist', 'blog', 'index.html'))
