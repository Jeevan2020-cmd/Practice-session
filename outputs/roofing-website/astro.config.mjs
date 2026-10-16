import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Keep the thank-you page out of search results.
      filter: (page) => !page.includes('/thank-you/'),
    }),
  ],
});
