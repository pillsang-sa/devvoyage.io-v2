import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import type { ComponentPropsWithoutRef } from "react";

/**
 * A static export cannot use the Image Optimization API, so this is a plain
 * `<img>`. What it does add is intrinsic dimensions, read from the file in
 * `public/` at build time, so the browser can reserve space and the article
 * does not shift while images load.
 */
function intrinsicSize(src: string): { width: number; height: number } | undefined {
  if (!src.startsWith("/")) return undefined;

  try {
    const file = path.join(process.cwd(), "public", src);
    const { width, height } = imageSize(fs.readFileSync(file));
    if (!width || !height) return undefined;
    return { width, height };
  } catch {
    // Missing file or unsupported format: fall back to rendering without size.
    return undefined;
  }
}

type Props = ComponentPropsWithoutRef<"img"> & { node?: unknown };

// `node` is destructured only to keep react-markdown's hast node out of
// `...rest`, which is spread onto the <img> below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MarkdownImage({ src, alt, node: _node, ...rest }: Props) {
  if (typeof src !== "string") return null;

  const size = intrinsicSize(src);

  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element -- static export has no image optimizer */}
      <img
        {...rest}
        src={src}
        alt={alt ?? ""}
        width={size?.width}
        height={size?.height}
        loading="lazy"
        decoding="async"
        className="h-auto w-full rounded-lg border border-border"
      />
      {alt ? (
        <figcaption className="mt-3 text-center text-sm text-muted">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
