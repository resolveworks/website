// Shared embedding mechanics for the content generators:
//
//   tools/generate-related.mjs     — related articles: whole-article
//                                     vectors, from the article markdown
//   tools/generate-embeddings.mjs  — page scatters: sentence vectors,
//                                     from the prerendered HTML
//
// The model, the text-vector cache and the vector math live here so both
// generators embed with the same model and settings; each computes the
// representation its job needs.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pipeline } from '@huggingface/transformers';

// Embedding model (1024 dimensions). Qwen3-Embedding-0.6B scores 64.3 on the
// MTEB multilingual leaderboard vs ~59 for all-MiniLM-L6-v2, at a still-modest
// size; q8 keeps the download ~600 MB and CPU inference fast.
export const MODEL_NAME = 'onnx-community/Qwen3-Embedding-0.6B-ONNX';

// Minimum sentence length (characters) to keep.
export const MIN_SENTENCE_LENGTH = 10;

// Raw text vectors cached here (gitignored, keyed by model + text hash)
// so generator re-runs skip the model for already-seen texts.
export const CACHE_PATH = '.cache/embeddings.json';

export function createExtractor() {
  return pipeline('feature-extraction', MODEL_NAME, { dtype: 'q8' });
}

export function loadCache() {
  try {
    return new Map(Object.entries(JSON.parse(readFileSync(CACHE_PATH, 'utf8'))));
  } catch {
    return new Map();
  }
}

export function saveCache(cache) {
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(Object.fromEntries(cache)));
}

function cacheKey(sentence) {
  return createHash('sha256').update(MODEL_NAME + '\0' + sentence).digest('hex');
}

// Embed texts (sentences, whole articles); vectors come out L2-normalized,
// so dot product == cosine similarity and UMAP's euclidean metric is
// equivalent to cosine. Qwen3 embedding models pool at the final EOS token,
// not the mean. Vectors are cached by model + text hash; only misses hit the
// model.
export async function embedTexts(extractor, texts, cache) {
  const vectors = new Array(texts.length);
  const missing = [];
  for (let i = 0; i < texts.length; i++) {
    const hit = cache.get(cacheKey(texts[i]));
    if (hit) vectors[i] = hit;
    else missing.push(i);
  }
  if (missing.length > 0) {
    const output = await extractor(
      missing.map((i) => texts[i]),
      { pooling: 'last_token', normalize: true }
    );
    const fresh = output.tolist();
    missing.forEach((i, n) => {
      vectors[i] = fresh[n];
      cache.set(cacheKey(texts[i]), fresh[n]);
    });
  }
  return vectors;
}

// Sentence segmentation: the platform's Intl.Segmenter (UAX #29 sentence
// break rules with ICU locale data) — the standard solution, not a
// hand-rolled punctuation regex. The rules keep dotted tokens whole
// (github.com, robots.txt, Next.js), handle abbreviations, and don't lose
// chunks ending in ?" or !" — the regex predecessor silently dropped text
// before any mid-token period and lost chunks ending in a closing quote.
// Known limit: "v." before a name (X v. Y case citations) still splits; the
// abbreviation isn't in ICU's suppression data. Whitespace is collapsed
// first because UAX #29 counts line feeds as sentence separators —
// source-wrapped page text would otherwise break mid-sentence.
const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });

export function splitSentences(text) {
  return [...segmenter.segment(text.replace(/\s+/g, ' '))]
    .map(({ segment }) => segment.trim())
    .filter((sentence) => sentence.length > 0);
}

// Text blocks (paragraphs, headings, list items, ...) -> kept sentences:
// split each block, trim, drop fragments below MIN_SENTENCE_LENGTH.
export function toSentences(blocks) {
  return blocks
    .flatMap((block) => splitSentences(block))
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_SENTENCE_LENGTH);
}

export function dot(a, b) {
  let sum = 0;
  for (let k = 0; k < a.length; k++) sum += a[k] * b[k];
  return sum;
}
