# Contributing resources

Resources are static files in this app. There is no CMS: you add a folder, open a PR, and after merge + deploy the page is live on the **resources** subdomain.

## Folder layout

```text
content/<slug>/
  index.html   # Full HTML document (you control layout, colors, responsive CSS)
  meta.json    # SEO + social metadata for Next.js (required fields below)
```

- **slug**: URL segment — use lowercase, numbers, hyphens only (e.g. `react-roadmap-2026`).
- **`meta.json`** (required keys):
  - `title` — page title and default OG title
  - `description` — meta description and OG description
- **Optional**: `keywords` (string array), `tags` (string array), `ogImage` (absolute HTTPS URL to an existing 1200×630 PNG/JPG — SVGs are not rendered by social platforms). Leave it out to use the shared TBE preview image; a URL that 404s results in a blank preview card on WhatsApp/LinkedIn/X.

## Workflow

1. Copy `content/_template` to `content/<slug>/`.
2. Fill in `meta.json` and `index.html`.
3. Run locally: from repo root, `pnpm dev:resources` and open the resource at `http://localhost:3010/resources/<slug>`.
4. Open a PR. A reviewer should confirm:
   - Viewport meta is present for mobile readability.
   - Links are not broken.
   - Content is appropriate for public, brand-safe sharing.

## SEO notes

- `meta.json` drives `generateMetadata`, sitemap entries, and JSON-LD — keep descriptions accurate.
- Put meaningful text in the `<body>` of `index.html`; it is embedded into the site HTML for crawlers.
- Prefer inline `<style>` or linked stylesheets with **absolute** URLs if you use external CSS (relative paths may break when embedded).

## Environment (deploy)

- `NEXT_PUBLIC_RESOURCES_SITE_URL` — canonical site URL (default: `https://resources.theboringeducation.com`).
- `NEXT_PUBLIC_PLATFORM_URL` — main site for “Sign up” (default: `https://theboringeducation.com`).
