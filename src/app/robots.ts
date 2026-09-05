import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/organizador",
          "/checkout",
          "/confirmacion",
          "/ticket",
          "/rrpp",
          "/login",
          "/fondos",
          "/entradas",
          "/cuenta",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
