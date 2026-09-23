# Notes workspace

The notes on the public site are ordinary Markdown files in `content/notes/`.
That folder is the editorial source of truth; TypeScript only discovers and
renders the files that are there.

## Write a note

From this directory, run:

```sh
npm run note:new -- "A title for the note"
```

The command creates a dated Markdown file with the right frontmatter. Open it
in any editor, write Markdown below the closing `---`, and run:

```sh
npm run note:check
npm run build
```

In Notes Desk, `Save note` writes the Markdown file without rebuilding. The
global `Publish locally` action rebuilds the local production site. The global
`Publish to GitHub Pages` action validates, commits only `content/notes/`, and
pushes `main`; the GitHub Actions deployment then publishes the site.

The local production service also picks up the new note after `npm run build`.

## Frontmatter

Each note needs these fields:

```yaml
---
title: A human-readable title
dek: A short sentence shown in the notes index.
date: 2026-09-23
---
```

`readingTime` is calculated from the body, so there is no second number to
keep in sync. Use one file per note and keep the filename as its permanent URL
slug (lowercase words separated by hyphens).

Notes with `draft: true` remain available to the local build but are omitted
from the public list and direct route. This makes it possible to write in the
same workspace without publishing unfinished work.
