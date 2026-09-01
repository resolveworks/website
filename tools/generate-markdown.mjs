#!/usr/bin/env node
/**
 * Generates Markdown siblings for prerendered pages. Every page — articles
 * included — is converted from its built HTML with turndown: the build is
 * the single source of truth, and the markdown is a derived artifact, the
 * same way generate-embeddings.mjs measures the built pages.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { parseArgs } from 'node:util';
import TurndownService from 'turndown';
import { parse } from 'node-html-parser';

const SITE_URL = 'https://resolve.works';

// One converter per page: the URL rule needs to know the page's own path.
// Inside main only JSON-LD script blocks are non-content; the hero header
// stays, unlike the embedding generator's skips. Asides go: on article
// pages they hold the baked related-articles list and the author block —
// boilerplate, not page content (the embedding generator skips them too).
function converter(pagePath) {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-'
  });
  td.remove(['script', 'aside']);
  // Array filters match tag names only, so the function gets its own call.
  // Decorative glyphs (link arrows) are marked aria-hidden.
  td.remove((node) => node.getAttribute('aria-hidden') === 'true');

  td.addRule('absoluteUrls', {
    filter: (node) => node.nodeName === 'A' || node.nodeName === 'IMG',
    replacement: (content, node) => {
      const isLink = node.nodeName === 'A';
      const href = node.getAttribute(isLink ? 'href' : 'src');
      if (!href) return content;
      const url = href.startsWith('/')
        ? SITE_URL + href
        : href.startsWith('#')
          ? SITE_URL + pagePath + href
          : href;
      return isLink ? `[${content.trim()}](${url})` : `![${node.getAttribute('alt') ?? ''}](${url})`;
    }
  });

  // Card titles are headings inside li — bold them instead of emitting
  // headings mid-list.
  td.addRule('headingInListItem', {
    filter: (node) => {
      if (!/^H[1-6]$/.test(node.nodeName)) return false;
      for (let p = node.parentNode; p && p.nodeName !== '#document'; p = p.parentNode) {
        if (p.nodeName === 'LI') return true;
      }
      return false;
    },
    replacement: (content) => `**${content.trim()}**`
  });

  // turndown has no dl support: emit "- **term** — definition" lines.
  td.addRule('definitionList', {
    filter: ['dl'],
    replacement: (_content, node) => {
      const items = [];
      for (const child of node.childNodes) {
        const tag = child.nodeName?.toLowerCase();
        if (tag === 'dt') items.push(`- **${td.turndown(child).trim()}**`);
        else if (tag === 'dd' && items.length) {
          items[items.length - 1] += ` — ${td.turndown(child).trim().replace(/\n+/g, ' ')}`;
        }
      }
      return `\n\n${items.join('\n')}\n\n`;
    }
  });

  // FAQ questions; turndown treats summary as inline, so force separation
  // between question and answer paragraphs.
  td.addRule('summary', {
    filter: ['summary'],
    replacement: (content) => `\n\n**${content.trim()}**\n\n`
  });

  return td;
}

function frontmatter(root, pagePath) {
  const title = root.querySelector('title')?.text.trim();
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!title || !description) {
    throw new Error(`${pagePath}: missing <title> or meta description — required on every page`);
  }
  const quote = (value) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const lines = [`title: ${quote(title)}`, `description: ${quote(description)}`];
  // Article pages declare these via the Seo component; keep the served
  // markdown's dates machine-readable rather than only rendered in the hero.
  const published = root.querySelector('meta[property="article:published_time"]')?.getAttribute('content');
  const modified = root.querySelector('meta[property="article:modified_time"]')?.getAttribute('content');
  if (published) lines.push(`date: ${quote(published)}`);
  if (modified && modified !== published) lines.push(`modified: ${quote(modified)}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}

function convertPage(html, pagePath) {
  const root = parse(html);
  const main = root.querySelector('main');
  if (!main) throw new Error(`${pagePath}: no <main> element to convert`);
  const markdown = converter(pagePath)
    .turndown(main.outerHTML)
    .replace(/^[ \t]+$/gm, '') // indent-only lines from list continuation
    .replace(/\n{3,}/g, '\n\n');
  return frontmatter(root, pagePath) + markdown.trim() + '\n';
}

function discoverPages(inputDir) {
  return readdirSync(inputDir, { recursive: true })
    .map((file) => file.split(sep).join('/'))
    .filter((file) => file === 'index.html' || file.endsWith('/index.html'))
    .sort()
    .map((file) => ({
      key: file === 'index.html' ? '' : file.slice(0, -'/index.html'.length),
      path: join(inputDir, file)
    }));
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', default: 'build' },
      output: { type: 'string', default: 'static' }
    }
  });

  const pages = discoverPages(values.input);
  if (pages.length === 0) {
    console.error(`No index.html files found under ${values.input} — run \`pnpm build\` first.`);
    process.exitCode = 1;
    return;
  }

  for (const { key, path } of pages) {
    const pagePath = `/${key ? key + '/' : ''}`;
    const target = join(values.output, key, 'index.md');
    mkdirSync(dirname(target), { recursive: true });

    writeFileSync(target, convertPage(readFileSync(path, 'utf8'), pagePath));
    console.error(`${pagePath}: converted ${path}`);
  }
}

await main();
