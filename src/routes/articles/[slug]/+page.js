import { error } from '@sveltejs/kit';
import { articles } from '$lib/articles.js';
import related from '$lib/data/related.json';

// Prerender every article slug.
export function entries() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function load({ params }) {
  // mdsvex compiles each markdown file into a Svelte component (`default`)
  // with its frontmatter in `metadata`. The dynamic import keeps every
  // article in its own chunk; a universal load may return the component
  // directly because its data is never serialized.
  try {
    const post = await import(`../../../content/articles/${params.slug}.md`);
    // Related articles, ranked from the article markdown by
    // tools/generate-related.mjs (cosine similarity of whole-article
    // embeddings) into src/lib/data/related.json; joined here with
    // frontmatter metadata for the page's list.
    const relatedArticles = (related[params.slug] ?? [])
      .map((slug) => articles.find((article) => article.slug === slug))
      .filter(Boolean);
    return { content: post.default, slug: params.slug, related: relatedArticles, ...post.metadata };
  } catch {
    error(404, 'Article not found');
  }
}
