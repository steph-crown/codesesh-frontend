import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6F2",
    theme_color: "#0A0A0A",
    orientation: "portrait-primary",
    categories: ["productivity", "utilities", "education"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      {
        src: "/logo-icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
