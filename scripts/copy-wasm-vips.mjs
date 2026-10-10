// Copies the wasm-vips browser build into public/ so it can be served as-is.
// The wasm-vips README requires vips-es6.js and its .wasm files to be served
// from the same directory, so they are not run through the bundler.
import { copyFile, mkdir } from "node:fs/promises"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const sourceDir = dirname(require.resolve("wasm-vips/vips.wasm"))
const targetDir = join(root, "public", "vendor", "wasm-vips")

// vips-heif.wasm adds AVIF support. vips-jxl.wasm and vips-resvg.wasm are
// left out because the engine only loads the HEIF module.
const files = ["vips-es6.js", "vips.wasm", "vips-heif.wasm"]

await mkdir(targetDir, { recursive: true })
await Promise.all(
  files.map((file) => copyFile(join(sourceDir, file), join(targetDir, file)))
)
