import Link from "next/link";
import { formatDate, formatReadingTime } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";

export function PostListItem({ post }: { post: PostMeta }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group -mx-3 block rounded-xl px-3 py-5 transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <article className="flex flex-col gap-2">
          <p className="flex gap-x-2 font-mono text-xs text-muted">
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{formatReadingTime(post.readingMinutes)}</span>
          </p>

          <h2 className="text-lg font-semibold tracking-tight group-hover:text-accent sm:text-xl">
            {post.title}
          </h2>

          {post.summary ? (
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              {post.summary}
            </p>
          ) : null}
        </article>
      </Link>
    </li>
  );
}
