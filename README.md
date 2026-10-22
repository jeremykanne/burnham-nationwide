# burnhamnationwide.com

The Burnham Nationwide website, built with [Astro](https://astro.build). Styling follows the Burnham Nationwide Design System (Archivo + Public Sans, Burnham orange `#f5901e`, navy `#3a3f45`).

## Commands

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm install`     | Install dependencies                           |
| `npm run dev`     | Local dev server at http://localhost:4321      |
| `npm run build`   | Build the static site into `dist/`             |
| `npm run preview` | Serve the built `dist/` locally                |

## Where things live

- `src/layouts/BaseLayout.astro` — page shell: `<head>`, header, footer. Every page passes `title`, `description` and `nav` (the top-level menu section to highlight).
- `src/components/` — `Header`, `Footer`, `PhotoCard` (portfolio card), `PostCard` and the blog listing components.
- `src/pages/` — one file per page; URLs match the file paths (`about/team.astro` → `/about/team/`).
  - `portfolio/[slug].astro` renders every project in `src/data/portfolio.json`.
  - `contact/[slug].astro` renders every office in `src/data/offices.json`.
  - `final-review-blog/` holds the blog index, topic archives, post pages and RSS feed.
- `src/content/blog/` — blog posts as Markdown, one file per post (collection defined in `src/content.config.ts`). A `__` in a filename stands for `/` in the URL.
- `src/styles/` — `burnham.css` (design tokens and shared components) plus one stylesheet per site area.
- `public/assets/` — logo, favicon and page images served as-is.

## Common edits

- **New blog post:** add `src/content/blog/<slug>.md` with the same front matter as an existing post. Put images next to it under `images/` and reference them relatively; Astro optimizes them at build time.
- **New portfolio project or office:** add an entry to the JSON file in `src/data/`.
- **Moved page:** add the old → new path to `redirects` in `astro.config.mjs`.

## Deployment

Hosted on Netlify (project `burnham-nationwide`, https://burnham-nationwide.netlify.app). Every push to `main` triggers a build with the settings in `netlify.toml`; pull requests get deploy previews. The repo is connected through a read-only deploy key and a GitHub webhook, so no Netlify GitHub app install is required.

## Not wired up yet

The contact, careers and newsletter forms post nowhere; connect them to a form service before launch.

`legacy/` (local only, not in git) holds the pre-Astro Python build that `scripts/convert-blog.mjs` converted from; it can be deleted once this version is approved.
