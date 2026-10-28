import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { siteSchema } from "@/lib/schema";
import {
  NAVER_SITE_VERIFICATION,
  OG_IMAGE,
  SITE_AUTHOR,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  absoluteUrl,
  alternatesFor,
} from "@/lib/site";
import "./globals.css";

/**
 * Pretendard for all body text, Latin included. Geist only ever covered Latin,
 * so Hangul fell through to whatever the OS had and the same page read
 * differently on a Mac and a PC; one family also keeps the two scripts on the
 * same weight and height inside a mixed sentence.
 *
 * The variable file carries every weight and every Hangul syllable in one
 * download. It sits in `app/fonts/` rather than `public/` so the only copy
 * that ships is the hashed one `next/font` emits.
 */
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // The home page has no title of its own, so this is what it gets. The name
    // is in it because a personal site's most valuable query is the person's.
    default: `${SITE_NAME} — ${SITE_AUTHOR}`,
    template: `%s · ${SITE_NAME}`,
  },
  // The site's own line, not the blog's — /blog states that one, and two pages
  // sharing a description means neither gets a useful snippet.
  description: SITE_TAGLINE,
  // Inherited by every page that does not name its own author.
  authors: [{ name: SITE_AUTHOR, url: absoluteUrl("/") }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  alternates: alternatesFor("/"),
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: absoluteUrl("/"),
    title: `${SITE_NAME} — ${SITE_AUTHOR}`,
    description: SITE_TAGLINE,
    images: [OG_IMAGE],
  },
  // Opts into X's wide card. Without it the preview image is cropped into a
  // small square thumbnail beside the text instead of leading the card.
  twitter: { card: "summary_large_image" },
  // `public/naver<code>.html` proves the same thing by file; this covers the
  // case where Search Advisor is set to verify by meta tag instead.
  verification: {
    other: { "naver-site-verification": NAVER_SITE_VERIFICATION },
  },
};

/**
 * Tints the mobile browser's address bar to match the page. Mirrors
 * `--background` in globals.css; it follows the OS preference, since a meta
 * tag cannot see the `data-theme` a visitor picked with the toggle.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/**
 * Runs synchronously while the browser parses <head>, so the theme is settled
 * before the first paint and there is no flash. Falls back to the OS preference
 * until the visitor picks one explicitly.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme="light"
      suppressHydrationWarning
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* The first thing Tab reaches, so a keyboard user can pass the site
            header on every page. Hidden until focused. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-20 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:shadow-md focus:outline-2 focus:outline-accent"
        >
          본문으로 건너뛰기
        </a>
        {/* Defines the `#person` and `#website` nodes that every other page's
            structured data points at, so they exist wherever a crawler lands. */}
        <JsonLd data={siteSchema()} />
        <SiteHeader />
        {/* `tabIndex={-1}` lets the skip link move focus here, not just the
            scroll position, so the next Tab continues inside the content.
            `scroll-mt-20` clears the sticky header on the jump. */}
        <main id="main" tabIndex={-1} className="flex-1 scroll-mt-20 outline-none">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
            <span>© {new Date().getFullYear()} {SITE_NAME}</span>
            {/* The <link rel="alternate"> in <head> only helps a reader that is
                already looking; this is how a person finds the feed. */}
            <a
              href="/feed.xml"
              className="rounded-md transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              RSS
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
