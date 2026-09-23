import MarkdownIt from 'markdown-it'

export interface BlogPost {
  slug: string
  title: string
  dek: string
  date: string
  readingTime: string
  contentHtml: string
}

const noteFiles = import.meta.glob('../content/notes/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
})

function parseFrontmatter(source: string, file: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`${file} is missing frontmatter fenced by ---`)

  const fields = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':')
        return separator === -1
          ? [line.trim(), '']
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      }),
  )

  return { fields, body: match[2].trim() }
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

function getSlug(file: string) {
  return file.split('/').pop()?.replace(/\.md$/, '') ?? ''
}

function parseNote(file: string, source: string): BlogPost | null {
  const { fields, body } = parseFrontmatter(source, file)
  if (fields.draft === 'true' && !import.meta.env.DEV) return null

  const words = body.match(/\S+/g)?.length ?? 0
  const minutes = Math.max(1, Math.ceil(words / 200))

  return {
    slug: getSlug(file),
    title: fields.title ?? 'Untitled note',
    dek: fields.dek ?? '',
    date: formatDate(fields.date ?? '1970-01-01'),
    readingTime: `${minutes} min read`,
    contentHtml: markdown.render(body),
  }
}

export const blogPosts = Object.entries(noteFiles)
  .map(([file, source]) => parseNote(file, source))
  .filter((post): post is BlogPost => post !== null)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

export function findBlogPost(slug: string | undefined) {
  return blogPosts.find((post) => post.slug === slug)
}
