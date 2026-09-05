import type { MetadataRoute } from "next";
import { PUBLIC_EVENTS } from "@/lib/public-events";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-09-05");
  const pages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${site.url}/organizadores`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${site.url}/legal/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/legal/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/legal/arrepentimiento`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const events = PUBLIC_EVENTS.filter((e) => e.indexable).map((e) => ({
    url: `${site.url}/eventos/${e.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: e.slug === "neon" ? 0.9 : 0.7,
  }));

  return [...pages, ...events];
}
