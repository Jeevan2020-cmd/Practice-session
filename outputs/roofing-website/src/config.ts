// Site-wide settings. Change these in one place and every page updates.

export const SITE = {
  name: 'Birmingham Roof Quotes',
  shortName: 'BRQ',
  // Change this once you've bought your domain (no trailing slash).
  url: 'https://birminghamroofquotes.co.uk',
  tagline: 'Free roofing quotes from a checked local roofer',
  description:
    'Free, no-obligation roofing quotes in Birmingham and Sutton Coldfield. Tell us about the job and we pass it to one checked local roofer the same working day.',
  phoneDisplay: '07951 702832',
  phoneLink: '+447951702832',
  // Public contact email for the privacy page. Leave empty to hide it.
  // Tip: once you own the domain, set up something like hello@yourdomain.
  contactEmail: '',
  // Your name or company name, shown on the privacy and terms pages.
  // Leave empty until you're ready; the pages read fine without it.
  operatorName: '',
  // Paste your Google Apps Script web app URL here (see README.md, step 2).
  leadEndpoint: '',
  // Date the content was last checked. Shown on guides for trust and AEO.
  lastReviewed: '2026-10-16',
};

export const AREAS_SERVED = ['Birmingham', 'Sutton Coldfield'];

// Postcode districts we treat as "in area". Leads outside these still come
// through, but they're flagged so you can decide whether to pass them on.
export const IN_AREA_POSTCODES = {
  birmingham: { from: 1, to: 48 }, // B1 to B48
  suttonColdfield: { from: 72, to: 76 }, // B72 to B76
};

export const SERVICES = [
  {
    slug: 'roof-repairs',
    name: 'Roof repairs & leaks',
    short: 'Slipped tiles, leaks, storm damage, ridge and valley repairs.',
    formValue: 'repair',
  },
  {
    slug: 'new-roofs',
    name: 'New roofs & replacements',
    short: 'Full re-roofs in concrete tile, clay tile or natural slate.',
    formValue: 'new-roof',
  },
  {
    slug: 'flat-roofs',
    name: 'Flat roofs',
    short: 'EPDM rubber, GRP fibreglass and felt for extensions, garages and dormers.',
    formValue: 'flat-roof',
  },
  {
    slug: 'guttering-fascias-chimneys',
    name: 'Guttering, fascias & chimneys',
    short: 'Gutters, fascias, soffits, chimney repointing and lead flashing.',
    formValue: 'roofline',
  },
];
