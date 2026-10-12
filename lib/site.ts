/** Site-wide identity, shared by the metadata, the icons and the footer. */
export const SITE = {
  name: "0morph",
  url: "https://0morph.raulmouzo.com",
  title: "0morph — private file tools that run in your browser",
  description:
    "Fast, private tools for your files that run entirely in your browser. Resize, crop, convert and compress images to JPEG, PNG, WebP or AVIF with no uploads, no accounts and no servers.",
  repo: "https://github.com/raulmouzo/0morph",
} as const

export const AUTHOR = {
  name: "Raúl Mouzo",
  url: "https://raulmouzo.com",
} as const

/** Brand colours, from the isotype (light / dark). */
export const BRAND = {
  ink: "#17433f",
  green: "#558467",
  muted: "#55625f",
  paper: "#f7faf8",
} as const
