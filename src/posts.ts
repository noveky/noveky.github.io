export interface BlogPost {
  slug: string
  title: string
  dek: string
  date: string
  readingTime: string
  paragraphs: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'a-place-for-notes',
    title: 'A place for notes',
    dek: 'Why a small personal site is still worth making when the network already has every kind of platform.',
    date: '23 September 2026',
    readingTime: '3 min read',
    paragraphs: [
      'A personal site is a modest kind of independence. It does not need to compete with a feed, gather an audience, or turn every sentence into a signal. It only needs to give a few things a durable address.',
      'The useful distinction is between publishing and performing. Publishing leaves a trace that can be returned to; performing asks to be noticed now. A quiet page makes room for the first kind of writing: notes that can remain unfinished, change their mind, or simply wait.',
      'That is the spirit of this place. The projects are here because they are easier to understand when they can be opened. The notes are here for the same reason: to let an idea have a little more space than a message permits.',
    ],
  },
  {
    slug: 'the-smallest-useful-system',
    title: 'The smallest useful system',
    dek: 'On choosing a narrow boundary and letting the structure do the work.',
    date: '18 September 2026',
    readingTime: '4 min read',
    paragraphs: [
      'A system becomes legible when its boundary is honest. The most useful first question is often not what it should eventually contain, but what it can leave out without becoming false.',
      'Small systems are not valuable because smallness is a virtue in itself. They are valuable because their assumptions can remain visible. A name can still point to one thing; a transition can still be followed; a failure can still be read rather than merely reported.',
      'This is also a design principle. A page does not become personal by accumulating autobiography. It becomes personal when its selection and arrangement are deliberate enough that another person can feel a mind behind them.',
    ],
  },
  {
    slug: 'against-the-first-draft',
    title: 'Against the first draft',
    dek: 'A note on revising interfaces, explanations, and the names we give to things.',
    date: '11 September 2026',
    readingTime: '3 min read',
    paragraphs: [
      'The first name for a thing is usually a description of where it came from. The second name, if we take the trouble to look for one, has a chance to describe what it is for.',
      'This matters in interfaces because a label is not only a record of implementation. It is an invitation. “Settings” may be accurate, but “Providers” tells a person what kind of decision waits behind the door. Precision is a form of welcome.',
      'Revision is therefore less like polishing a surface than moving a window. The object stays put; the view becomes more exact. Good copy, like good code, earns its shortness by doing more work.',
    ],
  },
]

export function findBlogPost(slug: string | undefined) {
  return blogPosts.find((post) => post.slug === slug)
}
