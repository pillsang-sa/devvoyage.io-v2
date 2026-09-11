import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Metadata routes are Route Handlers, and `output: "export"` requires each one
// to say plainly that it can be rendered once at build time.
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Naver's crawler. `*` already covers it, but Search Advisor's own
      // diagnostics look for the agent by name and flag its absence.
      { userAgent: "Yeti", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
