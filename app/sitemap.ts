import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const now = new Date();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/my-sessions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];
}
