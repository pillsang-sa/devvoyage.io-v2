import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown/markdown";
import { PostPager } from "@/components/post-pager";
import { TableOfContents } from "@/components/table-of-contents";
import { formatDate } from "@/lib/format";
import { getAdjacentPosts, getAllSlugs, getPost } from "@/lib/posts";
import { blogPostSchema } from "@/lib/schema";
import { getHeadings } from "@/lib/toc";
import {
  OG_IMAGE,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
  alternatesFor,
} from "@/lib/site";

// A static export cannot render slugs that were not known at build time.
export const dynamicParams = false;

/** Below this, a list of sections tells the reader nothing a glance would not. */
const MIN_TOC_HEADINGS = 3;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) return {};

  const { title, summary, author, publishedAt, updatedAt } = post.meta;

  return {
    title,
    description: summary,
    // Overrides the layout's site-wide author with whoever the front matter
    // credits, which is what `article:author` below reports to a crawler.
    authors: [{ name: author }],
    alternates: alternatesFor(`/blog/${slug}`),
    openGraph: {
      type: "article",
      // Restated because a nested metadata field replaces the layout's rather
      // than merging into it.
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: absoluteUrl(`/blog/${slug}`),
      title,
      description: summary,
      publishedTime: publishedAt,
      modifiedTime: updatedAt,
      authors: [author],
      images: [OG_IMAGE],
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) notFound();

  const { meta, content } = post;
  const headings = getHeadings(content);
  const showToc = headings.length >= MIN_TOC_HEADINGS;
  const { older, newer } = getAdjacentPosts(slug);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={blogPostSchema(meta)} />

      <article>
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-4xl">
            {meta.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted sm:text-sm">
            <time dateTime={meta.publishedAt}>{formatDate(meta.publishedAt)}</time>
            {meta.updatedAt ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  수정{" "}
                  <time dateTime={meta.updatedAt}>{formatDate(meta.updatedAt)}</time>
                </span>
              </>
            ) : null}
          </div>
        </header>

        {/* Below xl there is no room beside the column, so the contents sit
            above the body, folded so they do not push the first paragraph
            off the screen. */}
        {showToc ? (
          <details className="mb-10 rounded-xl border border-border px-5 py-4 xl:hidden">
            <summary className="cursor-pointer text-sm font-semibold">
              목차
            </summary>
            <nav aria-label="목차" className="mt-4">
              <TableOfContents headings={headings} />
            </nav>
          </details>
        ) : null}

        <div className="relative">
          {/* Hung in the right margin, outside the 3xl column, so the body
              keeps its measure. At xl the margin is wide enough for it. */}
          {showToc ? (
            <aside className="absolute top-0 left-full ml-10 hidden h-full w-48 xl:block">
              <nav
                aria-label="목차"
                className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
              >
                <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-muted">
                  목차
                </p>
                <TableOfContents headings={headings} />
              </nav>
            </aside>
          ) : null}

          <div className="prose prose-neutral max-w-none md:prose-lg">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </article>

      <nav
        aria-label="다른 글"
        className="mt-16 flex flex-col gap-6 border-t border-border pt-8"
      >
        <PostPager older={older} newer={newer} />
        <Link
          href="/blog"
          className="inline-flex h-11 items-center self-start rounded-lg text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← 목록으로
        </Link>
      </nav>
    </div>
  );
}
