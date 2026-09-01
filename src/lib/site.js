import site from '$lib/data/site.json';
import business from '$lib/data/business.json';

export const SITE_NAME = site.name;
export const SITE_URL = site.url;
export const SITE_DESCRIPTIONS = site.descriptions;

// og cards are pre-rendered by tools/generate-og.mjs — the size must
// match what it rasterizes, hence the shared config.
export const OG_IMAGE_WIDTH = site.ogImage.width;
export const OG_IMAGE_HEIGHT = site.ogImage.height;

/** Full document title: page name plus the site suffix. */
export function pageTitle(title) {
  return `${title} - ${site.name}`;
}

/** Build a mailto: href with proper percent-encoding. */
export function mailtoHref(subject, body) {
  const { email } = business;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/** Format an ISO date string as "Month D, YYYY" (locale-independent). */
export function formatDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const [, year, month, day] = match;
  return `${MONTHS[Number(month) - 1]} ${Number(day)}, ${year}`;
}
