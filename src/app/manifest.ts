import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tickeame",
    short_name: "Tickeame",
    description: "Entradas para fiestas y eventos en Argentina.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4EEDC",
    theme_color: "#2B1D4A",
    lang: "es-AR",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
