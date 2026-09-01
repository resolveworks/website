#!/usr/bin/env node
/**
 * Embedding pipeline for the page visualizations.
 *
 * Scans the prerendered HTML in build/, embeds each page's sentences with
 * Qwen3-Embedding-0.6B (transformers.js, ONNX — the model downloads once and
 * is cached), reduces them to 3D with UMAP (seeded, deterministic), and writes
 * static/embeddings.json: per page the node coordinates, similarity edges and
 * a content hue, consumed at runtime by src/lib/visualization.js and by the
 * og card backgrounds (tools/generate-og.mjs). The input is the built pages
 * themselves — the only stage that measures rendered output; related
 * articles are ranked from the article markdown upstream of the build by
 * tools/generate-related.mjs.
 *
 * Edges are the strongest EDGE_FRACTION of sentence pairs — relative
 * selection, so graph density survives embedding-model swaps (absolute
 * cosine thresholds are not comparable between models). Raw sentence
 * vectors are cached in .cache/embeddings.json (gitignored, keyed by
 * model + sentence hash, shared with generate-related.mjs) so re-tuning
 * UMAP/edges skips the model run.
 *
 * Run after `pnpm build`; the fresh JSON lands in build/ on the next
 * `pnpm build` (or the one at the end of `pnpm generate`):
 *
 *     pnpm build && pnpm generate-embeddings && pnpm build
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { parseArgs } from 'node:util';
import { parse } from 'node-html-parser';
import { UMAP } from 'umap-js';
import {
  createExtractor,
  dot,
  embedTexts,
  loadCache,
  saveCache,
  toSentences
} from './lib/embed.mjs';

// Block-level HTML elements (text chunks split at these boundaries).
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'div', 'dl', 'dd',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre',
  'section', 'summary', 'table', 'ul'
]);

// Elements skipped entirely (non-content). The baked related-articles list
// renders inside an <aside>, keeping its link text out of the measurement.
const SKIP_TAGS = new Set(['script', 'style', 'nav', 'header', 'footer', 'aside', 'head', 'meta']);

// Fraction of strongest sentence pairs kept as edges. Relative selection
// keeps graph density stable across embedding models; absolute cosine
// thresholds are not comparable between models (MiniLM spreads similarities
// over ~0-0.8, Qwen3 compresses them into ~0.2-0.75).
const EDGE_FRACTION = 0.015;

// UMAP neighbor count, clamped to one below the page's sentence count
// (asserted in main: UMAP needs at least two points).
const N_NEIGHBORS = 15;

// Extract text chunks from HTML, respecting block structure.
function extractChunks(root) {
  const chunks = [];
  let current = '';
  const flush = () => {
    const text = current.trim();
    if (text) chunks.push(text);
    current = '';
  };
  const walk = (node) => {
    if (node.nodeType === 3) {
      // TextNode.text decodes HTML entities; doctype parses as a text node.
      if (!node.rawText.trimStart().startsWith('<!')) current += node.text;
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName?.toLowerCase(); // parse() root has no tagName
    if (tag && SKIP_TAGS.has(tag)) return;
    const isBlock = tag != null && BLOCK_TAGS.has(tag);
    if (isBlock) flush();
    node.childNodes.forEach(walk);
    if (isBlock) flush();
  };
  walk(root);
  flush();
  return chunks;
}

function htmlToSentences(html) {
  return toSentences(extractChunks(parse(html)));
}

// Deterministic PRNG for UMAP's random initialization/sampling.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Reduce embeddings to 3D with UMAP, normalized to 0-1 per dimension.
function reduceTo3D(vectors) {
  const umap = new UMAP({
    nComponents: 3,
    nNeighbors: Math.min(N_NEIGHBORS, vectors.length - 1),
    minDist: 0.1,
    random: mulberry32(42)
  });
  const coords = umap.fit(vectors);
  const mins = [Infinity, Infinity, Infinity];
  const maxs = [-Infinity, -Infinity, -Infinity];
  for (const c of coords) {
    for (let i = 0; i < 3; i++) {
      mins[i] = Math.min(mins[i], c[i]);
      maxs[i] = Math.max(maxs[i], c[i]);
    }
  }
  return coords.map((c) => c.map((v, i) => (v - mins[i]) / (maxs[i] - mins[i] || 1)));
}

// Keep the strongest `fraction` of pairs as edges, normalized to a 0-1
// strength for rendering. Deterministic: ties broken by node indices.
function computeEdges(vectors) {
  const pairs = [];
  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      pairs.push({ source: i, target: j, similarity: dot(vectors[i], vectors[j]) });
    }
  }
  pairs.sort(
    (a, b) => b.similarity - a.similarity || a.source - b.source || a.target - b.target
  );
  const edges = pairs.slice(0, Math.round(pairs.length * EDGE_FRACTION));
  const max = edges[0].similarity;
  const min = edges[edges.length - 1].similarity;
  return edges.map(({ source, target, similarity }) => ({
    // All-identical similarities (e.g. duplicated sentences) would divide
    // by zero; strength is uniformly maximal then.
    source,
    target,
    strength: max > min ? (similarity - min) / (max - min) : 1
  }));
}

// Mean sentence vector of a page — a single "what is this page about"
// direction, hashed into the hue below.
function meanVector(vectors) {
  const mean = new Float64Array(vectors[0].length);
  for (const v of vectors) {
    for (let k = 0; k < mean.length; k++) mean[k] += v[k] / vectors.length;
  }
  return mean;
}

// Derive a well-distributed hue (0-360) from the mean embedding.
function contentHue(vectors) {
  const hex = createHash('sha256')
    .update(Buffer.from(meanVector(vectors).buffer))
    .digest('hex');
  return parseInt(hex.slice(0, 8), 16) % 360;
}

function visualizationData(sentences, vectors) {
  const coords = reduceTo3D(vectors);
  return {
    nodes: sentences.map((text, i) => ({
      id: i,
      x: coords[i][0],
      y: coords[i][1],
      z: coords[i][2],
      text,
      position: i / (sentences.length - 1)
    })),
    edges: computeEdges(vectors),
    hue: contentHue(vectors)
  };
}

// Find index.html files under the input dir and derive their keys:
// index.html -> home, articles/<slug>/index.html -> articles/<slug>.
function discoverPages(inputDir) {
  return readdirSync(inputDir, { recursive: true })
    .map((file) => file.split(sep).join('/'))
    .filter((file) => file === 'index.html' || file.endsWith('/index.html'))
    .sort()
    .map((file) => ({
      key: file === 'index.html' ? 'home' : file.slice(0, -'/index.html'.length),
      path: join(inputDir, file)
    }));
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', default: 'build' },
      output: { type: 'string', default: 'static/embeddings.json' }
    }
  });

  const pages = discoverPages(values.input);
  if (pages.length === 0) {
    console.error(`No index.html files found under ${values.input} — run \`pnpm build\` first.`);
    process.exitCode = 1;
    return;
  }

  const extractor = await createExtractor();
  const cache = loadCache();

  const result = {};
  for (const { key, path } of pages) {
    const sentences = htmlToSentences(readFileSync(path, 'utf8'));
    if (sentences.length < 2) {
      throw new Error(`${key}: only ${sentences.length} sentences — need at least 2`);
    }
    const vectors = await embedTexts(extractor, sentences, cache);
    result[key] = visualizationData(sentences, vectors);
    console.error(
      `${key}: ${result[key].nodes.length} nodes, ${result[key].edges.length} edges, hue ${result[key].hue}`
    );
  }

  saveCache(cache);
  mkdirSync(dirname(values.output), { recursive: true });
  writeFileSync(values.output, JSON.stringify(result, null, 2) + '\n');
  console.error(`Wrote ${values.output}`);
}

await main();
