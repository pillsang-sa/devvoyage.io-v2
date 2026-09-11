import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Defines the `#person` and `#website` nodes that every other page's
            structured data points at, so they exist wherever a crawler lands. */}
        <JsonLd data={siteSchema()} />
        <SiteHeader />
        <main className="flex-1">{children}</main>
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
