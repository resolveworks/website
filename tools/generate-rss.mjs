#!/usr/bin/env node
/**
 * RSS feed generator.
 *
 * Summary feed of the articles in src/lib/data/articles.json (written by
 * generate-index.mjs): title, link, the intro as description and the
 * declared publication date. Publication dates come from frontmatter, not
 * git — they are a fact about the article's life, not the file's. Output
 * is deterministic: no build timestamps, so unchanged input means an
 * unchanged feed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { site } from './lib/site.mjs';

const INDEX_PATH = 'src/lib/data/articles.json';
const FEED_PATH = 'static/rss.xml';

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const articles = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));

const items = articles.map((article) => {
  const url = `${site.url}/articles/${article.slug}/`;
  return `  <item>
    <title>${escape(article.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <description>${escape(article.intro)}</description>
    <pubDate>${new Date(article.date).toUTCString()}</pubDate>
  </item>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${site.name}</title>
  <link>${site.url}/</link>
  <description>${escape(site.descriptions.home)}</description>
  <language>en</language>
  <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
</channel>
</rss>
`;

writeFileSync(FEED_PATH, xml);
console.log(`Wrote ${items.length} items to ${FEED_PATH}`);
