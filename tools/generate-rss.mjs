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

const SITE_URL = 'https://resolve.works';
const INDEX_PATH = 'src/lib/data/articles.json';
const FEED_PATH = 'static/rss.xml';

// Same copy as the homepage's meta description.
const CHANNEL_DESCRIPTION =
  'Software and data engineering for journalism, accountability and open-data teams: LLM pipelines, verification interfaces and search infrastructure.';

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const articles = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));

const items = articles.map((article) => {
  const url = `${SITE_URL}/articles/${article.slug}/`;
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
  <title>Resolve.</title>
  <link>${SITE_URL}/</link>
  <description>${escape(CHANNEL_DESCRIPTION)}</description>
  <language>en</language>
  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
</channel>
</rss>
`;

writeFileSync(FEED_PATH, xml);
console.log(`Wrote ${items.length} items to ${FEED_PATH}`);
