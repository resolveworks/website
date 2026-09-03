#!/usr/bin/env node
/**
 * Article index generator.
 *
 * Distils each article route's +page.md frontmatter into
 * src/lib/data/articles.json — slug, title, intro, date, dateModified
 * — sorted newest first. The listing pages (the
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
import { splitFrontmatter } from './lib/frontmatter.mjs';

const ARTICLES_DIR = 'src/routes/articles/(posts)';
const INDEX_PATH = 'src/lib/data/articles.json';

const articles = readdirSync(ARTICLES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const path = join(ARTICLES_DIR, entry.name, '+page.md');
    const article = { slug: entry.name, ...splitFrontmatter(readFileSync(path, 'utf8'), path).meta };
    for (const field of ['slug', 'title', 'intro', 'date', 'dateModified']) {
      if (!article[field]) throw new Error(`${path}: missing "${field}"`);
    }
    const published = new Date(article.date);
    const modified = new Date(article.dateModified);
    if (Number.isNaN(published)) throw new Error(`${path}: "date" is not a valid date`);
    if (Number.isNaN(modified) || modified < published) {
      throw new Error(`${path}: "dateModified" must be a valid date on or after "date"`);
    }
    return article;
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

mkdirSync(dirname(INDEX_PATH), { recursive: true });
writeFileSync(INDEX_PATH, JSON.stringify(articles, null, 2) + '\n');
console.log(`Wrote ${articles.length} articles to ${INDEX_PATH}`);
