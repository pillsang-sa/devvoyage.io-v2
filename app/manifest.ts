import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Metadata routes are Route Handlers, and `output: "export"` requires each one
// to say plainly that it can be rendered once at build time.
export const dynamic = "force-static";

/**
 * Only what "add to home screen" actually reads. The icon sizes a generator
 * emits for older Android densities are left out: a browser picks the closest
 * size and scales it, so 192px covers every one of them.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_TAGLINE,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon2.png", sizes: "96x96", type: "image/png" },
      { src: "/icon3.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
