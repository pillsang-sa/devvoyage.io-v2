import Link from "next/link";
import { MarkdownAsync, type Components } from "react-markdown";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import { CopyButton } from "./copy-button";
import { MarkdownImage } from "./markdown-image";

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/**
 * Every markdown image is lazy by default, which is right for most of them and
 * wrong for the first: near the top of a post it is often the largest thing on
 * screen, and a lazy image is not fetched until layout proves it is visible,
 * which delays LCP. Only the renderer knows document order, so the first <img>
 * is marked here and `MarkdownImage` reads the mark.
 */
function rehypeEagerFirstImage() {
  return (tree: HastNode) => {
    const find = (node: HastNode): HastNode | undefined => {
      if (node.type === "element" && node.tagName === "img") return node;
      for (const child of node.children ?? []) {
        const found = find(child);
        if (found) return found;
      }
    };

    const first = find(tree);
    if (first) first.properties = { ...first.properties, loading: "eager" };
  };
}

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  // Backgrounds come from our own theme variables so code blocks match the page.
  keepBackground: false,
};

const components: Components = {
  img: MarkdownImage,

  // `node` is react-markdown's hast node. Destructuring it is what keeps it out
  // of `...rest`; drop the binding and it reaches the DOM as
  // node="[object Object]". Unused by design, hence the disable.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  a({ href, children, node: _node, ...rest }) {
    if (typeof href !== "string") return <>{children}</>;

    if (/^https?:\/\//.test(href)) {
      return (
        <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
          {children}
          {/* The word joiner keeps the arrow on the same line as the last
              word of the link instead of wrapping on its own. */}
          <span aria-hidden="true">{"\u2060↗"}</span>
          <span className="sr-only">(새 탭)</span>
        </a>
      );
    }

    return (
      <Link {...rest} href={href}>
        {children}
      </Link>
    );
  },

  // Only fenced blocks reach here as <pre>, already highlighted by
  // rehype-pretty-code, which records the fence's language on the element.
  // The toolbar sits outside the <pre> so it stays put while long lines
  // scroll sideways underneath it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- see `a` above
  pre({ children, node: _node, ...rest }) {
    const language = (rest as Record<string, unknown>)["data-language"];

    return (
      <div data-code-block="" className="relative">
        <pre {...rest}>{children}</pre>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {typeof language === "string" ? (
            <span className="px-1.5 font-mono text-xs text-muted select-none">
              {language}
            </span>
          ) : null}
          <CopyButton />
        </div>
      </div>
    );
  },

  // Wide tables must scroll inside their own container rather than pushing the
  // page sideways on narrow screens.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- see `a` above
  table({ children, node: _node, ...rest }) {
    return (
      <div className="my-8 overflow-x-auto">
        <table {...rest} className="my-0">
          {children}
        </table>
      </div>
    );
  },
};

/**
 * `MarkdownAsync` rather than the default `Markdown`: the default component
 * runs the unified pipeline synchronously, and `rehype-pretty-code` awaits a
 * Shiki highlighter, which would fail with "runSync finished async".
 */
export function Markdown({ children }: { children: string }) {
  return (
    <MarkdownAsync
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeSlug,
        // A lone image is a paragraph in markdown, but `img` renders here as a
        // <figure>, which a <p> may not contain. The browser closes the <p>
        // early, and the DOM stops matching what the server sent.
        rehypeUnwrapImages,
        rehypeEagerFirstImage,
        [rehypePrettyCode, prettyCodeOptions],
      ]}
      components={components}
    >
      {children}
    </MarkdownAsync>
  );
}
