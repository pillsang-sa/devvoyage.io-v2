import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type PostMeta = {
  slug: string;
  title: string;
  summary?: string;
  /** ISO date, `YYYY-MM-DD`. */
  publishedAt: string;
  /** ISO date, `YYYY-MM-DD`. Absent when the post was never revised. */
  updatedAt?: string;
  draft: boolean;
};

export type Post = {
  meta: PostMeta;
  content: string;
};

/**
 * gray-matter runs YAML through js-yaml, which turns an unquoted `2026-08-01`
 * into a JS `Date`. Normalize everything to a plain `YYYY-MM-DD` string so the
 * shape stays serializable and comparable.
 */
function toDateString(value: unknown, file: string, field: string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`${file}: \`${field}\` is not a valid date: "${value}"`);
    }
    return parsed.toISOString().slice(0, 10);
  }
  throw new Error(`${file}: \`${field}\` must be a date (YYYY-MM-DD)`);
}

function readPost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  if (typeof data.title !== "string" || data.title.trim() === "") {
    throw new Error(`${fileName}: front matter is missing \`title\``);
  }
  if (data.publishedAt == null) {
    throw new Error(`${fileName}: front matter is missing \`publishedAt\``);
  }

  const publishedAt = toDateString(data.publishedAt, fileName, "publishedAt");
  const updatedAt =
    data.updatedAt == null
      ? undefined
      : toDateString(data.updatedAt, fileName, "updatedAt");

  return {
    meta: {
      slug,
      title: data.title,
      summary: typeof data.summary === "string" ? data.summary : undefined,
      publishedAt,
      // A same-day `updatedAt` carries no information, so drop it.
      updatedAt: updatedAt === publishedAt ? undefined : updatedAt,
      draft: data.draft === true,
    },
    content,
  };
}

function readAllPosts(): Post[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readPost)
    .filter((post) => !post.meta.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => b.meta.publishedAt.localeCompare(a.meta.publishedAt));
}

export function getAllPosts(): PostMeta[] {
  return readAllPosts().map((post) => post.meta);
}

export function getAllSlugs(): string[] {
  return readAllPosts().map((post) => post.meta.slug);
}

export function getPost(slug: string): Post | undefined {
  return readAllPosts().find((post) => post.meta.slug === slug);
}
