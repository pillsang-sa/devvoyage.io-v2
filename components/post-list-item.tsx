import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostMeta } from "@/lib/posts";

export function PostListItem({ post }: { post: PostMeta }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group -mx-3 block rounded-xl px-3 py-5 transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <article className="flex flex-col gap-2">
          <time
            dateTime={post.publishedAt}
            className="font-mono text-xs text-muted"
          >
            {formatDate(post.publishedAt)}
          </time>

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
