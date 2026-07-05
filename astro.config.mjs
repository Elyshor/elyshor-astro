// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://elyshor.de',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => ![
        'https://elyshor.de/datenschutz/',
        'https://elyshor.de/impressum/',
      ].includes(page),
    }),
  ]
});
