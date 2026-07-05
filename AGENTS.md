## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Design Protection

The current bright Elyshor design is the required visual baseline and must not be completely changed without explicit instruction.

- Do not introduce a new dark/gold template look.
- Preserve the colorful Elyshor logo, the small ELY logo, the existing colors, spacing, cards, and background texture.
- For new features, change only the files that are specifically needed.
- Do not rebuild the Header, Footer, LogoHero, global styles, or MusicCard without a concrete reason.
- Do not change Cloudflare, DNS, GitHub remote, or deployment configuration.
- When changing the homepage, the music post cards must remain visible.
- The heading "neuste beiträge" stays removed, but the posts themselves stay visible.
- Run `npm run build` before larger changes.
