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

The local production service picks up the new note after the build. Commit and
push the Markdown file when it is ready for GitHub Pages.

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
