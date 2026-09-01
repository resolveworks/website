#!/usr/bin/env node
/**
 * Sitemap generator.
 *
 * Every page's lastmod comes from the git history of its generated
 * markdown sibling (the index.md mirrors under static/). Those files are committed
 * artifacts, so their last commit date is the last time the page's
 * rendered content changed — whether the edit landed in the route, a
 * component or a data file. A page with uncommitted changes gets today's
 * date instead: content and generated files are committed together, so
 * the commit lands on the same day and the date stays stable afterwards.
 *
 * Runs after generate-markdown.mjs, whose output it reads.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, sep } from 'node:path';
import { site } from './lib/site.mjs';

const STATIC_DIR = 'static';
const SITEMAP_PATH = 'static/sitemap.xml';

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

// Last content-change date of a file: today while it has uncommitted (or
// not-yet-committed) changes, otherwise its last commit date.
function lastModified(path) {
  if (git(['status', '--porcelain', '--', path])) {
    return new Date().toISOString().slice(0, 10);
  }
  const committed = git(['log', '-1', '--format=%cs', '--', path]);
  if (!committed) throw new Error(`${path}: no git history and no uncommitted changes?`);
  return committed;
}

// All index.md files under static/ are generated mirrors of prerendered
// pages — error pages render as 404.html/50x.html, so they never appear.
function discoverPages() {
  return readdirSync(STATIC_DIR, { recursive: true })
    .map((file) => file.split(sep).join('/'))
    .filter((file) => file === 'index.md' || file.endsWith('/index.md'))
    .map((file) => {
      const key = file === 'index.md' ? '' : file.slice(0, -'/index.md'.length);
      return { pagePath: `/${key ? key + '/' : ''}`, file: join(STATIC_DIR, file) };
    })
    .sort((a, b) => a.pagePath.localeCompare(b.pagePath));
}

const urls = discoverPages().map(({ pagePath, file }) => {
  const lastmod = lastModified(file);
  console.error(`${pagePath}: lastmod ${lastmod}`);
  return `  <url>\n    <loc>${site.url}${pagePath}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

writeFileSync(SITEMAP_PATH, xml);
console.log(`Wrote ${urls.length} URLs to ${SITEMAP_PATH}`);
