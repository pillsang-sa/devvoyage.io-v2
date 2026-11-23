"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A header link that knows whether the visitor is in its section. The exact
 * page is `aria-current="page"`; a page below it, such as a blog post, is
 * `aria-current="true"` because the link does not point at that page itself.
 */
export function SiteNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname().replace(/\/$/, "");
  const isPage = pathname === href;
  const isSection = isPage || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isPage ? "page" : isSection ? "true" : undefined}
      className={`grid h-11 place-items-center rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-3 ${
        isSection ? "text-foreground" : "text-muted"
      }`}
    >
      {label}
    </Link>
  );
}
