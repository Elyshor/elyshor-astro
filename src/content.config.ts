import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const music = defineCollection({
  loader: glob({ base: './src/content/music', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    track: z.string(),
    date: z.coerce.date(),
    year: z.number().optional(),
    label: z.string().optional(),
    spotify: z.string().url(),
    youtube: z.string().url().optional(),
    cover: z.string().optional(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
  }),
});

const powerpuffpeons = defineCollection({
  loader: glob({ base: './src/content/powerpuffpeons', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const setup = defineCollection({
  loader: glob({ base: './src/content/setup', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    category: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { music, powerpuffpeons, setup };
