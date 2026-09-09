import type { Metadata } from "next";
import { PostListItem } from "@/components/post-list-item";
import { getAllPosts } from "@/lib/posts";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  absoluteUrl,
  alternatesFor,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "블로그",
  description: SITE_DESCRIPTION,
  alternates: alternatesFor("/blog"),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: absoluteUrl("/blog"),
    title: `블로그 · ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">블로그</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          개발하며 배운 것들을 기록합니다.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
          아직 작성된 글이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {posts.map((post) => (
            <PostListItem key={post.slug} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
