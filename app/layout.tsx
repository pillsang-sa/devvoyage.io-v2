import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
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
  metadataBase: new URL("https://devvoyage.io"),
  title: {
    default: "devvoyage",
    template: "%s · devvoyage",
  },
  description: "개발하며 배운 것들을 기록합니다.",
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
        {/* Scroll reveals are hidden until script uncovers them; see the
            entrance-animation section of globals.css. */}
        <noscript>
          <style>{`[data-reveal],[data-badge]{opacity:1;transform:none;animation:none}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 text-sm text-muted sm:px-6">
            © {new Date().getFullYear()} devvoyage
          </div>
        </footer>
      </body>
    </html>
  );
}
