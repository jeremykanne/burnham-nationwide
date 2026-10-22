import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The Final Review. A "/" in a post slug (e.g. 2009/01/...) is stored as "__" in the filename.
const blog = defineCollection({
  loader: glob({
    pattern: '*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replaceAll('__', '/'),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** ISO date; omitted when the live blog never published one */
      date: z.string().optional(),
      /** false: only the month and year are known */
      dateExact: z.boolean().default(false),
      /** Position in the live blog's listing (1 = newest) */
      order: z.number(),
      author: z.string().default('Burnham Nationwide'),
      topics: z.array(z.object({ name: z.string(), slug: z.string() })).default([]),
      description: z.string().default(''),
      image: image().optional(),
      imageAlt: z.string().default(''),
      /** Set when the post moved (usually to a portfolio case study) */
      redirect: z.string().optional(),
    }),
});

export const collections = { blog };
