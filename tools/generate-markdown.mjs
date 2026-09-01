#!/usr/bin/env node
/**
 * Generates Markdown siblings for prerendered pages. Article sources are
 * copied verbatim; other pages are converted from HTML.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { parse } from 'node-html-parser';

const SITE_URL = 'https://resolve.works';

const ARTICLES_SRC = join('src', 'routes', 'articles', '(posts)');

// The page hero is in header, so unlike the embedding generator we keep it.
const SKIP_TAGS = new Set(['script', 'style', 'nav', 'footer', 'aside', 'head', 'svg']);

function inline(node, pagePath) {
  if (node.nodeType === 3) return node.text; // .text decodes entities
  if (node.nodeType !== 1) return '';
  const tag = node.tagName?.toLowerCase();
  if (!tag || SKIP_TAGS.has(tag)) return '';
  if (node.getAttribute('aria-hidden') === 'true') return '';
  const inner = node.childNodes.map((child) => inline(child, pagePath)).join('');
  switch (tag) {
    case 'a': {
      const label = inner.trim();
      const href = absoluteUrl(node.getAttribute('href'), pagePath);
      return label && href ? `[${label}](${href})` : label;
    }
    case 'b':
    case 'strong':
      return `**${inner.trim()}**`;
    case 'i':
    case 'em':
      return `*${inner.trim()}*`;
    case 'code':
      return `\`${inner.trim()}\``;
    case 'img':
      return `![${node.getAttribute('alt') ?? ''}](${absoluteUrl(node.getAttribute('src'), pagePath)})`;
    default:
      return inner;
  }
}

function absoluteUrl(href, pagePath) {
  if (!href) return null;
  if (href.startsWith('/')) return SITE_URL + href;
  if (href.startsWith('#')) return SITE_URL + pagePath + href;
  return href;
}

function text(node, pagePath) {
  return inline(node, pagePath).replace(/\s+/g, ' ').trim();
}

function blocks(node, pagePath) {
  const out = [];
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const stray = child.text.trim();
      if (stray) out.push(stray);
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName?.toLowerCase();
    if (!tag || SKIP_TAGS.has(tag)) continue;
    const heading = tag.match(/^h([1-6])$/);
    if (heading) {
      out.push(`${'#'.repeat(Number(heading[1]))} ${text(child, pagePath)}`);
    } else if (tag === 'p' || tag === 'blockquote') {
      const content = text(child, pagePath);
      if (content) out.push(tag === 'blockquote' ? `> ${content}` : content);
    } else if (tag === 'ul' || tag === 'ol') {
      out.push(list(child, pagePath, tag === 'ol'));
    } else if (tag === 'dl') {
      out.push(definitionList(child, pagePath));
    } else if (tag === 'details') {
      out.push(details(child, pagePath));
    } else if (tag === 'hr') {
      out.push('---');
    } else {
      const inner = blocks(child, pagePath);
      if (inner) out.push(inner);
    }
  }
  return out.filter(Boolean).join('\n\n');
}

function list(node, pagePath, ordered) {
  const renderItem = (child) => {
    if (child.nodeType === 3) return child.text.trim();
    const tag = child.tagName?.toLowerCase();
    if (!tag || SKIP_TAGS.has(tag)) return '';
    if (tag.match(/^h[1-6]$/)) return `**${text(child, pagePath)}**`;
    if (tag === 'ul' || tag === 'ol') return list(child, pagePath, tag === 'ol');
    if (tag === 'p' || tag === 'time') return text(child, pagePath);
    return child.childNodes.map(renderItem).filter(Boolean).join('\n');
  };
  return node.childNodes
    .filter((child) => child.tagName?.toLowerCase() === 'li')
    .map((li, i) => {
      const item = li.childNodes.map(renderItem).filter(Boolean).join('\n');
      const prefix = ordered ? `${i + 1}. ` : '- ';
      return prefix + item.replaceAll('\n', '\n  ');
    })
    .filter((item) => item.trim().length > (ordered ? 3 : 2))
    .join('\n');
}

function definitionList(node, pagePath) {
  const items = [];
  for (const child of node.childNodes) {
    const tag = child.tagName?.toLowerCase();
    if (tag === 'dt') {
      items.push(`- **${text(child, pagePath)}**`);
    } else if (tag === 'dd' && items.length) {
      items[items.length - 1] += ` — ${text(child, pagePath)}`;
    }
  }
  return items.join('\n');
}

function details(node, pagePath) {
  const summary = node.childNodes.find((child) => child.tagName?.toLowerCase() === 'summary');
  const answer = blocks(
    { childNodes: node.childNodes.filter((child) => child !== summary) },
    pagePath
  );
  return [`**${text(summary, pagePath)}**`, answer].filter(Boolean).join('\n\n');
}

function frontmatter(root) {
  const title = root.querySelector('title')?.text.trim();
  const description = root.querySelector('meta[name="description"]')?.getAttribute('content');
  const quote = (value) => `"${value.replace(/"/g, '\\"')}"`;
  const fields = [title && `title: ${quote(title)}`, description && `description: ${quote(description)}`]
    .filter(Boolean);
  return fields.length ? `---\n${fields.join('\n')}\n---\n\n` : '';
}

function convertPage(html, pagePath) {
  const root = parse(html);
  const body = root.querySelector('main') ?? root.querySelector('body') ?? root;
  return frontmatter(root) + blocks(body, pagePath) + '\n';
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

    const source = key.startsWith('articles/')
      ? join(ARTICLES_SRC, key.slice('articles/'.length), '+page.md')
      : null;
    mkdirSync(dirname(target), { recursive: true });
    if (source && existsSync(source)) {
      cpSync(source, target);
      console.error(`${pagePath}: copied ${source}`);
    } else {
      writeFileSync(target, convertPage(readFileSync(path, 'utf8'), pagePath));
      console.error(`${pagePath}: converted ${path}`);
    }
  }
}

await main();
