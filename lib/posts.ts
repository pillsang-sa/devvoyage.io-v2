import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { SITE_AUTHOR } from "./site";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type PostMeta = {
  slug: string;
  title: string;
  summary?: string;
  /** Front matter `author`, falling back to the site's own. */
  author: string;
  /** ISO date, `YYYY-MM-DD`. */
  publishedAt: string;
  /** ISO date, `YYYY-MM-DD`. Absent when the post was never revised. */
  updatedAt?: string;
  draft: boolean;
  /** Whole minutes, at least 1. See `readingMinutes`. */
  readingMinutes: number;
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

/** Roughly what an adult reads silently: Hangul syllables, Latin words. */
const HANGUL_PER_MINUTE = 500;
const WORDS_PER_MINUTE = 200;

/**
 * Hangul and Latin are counted apart because one syllable and one word are
 * very different amounts of reading. Code is counted too, token by token at
 * the word rate: in a post that is half code, the code is half the reading,
 * and leaving it out ranked a 250-line walkthrough alongside a 50-line note.
 * Link and image targets are dropped — they are syntax, not text anyone reads.
 */
function readingMinutes(markdown: string): number {
  const text = markdown.replace(/\]\([^)]*\)/g, "]");

  const syllables = text.match(/[\uAC00-\uD7A3]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9_]+/g)?.length ?? 0;

  return Math.max(
    1,
    Math.round(syllables / HANGUL_PER_MINUTE + words / WORDS_PER_MINUTE),
  );
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
      author:
        typeof data.author === "string" && data.author.trim() !== ""
          ? data.author
          : SITE_AUTHOR,
      publishedAt,
      // A same-day `updatedAt` carries no information, so drop it.
      updatedAt: updatedAt === publishedAt ? undefined : updatedAt,
      draft: data.draft === true,
      readingMinutes: readingMinutes(content),
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

/** The posts published just before and just after this one, if any. */
export function getAdjacentPosts(slug: string): {
  older?: PostMeta;
  newer?: PostMeta;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return {};

  // Newest first, so the older post is the next one down the list.
  return { older: posts[index + 1], newer: posts[index - 1] };
}
