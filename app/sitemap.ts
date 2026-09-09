import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/site";

// Metadata routes are Route Handlers, and `output: "export"` requires each one
// to say plainly that it can be rendered once at build time.
export const dynamic = "force-static";


/**
 * `changeFrequency` and `priority` are deliberately absent: Google has stated
 * it ignores both, so they would be noise that still has to be kept accurate.
 * `lastModified` is the one hint that is actually read.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  // The newest post is the best available answer for "when did /blog change?".
  const latestPost = posts[0]?.updatedAt ?? posts[0]?.publishedAt;

  return [
    { url: absoluteUrl("/"), lastModified: latestPost },
    { url: absoluteUrl("/blog"), lastModified: latestPost },
    { url: absoluteUrl("/portfolio") },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt,
    })),
  ];
}
