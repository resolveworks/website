#!/usr/bin/env node
/**
 * Icon generator: rasterizes the hand-authored static/favicon.svg into every
 * PNG size the site serves, so the favicon, touch icon and Organization logo
 * can never drift from one another or from the source artwork. Run only when
 * the artwork changes; it is not part of `pnpm generate`.
 *
 *     pnpm generate-icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const STATIC = join(import.meta.dirname, '..', 'static');
const svg = readFileSync(join(STATIC, 'favicon.svg'), 'utf8');

// logo.png is referenced by the Organization JSON-LD (schema.org wants a
// raster logo, comfortably above its 112px minimum).
const SIZES = {
  'favicon.png': 32,
  'apple-touch-icon.png': 180,
  'logo.png': 512
};

for (const [file, width] of Object.entries(SIZES)) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  writeFileSync(join(STATIC, file), png);
  console.error(`${file}: ${width}x${width}`);
}
