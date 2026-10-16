import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared fields every content page has.
const faq = z.object({ q: z.string(), a: z.string() });
const source = z.object({ label: z.string(), url: z.string().url() });

const base = {
  title: z.string(), // the <title> tag, shown in Google results
  description: z.string(), // the meta description, shown under the title in Google
  h1: z.string(),
  quickAnswer: z.string(), // short direct answer at the top: what AI tools tend to quote
  faqs: z.array(faq).default([]),
  sources: z.array(source).default([]),
  updated: z.coerce.date(),
};

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: z.object({ ...base, order: z.number(), formValue: z.string(), serviceType: z.string() }),
});

const areas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/areas' }),
  schema: z.object({ ...base, order: z.number(), place: z.string(), postcodes: z.string() }),
});

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({
    ...base,
    order: z.number(),
    published: z.coerce.date(),
    relatedService: z.string().optional(), // slug of a service page
  }),
});

export const collections = { services, areas, guides };
