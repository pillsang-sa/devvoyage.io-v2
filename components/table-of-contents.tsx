import type { Heading } from "@/lib/toc";

/**
 * Plain anchors rather than `next/link`: every target is on this page, so
 * there is no route to prefetch and the browser's own fragment jump is all
 * that is needed. No scroll tracking either — that would be the first client
 * JavaScript on the post page, for a highlight the reader can do without.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  return (
    <ol className="space-y-2 text-sm leading-snug">
      {headings.map(({ id, text, level }) => (
        <li key={id} className={level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${id}`}
            className="rounded-sm text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {text}
          </a>
        </li>
      ))}
    </ol>
  );
}
