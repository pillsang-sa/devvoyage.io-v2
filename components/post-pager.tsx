import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

type Props = { older?: PostMeta; newer?: PostMeta };

/**
 * Older on the left, newer on the right, as the arrows read. A missing side
 * keeps its grid cell, so the post that is there does not jump across to the
 * other column on the first and last post.
 */
export function PostPager({ older, newer }: Props) {
  if (!older && !newer) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {older ? (
        <PagerLink post={older} label="← 이전 글" />
      ) : (
        <div aria-hidden="true" className="hidden sm:block" />
      )}
      {newer ? <PagerLink post={newer} label="다음 글 →" alignEnd /> : null}
    </div>
  );
}

function PagerLink({
  post,
  label,
  alignEnd = false,
}: {
  post: PostMeta;
  label: string;
  alignEnd?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col gap-1.5 rounded-xl border border-border p-5 transition-colors hover:border-accent hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${alignEnd ? "sm:text-right" : ""}`}
    >
      <span className="font-mono text-xs text-muted">{label}</span>
      <span className="font-semibold tracking-tight text-balance group-hover:text-accent">
        {post.title}
      </span>
    </Link>
  );
}
