#!/usr/bin/env node
/**
 * Related-articles generator.
 *
 * Embeds each article as a whole — title, intro and body of the markdown,
 * stripped to plain text, one forward pass per article — and writes each
 * article's strongest neighbours by cosine similarity to
 * src/lib/data/related.json, strongest first.
 *
 * Why whole-article vectors: Qwen3-Embedding pools at the final EOS token,
 * and its training and benchmarks (whole passages as document-side inputs,
 * MLDR long-document retrieval) make a single full-text pass the native
 * document representation; documents are embedded bare, with no task
 * instruction. This replaced averaging the article's sentence vectors —
 * the MiniLM-era workaround — which compressed all pairwise similarities
 * into a narrow band (~0.86-0.91 on this corpus) and left rankings to
 * near-ties. Sentence vectors are the visualization pipeline's business
 * (tools/generate-embeddings.mjs); the two generators share model, cache
 * and mechanics (tools/lib/embed.mjs) but not representations.
 *
 * This is the one generator that runs upstream of `vite build`: the
 * article page's load function imports related.json at build time and
 * bakes the list into the HTML, inside an <aside> that
 * generate-embeddings.mjs skips when it measures the built pages, so the
 * baked links never enter the page measurements.
 *
 * Whole-article vectors are cached in .cache/embeddings.json (gitignored,
 * shared with generate-embeddings.mjs) keyed by the full text, so a
 * re-run after an edit re-embeds only the changed article.
 *
 * The npm script rebuilds so the fresh list lands in build/:
 *
 *     pnpm generate-related
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  createExtractor,
  dot,
  embedTexts,
  loadCache,
  saveCache
} from './lib/embed.mjs';

// Related articles kept per article (strongest first), written to
// RELATED_PATH for the article pages' related-articles lists.
const RELATED_COUNT = 3;
const RELATED_PATH = 'src/lib/data/related.json';

// --- markdown -> text --------------------------------------------------------

// Split a file into its YAML frontmatter (title/intro/... — quoted-string
// values, the only shape the article frontmatter uses) and the body.
function splitFrontmatter(markdown) {
  const lines = markdown.split('\n');
  if (lines[0]?.trim() !== '---') return { meta: {}, body: markdown };
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end === -1) return { meta: {}, body: markdown };
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const field = line.match(/^(\w+):\s*"((?:[^"\\]|\\.)*)"\s*$/);
    if (field) meta[field[1]] = field[2].replace(/\\"/g, '"');
  }
  return { meta, body: lines.slice(end + 1).join('\n') };
}

// Strip inline markup: images (render no text), links (keep the text), raw
// HTML/mdsvex tags, emphasis and code spans — only the rendered text feeds
// the embedding, mirroring what the HTML pipeline extracts.
function stripInline(text) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`([^`]*)`/g, '$1');
}

// Extract the body's rendered text: blockquote, heading and list markers
// are stripped along with inline markup; fenced-code markers go but the
// code stays (the rendered <pre> is part of the page text too).
function markdownToText(body) {
  return body
    .split('\n')
    .map((line) => line.replace(/^\s{0,3}>\s?/, ''))
    .filter((line) => !/^\s{0,3}(?:```|~~~)/.test(line))
    .map((line) =>
      stripInline(
        line
          .replace(/^\s{0,3}#{1,6}\s+/, '')
          .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '')
      )
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- ranking -----------------------------------------------------------------

// Rank each article against the others by cosine similarity of their
// whole-article vectors (L2-normalized by the model, so the dot product is
// the cosine) and keep each article's strongest RELATED_COUNT neighbours,
// strongest first. Deterministic: ties broken by slug, mirroring
// computeEdges' index tie-breaking in generate-embeddings.mjs.
function relatedArticles(vectorsBySlug) {
  const slugs = [...vectorsBySlug.keys()].sort();
  const related = {};
  for (const slug of slugs) {
    related[slug] = slugs
      .filter((other) => other !== slug)
      .map((other) => ({
        slug: other,
        similarity: dot(vectorsBySlug.get(slug), vectorsBySlug.get(other))
      }))
      .sort((a, b) => b.similarity - a.similarity || a.slug.localeCompare(b.slug))
      .slice(0, RELATED_COUNT)
      .map(({ slug: relatedSlug }) => relatedSlug);
  }
  return related;
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', default: 'src/routes/articles/(posts)' },
      output: { type: 'string', default: RELATED_PATH }
    }
  });

  const files = readdirSync(values.input, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (files.length === 0) {
    console.error(`No article directories found under ${values.input}`);
    process.exitCode = 1;
    return;
  }

  const extractor = await createExtractor();
  const cache = loadCache();

  const vectorsBySlug = new Map();
  for (const file of files) {
    const slug = file;
    const { meta, body } = splitFrontmatter(
      readFileSync(join(values.input, file, '+page.md'), 'utf8')
    );
    // The rendered page shows the title (h1) and intro (hero tagline)
    // alongside the body; embed the article as that whole text.
    const text = [meta.title, meta.intro, markdownToText(body)]
      .filter(Boolean)
      .join(' ');
    const [vector] = await embedTexts(extractor, [text], cache);
    vectorsBySlug.set(slug, vector);
    console.error(`${slug}: ${text.length} chars`);
  }

  saveCache(cache);

  const related = relatedArticles(vectorsBySlug);
  mkdirSync(dirname(values.output), { recursive: true });
  writeFileSync(values.output, JSON.stringify(related, null, 2) + '\n');
  console.error(`Wrote ${values.output}`);
  for (const [slug, relatedSlugs] of Object.entries(related)) {
    console.error(`related ${slug}: ${relatedSlugs.join(', ')}`);
  }
}

await main();
