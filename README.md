# Resolve.

Source for [resolve.works](https://resolve.works) — the site of **Resolve.**, the
software and data engineering practice of [Johan Schuijt](https://www.linkedin.com/in/johanschuijt/):
LLM extraction and search, interfaces for working with data, and the full stack
underneath — for organizations doing work that matters.

The site is **fully static**: prerendered HTML/CSS/JS, no database, no CMS. All
content lives in this repo.

## Tech stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/), [mdsvex](https://mdsvex.pngwn.io/) for article markdown, [`@sveltejs/adapter-static`](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)
- [D3](https://d3js.org/) for the embedding scatter visualizations (the only runtime dependency)
- Social cards prerendered from hand-serialized SVG to PNG with [resvg](https://github.com/yisibl/resvg-js)
- [pnpm](https://pnpm.io/) for dependencies

## Local development

```bash
pnpm install      # install dependencies
pnpm dev          # dev server (http://localhost:5173)
pnpm build        # prerender the static site into build/
pnpm preview      # serve the built site locally
```

## Content

Articles are mdsvex routes at `src/routes/articles/(posts)/<slug>/+page.md`,
with `title`, `intro`, `date` and `description` frontmatter. Everything else is
Svelte markup under `src/routes`.

After changing any page content:

```bash
pnpm generate
```

This regenerates the article index, related-article data, embeddings, markdown
siblings and social cards, rebuilding between steps. The individual generators
(`generate-index`, `generate-related`, `generate-embeddings`,
`generate-markdown`, `generate-og`) can also be run separately. Also update the
affected `lastmod` values in `static/sitemap.xml`.

`src/lib/data/articles.json`, `src/lib/data/related.json`,
`static/embeddings.json`, `static/**/index.md` and `static/og/` are generated —
never hand-edit them. `static/llms.txt` is curated by hand.
