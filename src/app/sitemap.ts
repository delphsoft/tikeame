import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/login",
    "/eventos/neon",
    "/checkout",
    "/organizador",
    "/organizador/nuevo",
    "/organizador/neon",
    "/organizador/checkin",
    "/organizador/rrpp",
    "/admin",
    "/rrpp",
    "/rrpp/embajador",
    "/rrpp/invitacion",
  ];
  return paths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date("2026-09-04"),
  }));
}
