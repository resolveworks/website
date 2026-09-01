# Resolve.works

Fully static SvelteKit consulting site. All content lives in the repo — no
database, no CMS. Homepage is section-based; articles are markdown.

## Articles

- Frontmatter: `title`, `intro` (visible summary), `date`, `description`
  (meta/JSON-LD snippet); optional `modified` for the JSON-LD `dateModified`.
- `articles/[slug]/+page.js` imports each post dynamically (mdsvex component
  per article), while `src/lib/articles.js` globs metadata only for
  listings/entries — keep the two mechanisms separate.

## Generated files — never hand-edit

`src/lib/data/related.json`, `static/embeddings.json`, and `static/og/` are
produced by the `tools/` generators. The data flows downstream from the
source closest to it: article markdown → `generate-related.mjs` → related
lists; prerendered page HTML → `generate-embeddings.mjs` → scatters; those
embeddings → `generate-og.mjs` → social cards. `pnpm generate` runs all
three in this order.

- The baked related-articles lists are wrapped in `<aside>` because the
  embeddings generator skips `<aside>` content when measuring pages — keep
  that wrapper, or the lists pollute the page measurements.
- After editing any page content (article or page copy), run
  `pnpm generate` and update lastmod for the changed pages in
  `static/sitemap.xml`.

## Conventions

- Reuse existing `styles.css` classes; scope page-specific CSS by wrapping
  the page in a classed div (`home-page`, `article-page`), not body classes.
- Use the `Seo` component for head meta. Every page must keep full SEO
  coverage: meta description, OG/Twitter, canonical `https` URL, JSON-LD,
  and a `static/sitemap.xml` entry.
