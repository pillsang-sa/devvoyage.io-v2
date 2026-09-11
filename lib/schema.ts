import type { PostMeta } from "./posts";
import {
  OG_IMAGE,
  SITE_AUTHOR,
  SITE_AUTHOR_JOB_TITLE,
  SITE_AUTHOR_PROFILES,
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SKILLS,
  absoluteUrl,
} from "./site";

/**
 * Stable `@id`s are what turn a pile of per-page snippets into one graph: the
 * author of every post, the publisher of the blog and the subject of the
 * portfolio all point at the same `#person` node rather than describing eight
 * lookalike people. Keep them absolute — a bare `#person` is only unique within
 * the page it was read from.
 */
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const BLOG_ID = `${absoluteUrl("/blog")}#blog`;

/** Everything that refers to the author instead of restating them. */
const authorRef = { "@id": PERSON_ID } as const;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE_AUTHOR,
  url: absoluteUrl("/"),
  jobTitle: SITE_AUTHOR_JOB_TITLE,
  sameAs: [...SITE_AUTHOR_PROFILES],
  knowsAbout: [...SKILLS],
  worksFor: {
    "@type": "Organization",
    name: "아이브코리아",
    url: "https://ivekorea.com",
  },
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: absoluteUrl("/"),
  name: SITE_NAME,
  description: SITE_TAGLINE,
  inLanguage: SITE_LANGUAGE,
  publisher: authorRef,
};

/**
 * Rendered by the root layout, so the person and the site are defined once on
 * every page and everything below can just reference them.
 */
export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [person, website],
  };
}

/** One post, as both the blog's own listing and the post page describe it. */
function blogPosting(post: PostMeta) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    url,
    headline: post.title,
    ...(post.summary ? { description: post.summary } : {}),
    datePublished: post.publishedAt,
    // Google reads `dateModified` for freshness and treats a missing one as
    // unknown rather than "never edited", so state it either way.
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Person", "@id": PERSON_ID, name: post.author },
    publisher: authorRef,
    image: [OG_IMAGE.url],
    inLanguage: SITE_LANGUAGE,
  };
}

export function blogSchema(posts: PostMeta[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        url: absoluteUrl("/blog"),
        name: `블로그 · ${SITE_NAME}`,
        description: SITE_DESCRIPTION,
        inLanguage: SITE_LANGUAGE,
        author: authorRef,
        publisher: authorRef,
        isPartOf: { "@id": WEBSITE_ID },
        blogPost: posts.map(blogPosting),
      },
      breadcrumb([{ name: "블로그", path: "/blog" }]),
    ],
  };
}

export function blogPostSchema(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...blogPosting(post),
        // Says "this page *is* the article", as opposed to a page that merely
        // mentions it. Without it the article and the page are two loose nodes.
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": absoluteUrl(`/blog/${post.slug}`),
        },
        isPartOf: { "@id": BLOG_ID },
      },
      breadcrumb([
        { name: "블로그", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  };
}

export function portfolioSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${absoluteUrl("/portfolio")}#profile`,
        url: absoluteUrl("/portfolio"),
        name: `포트폴리오 · ${SITE_NAME}`,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { "@id": WEBSITE_ID },
        // The page is *about* the person; `mainEntity` is what says so.
        mainEntity: authorRef,
      },
      breadcrumb([{ name: "포트폴리오", path: "/portfolio" }]),
    ],
  };
}

/**
 * The home page is always the first crumb, so callers pass only what comes
 * after it. `position` is 1-based and must have no gaps.
 */
function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: SITE_NAME, path: "/" }, ...trail].map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      }),
    ),
  };
}
