import { execFile } from 'node:child_process'
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const git = '/usr/bin/git'
const root = fileURLToPath(new URL('..', import.meta.url))
const notesDirectory = join(root, 'content', 'notes')
const managerPage = await readFile(new URL('../notes-manager/index.html', import.meta.url))
const romanFont = await readFile(new URL('../node_modules/@fontsource-variable/libre-baskerville/files/libre-baskerville-latin-wght-normal.woff2', import.meta.url))
const port = Number(process.env.PORT ?? 15177)

function parseNote(file, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`${file}: missing frontmatter`)
  const fields = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(':')
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
  }))
  return { slug: basename(file, '.md'), title: fields.title ?? '', dek: fields.dek ?? '', date: fields.date ?? '', draft: fields.draft === 'true', body: match[2].trim() }
}

async function listNotes() {
  const files = (await readdir(notesDirectory)).filter((file) => file.endsWith('.md')).sort()
  return Promise.all(files.map(async (file) => parseNote(file, await readFile(join(notesDirectory, file), 'utf8'))))
}

function validSlug(slug) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) }
function validateNote(note) {
  if (!note || !note.title || !note.slug || !note.dek || !note.date || !note.body?.trim()) return 'Title, summary, date, and body are required.'
  if (!validSlug(note.slug)) return 'Slug must use lowercase letters, numbers, and hyphens.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(note.date)) return 'Date must use YYYY-MM-DD.'
  if ([note.title, note.dek, note.date].some((value) => /[\r\n]/.test(value))) return 'Title, summary, and date must each fit on one line.'
  return null
}
function send(response, status, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' })
  response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
}
async function jsonBody(request) { let body = ''; for await (const chunk of request) body += chunk; return JSON.parse(body) }
function noteSource(note) { return `---\ntitle: ${note.title}\ndek: ${note.dek}\ndate: ${note.date}${note.draft ? '\ndraft: true' : ''}\n---\n\n${note.body.trim()}\n` }
function commandMessage(error) { return error?.stderr?.trim() || error?.stdout?.trim() || error?.message || 'Command failed.' }

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`)
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent)
    if (request.method === 'GET' && url.pathname === '/fonts/libre-baskerville-latin-wght-normal.woff2') return send(response, 200, romanFont, 'font/woff2')
    if (request.method === 'GET' && url.pathname === '/') return send(response, 200, managerPage, 'text/html; charset=utf-8')
    if (request.method === 'GET' && url.pathname === '/api/notes') return send(response, 200, await listNotes())
    if (segments[0] === 'api' && segments[1] === 'notes' && segments[2]) {
      const slug = segments[2]
      if (!validSlug(slug)) return send(response, 400, 'Invalid note slug')
      const path = join(notesDirectory, `${slug}.md`)
      if (request.method === 'GET') {
        try { return send(response, 200, parseNote(`${slug}.md`, await readFile(path, 'utf8'))) } catch { return send(response, 404, 'Note not found') }
      }
      if (request.method === 'DELETE') { await unlink(path); return send(response, 200, { ok: true }) }
      if (request.method === 'PUT') {
        const note = await jsonBody(request); if (note.slug !== slug) return send(response, 400, 'Changing a slug is not supported; create a new note instead.')
        const validationError = validateNote(note); if (validationError) return send(response, 400, validationError)
        await writeFile(path, noteSource(note)); return send(response, 200, { ...note, slug })
      }
    }
    if (request.method === 'POST' && segments[0] === 'api' && segments[1] === 'notes' && !segments[2]) {
      const note = await jsonBody(request); const validationError = validateNote(note); if (validationError) return send(response, 400, validationError)
      await mkdir(notesDirectory, { recursive: true }); const path = join(notesDirectory, `${note.slug}.md`)
      try { await writeFile(path, noteSource(note), { flag: 'wx' }) } catch { return send(response, 409, 'A note with this slug already exists.') }
      return send(response, 201, { ...note })
    }
    if (request.method === 'POST' && url.pathname === '/api/rebuild') {
      await execFileAsync('/usr/local/bin/npm', ['run', 'build'], { cwd: root, maxBuffer: 10 * 1024 * 1024 })
      return send(response, 200, { ok: true })
    }
    if (request.method === 'POST' && url.pathname === '/api/publish/github') {
      await execFileAsync('/usr/local/bin/npm', ['run', 'note:check'], { cwd: root, maxBuffer: 10 * 1024 * 1024 })
      await execFileAsync(git, ['add', '--', 'content/notes'], { cwd: root, maxBuffer: 10 * 1024 * 1024 })

      let hasChanges = false
      try {
        await execFileAsync(git, ['diff', '--cached', '--quiet', '--', 'content/notes'], { cwd: root })
      } catch (error) {
        if (error.code !== 1) throw error
        hasChanges = true
      }

      if (!hasChanges) return send(response, 200, 'No unpublished note changes.')

      await execFileAsync(git, ['commit', '--only', '-m', 'Publish notes from Notes Desk', '--', 'content/notes'], { cwd: root, maxBuffer: 10 * 1024 * 1024 })
      await execFileAsync(git, ['push', 'origin', 'main'], { cwd: root, maxBuffer: 10 * 1024 * 1024 })
      return send(response, 200, 'Published to GitHub Pages. Deployment is now building.')
    }
    send(response, 404, 'Not found')
  } catch (error) { console.error(error); send(response, 500, commandMessage(error)) }
})

server.listen(port, '127.0.0.1', () => console.log(`Notes Desk listening at http://127.0.0.1:${port}`))
