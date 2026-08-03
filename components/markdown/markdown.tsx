import Link from "next/link";
import { MarkdownAsync, type Components } from "react-markdown";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MarkdownImage } from "./markdown-image";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  // Backgrounds come from our own theme variables so code blocks match the page.
  keepBackground: false,
};

const components: Components = {
  img: MarkdownImage,

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
      rehypePlugins={[rehypeSlug, [rehypePrettyCode, prettyCodeOptions]]}
      components={components}
    >
      {children}
    </MarkdownAsync>
  );
}
