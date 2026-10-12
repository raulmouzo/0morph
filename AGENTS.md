<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Guidance for coding agents working on **0morph**: a collection of private
file tools that run entirely in the browser. Nothing is uploaded; there is
no backend for user files. Live at https://0morph.raulmouzo.com.

## Project overview

- **Stack:** Next.js 16 (App Router, `cacheComponents`), React 19,
  TypeScript, Tailwind CSS v4, shadcn/ui on Base UI, Vitest.
- **Tools:** only the image editor (`/images`) is released. `/video` and
  `/audio` exist but are disabled in `lib/categories.ts` and marked
  `noindex`.
- **Image engine:** [`wasm-vips`](https://github.com/kleisauke/wasm-vips),
  the WebAssembly port of libvips, running in a Web Worker.

The image editor supports resize (with aspect lock), crop (free and
fixed ratios), rotate and flip, a max-dimension clamp, conversion to
JPEG / PNG / WebP / AVIF with a quality control and the resulting size, a
one-click "optimize for web" preset, metadata stripping, batch editing of
up to 20 images and a before/after comparison.

## Setup and commands

Use **pnpm** (the version is pinned in `package.json`).

```bash
pnpm install
pnpm dev         # dev server; copies wasm-vips into public/ first
pnpm build       # production build; same copy step
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest (use `pnpm test --run` for a single run)
pnpm format      # Prettier on *.ts / *.tsx
pnpm lint        # ESLint (currently fails: typescript-eslint doesn't support TS 7 yet)
```

Before finishing a change, run `pnpm typecheck` and `pnpm test --run`;
run `pnpm build` when touching routes, metadata files or config.

## Project structure

```
app/
  (site)/            home, /video, /audio — narrow column layout
  images/            /images (wide layout) and its UI in _components/
  _components/       home and shared page components (hero, samples…)
  layout.tsx         root metadata, viewport, fonts, providers
  opengraph-image.tsx, icon.svg, apple-icon.png, manifest.ts,
  robots.ts, sitemap.ts       SEO and app icons (file conventions)
components/          app-wide components; ui/ holds the primitives
hooks/               client hooks (full screen, paste, element size…)
lib/
  image/             framework-agnostic editor logic (see below)
  site.ts            site name, URL, author and brand colours
  og.tsx             shared Open Graph card renderer
  categories.ts      tools, their routes and whether they are enabled
public/samples/      sample photos (home gallery and pipeline tests)
scripts/             build helpers (copy-wasm-vips.mjs)
```

`lib/image/` contains the edit recipe (`recipe.ts`), the libvips pipeline
(`pipeline.ts`), the worker (`engine.worker.ts`) with its typed protocol
and main-thread client, and batch export. Keep it free of React and
Next.js imports.

## Architecture constraints

- **Client-side only.** User files must never leave the browser: no
  uploads, no server actions or route handlers that receive them. This
  is the product's promise, stated in `components/import-dropzone.tsx`.
- **Cross-origin isolation.** wasm-vips only ships a threaded build, which
  needs `SharedArrayBuffer`, so every page sends
  `Cross-Origin-Opener-Policy: same-origin` and
  `Cross-Origin-Embedder-Policy: require-corp` (`next.config.ts`). The
  headers are site-wide because browsers only read them on a full
  document load. Anything embedded from another origin (images, iframes,
  scripts) must send CORP/CORS headers or it won't load.
- **wasm-vips is not bundled.** `scripts/copy-wasm-vips.mjs` copies its
  browser build to `public/vendor/wasm-vips/` (git-ignored) and the worker
  loads it at runtime. Use the `keep` save option to drop metadata;
  `strip` no longer exists in libvips 8.15+.
- **Open Graph images** are rendered with Satori, which can't read
  variable fonts: they use the static Nohemi instances in `app/fonts/og/`.

## Code style

- Prettier: no semicolons, double quotes, 2 spaces, `trailingComma: es5`,
  Tailwind classes sorted by `prettier-plugin-tailwindcss` (also inside
  `cn()` and `cva()`).
- Import aliases: `@/components`, `@/lib`, `@/hooks`.
- Theme colours are CSS variables in `app/globals.css` (light and `.dark`);
  use the Tailwind tokens (`bg-background`, `text-muted-foreground`…)
  rather than raw colours. Brand hex values live in `lib/site.ts`.
- Comments explain *why*, in full sentences, at the density of the
  surrounding code.
- The site's copy is in English.

## Testing

- Unit tests sit next to the code as `*.test.ts` (mostly `lib/`).
- Pipeline tests run the Node build of wasm-vips on the images in
  `public/samples/`; keep those files, they are fixtures.
- UI changes have no automated tests: check them in the browser with
  `pnpm dev`, in both themes and at phone width.

## Commits and pull requests

- [Conventional Commits](https://www.conventionalcommits.org) with a
  scope: `feat(images): …`, `fix(layout): …`, `chore(deps): …`.
- Subject in the imperative, lower case, no trailing period; the body
  explains what changed and why, wrapped at 72 columns.
- One feature or fix per commit.
