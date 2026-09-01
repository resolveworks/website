import { error } from '@sveltejs/kit';
import articles from '$lib/data/articles.json';
import related from '$lib/data/related.json';

export function load({ url }) {
  const slug = url.pathname.replace(/\/+$/, '').split('/').pop();
  const article = articles.find((a) => a.slug === slug);
  if (!article) error(404, 'Article not found');
  return {
    ...article,
    slug,
    related: (related[slug] ?? [])
      .map((relatedSlug) => articles.find((a) => a.slug === relatedSlug))
      .filter(Boolean)
  };
}
