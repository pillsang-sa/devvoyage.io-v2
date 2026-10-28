import type { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

/**
 * The table of contents links to ids that `rehype-slug` writes while the post
 * renders, so the ids here have to come out of the same steps. Running the
 * real pipeline rather than matching `## ` lines is what keeps the two in
 * step: a `#` inside a code block is not a heading, inline code is slugged by
 * its text, and a repeated title gets the same `-1` suffix in both places.
 *
 * Only the steps up to `rehype-slug` matter; nothing after it touches ids.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug);

export function getHeadings(markdown: string): Heading[] {
  const tree = processor.runSync(processor.parse(markdown)) as Root;

  // Headings are block-level, so they only ever sit at the root of the tree.
  return tree.children
    .filter(
      (node): node is Element =>
        node.type === "element" &&
        (node.tagName === "h2" || node.tagName === "h3"),
    )
    .map((node) => ({
      id: String(node.properties.id),
      text: toString(node),
      level: node.tagName === "h2" ? 2 : 3,
    }));
}
