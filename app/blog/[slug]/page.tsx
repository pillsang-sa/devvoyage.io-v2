import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown/markdown";
import { formatDate } from "@/lib/format";
import { getAllSlugs, getPost } from "@/lib/posts";

// A static export cannot render slugs that were not known at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) return {};

  return {
    title: post.meta.title,
    description: post.meta.summary,
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.meta.summary,
      publishedTime: post.meta.publishedAt,
      modifiedTime: post.meta.updatedAt,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) notFound();

  const { meta, content } = post;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
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

        <div className="prose prose-neutral max-w-none md:prose-lg">
          <Markdown>{content}</Markdown>
        </div>
      </article>

      <nav className="mt-16 border-t border-border pt-8">
        <Link
          href="/blog"
          className="inline-flex h-11 items-center rounded-lg text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← 목록으로
        </Link>
      </nav>
    </div>
  );
}
