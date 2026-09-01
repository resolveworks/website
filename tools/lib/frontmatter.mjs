/**
 * Shared article-frontmatter parser: quoted-string values, the only shape
 * article frontmatter uses. Returns the meta fields and the body, so
 * callers that need only the meta (generate-index) and callers that need
 * both (generate-related) share one grammar.
 */
export function splitFrontmatter(markdown, label) {
  const lines = markdown.split('\n');
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (lines[0]?.trim() !== '---' || end === -1) {
    throw new Error(`${label}: missing or unterminated frontmatter`);
  }
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const field = line.match(/^(\w+):\s*"((?:[^"\\]|\\.)*)"\s*$/);
    if (field) meta[field[1]] = field[2].replace(/\\"/g, '"');
  }
  return { meta, body: lines.slice(end + 1).join('\n') };
}
