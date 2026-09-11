import { getAllPosts } from "@/lib/posts";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/site";

/**
 * A Route Handler under `output: "export"` runs once at build time and its
 * response is written out as a file, which is exactly what a feed wants.
 */
export const dynamic = "force-static";

/** The five characters that cannot appear raw in XML text or attributes. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS wants RFC 822 dates; `toUTCString` emits exactly that shape. */
function toRfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

export function GET(): Response {
  const posts = getAllPosts();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <dc:creator>${escapeXml(post.author)}</dc:creator>
${post.summary ? `      <description>${escapeXml(post.summary)}</description>\n` : ""}    </item>`;
    })
    .join("\n");

  // Deliberately the newest post's date rather than `new Date()`: the feed then
  // only changes when the content does, so a rebuild alone does not tell every
  // subscriber's reader that something happened.
  const lastBuildDate = posts[0]
    ? toRfc822(posts[0].updatedAt ?? posts[0].publishedAt)
    : undefined;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(absoluteUrl("/blog"))}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(SITE_AUTHOR)}</copyright>
${lastBuildDate ? `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n` : ""}    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
