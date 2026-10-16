// llms.txt: a plain-text summary of the site for AI assistants.
// It's an emerging convention; it's cheap to provide and stays in sync
// automatically because it's built from the same content as the pages.
import { getCollection } from 'astro:content';
import { SITE, AREAS_SERVED } from '../config';

export async function GET() {
  const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
  const areas = (await getCollection('areas')).sort((a, b) => a.data.order - b.data.order);
  const guides = (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order);
  const url = (p: string) => new URL(p, SITE.url).href;
  const line = (title: string, path: string, summary: string) => `- [${title}](${url(path)}): ${summary}`;

  const body = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.name} is a free roofing quote service for homeowners in ${AREAS_SERVED.join(' and ')}, England. ` +
      'It is an introduction service, not a roofing contractor: homeowners describe their job and the enquiry is passed to one checked local roofing company, which arranges a survey and written quote. ' +
      `It is free for homeowners; the roofer pays a fee. Phone: ${SITE.phoneDisplay}.`,
    '',
    'Coverage: Birmingham postcodes B1 to B48 and Sutton Coldfield B72 to B76. Prices quoted on the site are typical 2026 UK ranges including VAT, not quotes.',
    '',
    '## Services',
    ...services.map((s) => line(s.data.h1, `/${s.id}/`, s.data.quickAnswer)),
    '',
    '## Areas',
    ...areas.map((a) => line(a.data.h1, `/areas/${a.id}/`, a.data.quickAnswer)),
    '',
    '## Guides',
    ...guides.map((g) => line(g.data.h1, `/guides/${g.id}/`, g.data.quickAnswer)),
    '',
    '## About',
    line('How it works', '/how-it-works/', 'How enquiries are handled, the checks made on roofers and how the service is funded.'),
    line('Get a free quote', '/get-a-quote/', 'Four-step form to request a free, no-obligation roofing quote.'),
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
