// Shared structured-data nodes, so every page's JSON-LD resolves to the same
// entities via their @ids. Homepage declares them; article pages reference them.
import business from '$lib/data/business.json';
import author from '$lib/data/author.json';
import { SITE_NAME, SITE_URL } from '$lib/site.js';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const PERSON_ID = `${SITE_URL}/#person`;

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: author.name,
  alternateName: [author.fullName],
  jobTitle: author.jobTitle,
  url: business.linkedin,
  sameAs: [business.github, business.mastodon, business.bluesky, business.devto, business.medium]
};

// Organization, not ProfessionalService: schema.org deprecated the latter as a
// catch-all. A remote consultancy has no customer-facing premises, so
// LocalBusiness (and its priceRange/openingHours) would be wrong too.
export const organization = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: ['resolve.works'],
  legalName: business.legalName,
  description:
    'Software and data engineering for organizations doing public-interest work: LLM-assisted data pipelines with human verification, entity resolution, search infrastructure, and full product development.',
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512
  },
  email: business.email,
  foundingDate: business.foundingDate,
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'Estonian registry code',
    value: business.registryCode
  },
  vatID: business.vat,
  address: { '@type': 'PostalAddress', ...business.postalAddress },
  founder: { '@id': PERSON_ID },
  sameAs: [business.githubOrg, business.register.url],
  knowsAbout: [
    'AI',
    'Machine Learning',
    'LLM',
    'Entity Resolution',
    'Data Engineering',
    'Software Engineering',
    'Open Data'
  ]
};

export const website = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: ['resolve.works'],
  inLanguage: 'en',
  publisher: { '@id': ORGANIZATION_ID }
};
