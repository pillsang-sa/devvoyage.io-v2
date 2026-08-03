import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "포트폴리오",
  description: "그동안 만들어온 작업들입니다.",
};

export default function PortfolioPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          포트폴리오
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          그동안 만들어온 작업들입니다.
        </p>
      </header>

      <p className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
        준비 중입니다.
      </p>

      <nav className="mt-16 border-t border-border pt-8">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg text-sm font-medium text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← 홈으로
        </Link>
      </nav>
    </div>
  );
}
