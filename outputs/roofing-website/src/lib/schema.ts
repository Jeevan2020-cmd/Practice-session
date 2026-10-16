// Structured data (JSON-LD). These are hidden labels that tell Google and AI
// assistants what each page is, who runs the site and which areas it covers.
// We describe the business as an Organization that arranges quotes, not as a
// roofing contractor, because that's what it is.

import { SITE, AREAS_SERVED } from '../config';

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export const abs = (path: string) => new URL(path, SITE.url).href;

const areaServed = [
  { '@type': 'City', name: 'Birmingham', containedInPlace: { '@type': 'AdministrativeArea', name: 'West Midlands' } },
  { '@type': 'Place', name: 'Sutton Coldfield' },
];

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: abs('/'),
    logo: abs('/favicon.svg'),
    description:
      `${SITE.name} is a free roofing quote service for homeowners in ${AREAS_SERVED.join(' and ')}. ` +
      'We pass enquiries to a checked local roofing company, which contacts the homeowner to arrange a quote.',
    telephone: SITE.phoneLink,
    areaServed,
    knowsAbout: ['Roof repairs', 'Roof replacement', 'Flat roofing', 'Guttering', 'Fascias and soffits', 'Chimney repairs'],
  };
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    url: abs('/'),
    inLanguage: 'en-GB',
    publisher: { '@id': ORG_ID },
  };
}

export function service(opts: { name: string; serviceType: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: abs(opts.path),
    provider: { '@id': ORG_ID },
    areaServed,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP', description: 'Free, no-obligation quote' },
  };
}

export function article(opts: { headline: string; description: string; path: string; published: Date; updated: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    datePublished: opts.published.toISOString().slice(0, 10),
    dateModified: opts.updated.toISOString().slice(0, 10),
    inLanguage: 'en-GB',
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

export function faqPage(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

// UK date format, e.g. 16/10/2026 -> "16 October 2026"
export const ukDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' });
