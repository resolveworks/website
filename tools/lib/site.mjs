import { readFileSync } from 'node:fs';

// Site-level config (name, url, meta descriptions) lives in
// src/lib/data/site.json so the app (via $lib/site.js) and the generators
// share one source of truth. Paths are cwd-relative, like the other
// generator inputs (run from the repo root via package.json scripts).
export const site = JSON.parse(readFileSync('src/lib/data/site.json', 'utf8'));
