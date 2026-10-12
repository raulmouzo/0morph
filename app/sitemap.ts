import type { MetadataRoute } from "next"

import { ENABLED_CATEGORIES } from "@/lib/categories"
import { SITE } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    // Tools that aren't out yet stay out of the index.
    ...ENABLED_CATEGORIES.map((category) => ({
      url: `${SITE.url}${category.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
