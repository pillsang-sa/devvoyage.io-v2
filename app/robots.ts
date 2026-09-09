import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Metadata routes are Route Handlers, and `output: "export"` requires each one
// to say plainly that it can be rendered once at build time.
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
