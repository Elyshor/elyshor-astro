# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

---

# Elyshor Astro

Statische Astro-Seite fuer Elyshor mit MDX, Content Collections und lokalen Assets. Kein WordPress, kein PHP, keine Datenbank und kein Tracking.

## Entwicklung

```sh
npm install
npm run dev
npm run build
```

Im Projekt ist fuer den Dev-Server `astro dev --background` vorgesehen. Die Hintergrundinstanz kann mit diesen Befehlen verwaltet werden:

```sh
npm run astro -- dev --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

Der Produktions-Build schreibt nach `dist/`.

## Cloudflare Pages

Build command:

```sh
npm run build
```

Output directory:

```text
dist
```

## Neue Musikposts

Neue Musikbeitraege werden als MDX-Dateien in `src/content/music/` angelegt. Der Dateiname wird zur URL, zum Beispiel:

```text
src/content/music/neuer-track.mdx
```

Pflichtfelder im Frontmatter:

```yaml
---
title: "Artist - Track"
artist: "Artist"
track: "Track"
date: 2026-07-04
spotify: "https://open.spotify.com/track/..."
tags:
  - house
  - electronic
---
```

Optionale Felder sind `year`, `label`, `youtube`, `cover` und `draft`. Coverbilder liegen unter `public/images/music/` und werden im Frontmatter als `/images/music/dateiname.webp` referenziert.

Spotify- und YouTube-Embeds werden auf Einzelpost-Seiten erst nach Zustimmung ueber `localStorage` mit dem Key `ely_media_consent` geladen.
