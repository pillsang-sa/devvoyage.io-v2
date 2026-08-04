import Link from "next/link";
import { MarkdownAsync, type Components } from "react-markdown";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import { MarkdownImage } from "./markdown-image";

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
        </a>
      );
    }

    return (
      <Link {...rest} href={href}>
        {children}
      </Link>
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
        [rehypePrettyCode, prettyCodeOptions],
      ]}
      components={components}
    >
      {children}
    </MarkdownAsync>
  );
}
