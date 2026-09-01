# Resolve.works

## Overview

Consulting site, fully static SvelteKit. All content lives in the repo — no
database, no CMS. Homepage is section-based; articles are markdown.

## Structure

- `src/routes/` — pages (`+page.svelte` homepage, `articles/`, `404/`)
- `src/lib/components/` — homepage sections (`Features`, `DefinitionList`, `Roadmap`, `Faq`, `About`) and shared (`Hero`, `Seo`, `JsonLd`, `Visualization`)
- `src/lib/data/` — `business.json` (incl. contact email template), `author.json`, `talks.json` (latest talks shown on the homepage); `related.json` is generated (see `tools/generate-related.mjs`)
- `src/lib/site.js` — site URL, `mailtoHref`, `formatDate` helpers
- `src/content/articles/*.md` — mdsvex articles (frontmatter: `title`, `intro` (visible summary), `date`, `description` (meta/JSON-LD snippet); optional `modified` for the JSON-LD `dateModified`); `articles/[slug]/+page.js` imports each post dynamically, `src/lib/articles.js` globs metadata only for listings/entries
- `static/` — global assets, the generated `embeddings.json`, and the committed social cards (`og/`)
- `src/lib/visualization.js`, `src/lib/roadmap.js` — D3 rendering for the embedding scatter plots and roadmap arrows (initialized by components on mount)
- `tools/generate-related.mjs` — Node generator for `src/lib/data/related.json`: each article's most related articles by cosine similarity of whole-article embeddings, computed from the article markdown (upstream of the build; shared embedding mechanics in `tools/lib/embed.mjs`)
- `tools/generate-embeddings.mjs` — Node generator for `static/embeddings.json` (transformers.js + UMAP): per-page sentence-embedding scatters from the prerendered HTML
- `tools/generate-og.mjs` — social-card renderer (hand-serialized SVG + resvg) for `static/og/`; cards use the page's embedding scatter as background; the "Resolve." wordmark is pre-baked glyph paths in `tools/wordmark.svg`

## Tech Stack

- SvelteKit 2 + Svelte 5, mdsvex, adapter-static (`build/`, `trailingSlash = 'always'`)
- pnpm; @resvg/resvg-js for social cards; @huggingface/transformers + umap-js for embedding data; nginx container to serve

## Commands

```bash
pnpm dev                              # dev server
pnpm build                            # prerender to build/
pnpm generate-related                 # article markdown -> src/lib/data/related.json, then rebuild
pnpm generate-embeddings              # build/ HTML -> static/embeddings.json, then rebuild
pnpm generate-og                      # embeddings -> static/og/ cards, then rebuild
pnpm generate                         # all three generators, in pipeline order
```

## Conventions

- Reuse existing `styles.css` classes; scope page-specific CSS by wrapping the
  page in a classed div (`home-page`, `article-page`), not body classes.
- Use the `Seo` component for head meta. Every page must keep full SEO
  coverage: meta description, OG/Twitter, canonical `https` URL, JSON-LD, and
  a `static/sitemap.xml` entry.
- Embeddings, related articles and OG cards are content-derived, each from
  the source closest to it: related articles are ranked from the article
  markdown (`generate-related` writes `src/lib/data/related.json`, which the
  article pages read at build time; the baked lists are wrapped in `<aside>`,
  which the embeddings generator's extraction skips, so they never enter the
  page measurements), the page scatters embed the prerendered HTML of every
  page (`generate-embeddings`), and the cards are rendered from those
  embeddings (`generate-og`), so after editing any page content (article or
  page copy) run `pnpm generate`, and update lastmod for the changed pages in
  `static/sitemap.xml`.
