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
the formats and operations above (`extract_area` for crop, `resize`/
`thumbnail`, `rotate`, `flip`, per-format quality options, `strip` metadata
on save) with no server involved.

**Constraint:** wasm-vips's threaded build needs `SharedArrayBuffer`, which
requires the page to be cross-origin isolated (`Cross-Origin-Opener-Policy:
same-origin` + `Cross-Origin-Embedder-Policy: require-corp`). These headers
are scoped to the `/images` route only, not site-wide.
