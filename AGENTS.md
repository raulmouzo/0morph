<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Image editing tools

## Goal

Fully client-side image editor — nothing ever leaves the browser, consistent with the app's existing promise
in `components/import-dropzone.tsx`.

Target capabilities:
- Resize — width, height, lock aspect ratio.
- Crop — free-form and fixed aspect-ratio presets.
- Format conversion — JPEG, PNG, WebP, AVIF.
- Quality/compression control, with resulting file size shown.
- One-click "optimize for web" preset.
- Rotate (90°/180°/270°) and flip (horizontal/vertical).
- Max-dimension clamp (e.g. limit to 1920px, 1280px).
- Strip EXIF/metadata.
- Batch processing — apply the same edits to many images at once.
- Before/after comparison with final size and % saved.

**Engine:** [`wasm-vips`](https://github.com/kleisauke/wasm-vips), the
WebAssembly port of libvips (the library sharp wraps). It supports all of
the formats and operations above (`extract_area` for crop, `resize`, `rot`,
`flip`, per-format quality options, and the `keep` save option to drop
metadata; `strip` no longer exists in libvips 8.15+) with no server involved.

**Constraint:** wasm-vips only ships a threaded build, which needs
`SharedArrayBuffer`, so pages must be cross-origin isolated
(`Cross-Origin-Opener-Policy: same-origin` +
`Cross-Origin-Embedder-Policy: require-corp`, set in `next.config.ts`).
These headers are **site-wide**: browsers only read them on a full document
load, so client-side navigations into `/images` would never become
isolated if only that route had them. Anything embedded from another origin
(images, iframes, scripts) must send CORP/CORS headers.

## Implementation

- `lib/image/` holds the framework-agnostic logic: the edit recipe
  (`recipe.ts`), the libvips pipeline (`pipeline.ts`), and the worker
  (`engine.worker.ts`) with its typed protocol and main-thread client.
- wasm-vips runs in a dedicated Web Worker. Its browser build is copied from
  `node_modules` to `public/vendor/wasm-vips/` by
  `scripts/copy-wasm-vips.mjs` (run by `pnpm dev`/`pnpm build`) and loaded
  at runtime, not bundled.
- The UI lives in `app/images/_components/`; shared primitives (slider,
  accordion, etc.) are in `components/ui/`, built on Base UI.
- `pnpm test` runs Vitest; pipeline tests use the Node build of wasm-vips
  with the images in `public/samples/`.
