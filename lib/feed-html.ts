import type { Root } from "hast";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { absoluteUrl } from "./site";

/**
 * A feed reader shows the post on its own page, or none at all, so anything
 * relative has nothing to resolve against: `/images/…` becomes a broken image
 * and `#section` points nowhere. Pin both to the post's real address.
 */
function rehypeAbsoluteUrls(postUrl: string) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      for (const attribute of ["href", "src"] as const) {
        const value = node.properties[attribute];
        if (typeof value !== "string") continue;

        if (value.startsWith("#")) {
          node.properties[attribute] = `${postUrl}${value}`;
        } else if (value.startsWith("/") && !value.startsWith("//")) {
          node.properties[attribute] = absoluteUrl(value);
        }
      }
    });
  };
}

/**
 * The post body as plain HTML for `<content:encoded>`. Deliberately a
 * smaller pipeline than the page's: no Shiki, because its colours live in
 * CSS variables a feed reader never loads, and the reader's own styling of a
 * bare `<pre><code>` reads better than half-applied highlighting. Raw HTML in
 * the markdown is dropped here exactly as it is on the page.
 */
export async function renderFeedHtml(
  markdown: string,
  postUrl: string,
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    // Same ids as the page, so a `#section` link lands on the same heading.
    .use(rehypeSlug)
    .use(rehypeAbsoluteUrls, postUrl)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
