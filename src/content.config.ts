import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().optional(),
  heroImage: z.string().optional(),
});

const music = defineCollection({
  loader: glob({ base: './src/content/music', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema.extend({
    artist: z.string().optional(),
    track: z.string().optional(),
    spotifyUrl: z.string().url().optional(),
    youtubeUrl: z.string().url().optional(),
  }),
});

const wow = defineCollection({
  loader: glob({ base: './src/content/wow', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema,
});

const tech = defineCollection({
  loader: glob({ base: './src/content/tech', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema,
});

const cats = defineCollection({
  loader: glob({ base: './src/content/cats', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema,
});

export const collections = { music, wow, tech, cats };
