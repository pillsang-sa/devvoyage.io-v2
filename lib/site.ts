/**
 * One source of truth for the canonical origin. `metadataBase` in the root
 * layout, the sitemap, the RSS feed and the OG cards all have to agree on it,
 * and a mismatch is the kind of thing nothing catches until a crawler does.
 */
export const SITE_URL = "https://devvoyage.io";
export const SITE_NAME = "devvoyage";
/** What the blog is. Used by /blog, the RSS channel and the Blog schema. */
export const SITE_DESCRIPTION = "개발하며 배운 것들을 기록합니다.";
/** What the *site* is — the home page says this, so its metadata should too. */
export const SITE_TAGLINE = "만들고, 기록합니다.";
export const SITE_LOCALE = "ko_KR";
/** BCP 47 form of `SITE_LOCALE`; schema.org wants this shape, Open Graph the other. */
export const SITE_LANGUAGE = "ko-KR";

export const SITE_AUTHOR = "PILLSANG SUNG";
export const SITE_AUTHOR_JOB_TITLE = "프론트엔드 개발자";

/**
 * Becomes `Person.sameAs`, which is how a name stops being a string and starts
 * being someone: a crawler can cross-check these profiles against each other
 * and resolve all of them — and every post they author — to one entity.
 *
 * Worth linking back to devvoyage.io from each of these. A claim both ends
 * make carries considerably more weight than one this site makes alone.
 */
export const SITE_AUTHOR_PROFILES = [
  "https://github.com/pillsang-sa",
  "https://www.linkedin.com/in/pillsang-sung/",
] as const;

/**
 * Naver Search Advisor. The same code appears twice on purpose: once as the
 * file `public/naver<code>.html`, and once as the meta tag below, so ownership
 * still verifies if Naver is checking by whichever method the console is set to.
 */
export const NAVER_SITE_VERIFICATION = "11f3adb3a1e9430a9787909ccc849e7f";

/** Doubles as `Person.knowsAbout` in the structured data. */
export const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "RDBMS",
  "Git",
] as const;

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
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: `${SITE_NAME} — 청록빛 배경 위로 유리 같은 곡선이 겹쳐 흐르는 추상 이미지`,
} as const;
