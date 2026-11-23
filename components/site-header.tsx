import Link from "next/link";
import { SiteNavLink } from "./site-nav-link";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { href: "/blog", label: "블로그" },
  { href: "/portfolio", label: "포트폴리오" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="rounded-md text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          devvoyage
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <SiteNavLink key={href} href={href} label={label} />
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
