/**
 * One source of truth for the canonical origin. `metadataBase` in the root
 * layout, the sitemap, the RSS feed and the OG cards all have to agree on it,
 * and a mismatch is the kind of thing nothing catches until a crawler does.
 */
export const SITE_URL = "https://devvoyage.io";
export const SITE_NAME = "devvoyage";
export const SITE_DESCRIPTION = "개발하며 배운 것들을 기록합니다.";
export const SITE_LOCALE = "ko_KR";

/**
 * `trailingSlash: true` means GitHub Pages serves `/blog/foo/`, and `/blog/foo`
 * only reaches it through a redirect. Canonical URLs, sitemap entries and feed
 * links must therefore carry the slash, or every one of them points at a hop.
 *
 * Paths that name a file — `/feed.xml` — are the exception, so anything with an
 * extension in its last segment is left alone.
 */
export function absoluteUrl(path: string): string {
  const rooted = path.startsWith("/") ? path : `/${path}`;
  const isFile = /\.[a-z0-9]+$/i.test(rooted.split("/").pop() ?? "");
  const normalized = isFile || rooted.endsWith("/") ? rooted : `${rooted}/`;

  return `${SITE_URL}${normalized}`;
}

/**
 * Next.js merges metadata across segments *shallowly*, so a page that sets
 * `alternates` replaces the root layout's rather than adding to it. Every page
 * with its own canonical therefore has to restate the feed link, or the feed
 * quietly vanishes from that page's <head>. Same trap applies to `openGraph`.
 */
export function alternatesFor(path: string) {
  return {
    canonical: absoluteUrl(path),
    types: { "application/rss+xml": absoluteUrl("/feed.xml") },
  };
}

/**
 * The shared link preview card, served as a plain file from `public/`.
 *
 * `og:image` must be absolute — a crawler has no page to resolve a relative
 * path against — and the dimensions must match the file, since a scraper uses
 * them to reserve the card's space before the image has finished downloading.
 */
export const OG_IMAGE = {
  url: absoluteUrl("/og.jpg"),
  width: 640,
  height: 360,
  type: "image/jpeg",
  alt: `${SITE_NAME} — 청록빛 그러데이션이 흐르는 추상 이미지`,
} as const;
