#!/usr/bin/env node
/**
 * Article index generator.
 *
 * Distils each article route's +page.md frontmatter into
 * src/lib/data/articles.json — slug, title, intro, date (plus optional
 * description/modified) — sorted newest first. The listing pages (the
 * articles page, the homepage's latest-articles column) and the (posts)
 * layout read this manifest instead of globbing the route files: route
 * group directories like `(posts)` and files like `+page.md` are made of
 * glob metacharacters, and a fully prerendered site gains nothing from
 * runtime discovery anyway.
 *
 * Runs upstream of `vite build`, in the same pipeline position as
 * generate-related.mjs, which bakes src/lib/data/related.json the same
 * way. Run it standalone (pnpm generate-index) after adding an article,
 * or as part of pnpm generate.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ARTICLES_DIR = 'src/routes/articles/(posts)';
const INDEX_PATH = 'src/lib/data/articles.json';

// Quoted-string values, the only shape article frontmatter uses — same
// parser contract as generate-related.mjs's splitFrontmatter.
function parseFrontmatter(markdown) {
  const lines = markdown.split('\n');
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (lines[0]?.trim() !== '---' || end === -1) {
    throw new Error('missing or unterminated frontmatter');
  }
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^(\w+):\s*"(.*)"$/);
    if (match) meta[match[1]] = match[2];
  }
  return meta;
}

const articles = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const path = join(ARTICLES_DIR, entry.name, '+page.md');
    const article = { slug: entry.name, ...parseFrontmatter(readFileSync(path, 'utf8')) };
    for (const field of ['slug', 'title', 'intro', 'date']) {
      if (!article[field]) throw new Error(`${path}: missing "${field}"`);
    }
    return article;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

mkdirSync(dirname(INDEX_PATH), { recursive: true });
writeFileSync(INDEX_PATH, JSON.stringify(articles, null, 2) + '\n');
console.log(`Wrote ${articles.length} articles to ${INDEX_PATH}`);
