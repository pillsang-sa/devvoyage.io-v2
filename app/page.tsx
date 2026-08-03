import Link from "next/link";

const destinations = [
  {
    href: "/blog",
    label: "BLOG",
    description: "개발하며 배운 것들을 기록합니다.",
  },
  {
    href: "/portfolio",
    label: "PORTFOLIO",
    description: "그동안 만들어온 작업들입니다.",
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-28">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          devvoyage
        </h1>
        <p className="mt-3 text-sm text-muted sm:text-base">
          만들고, 기록합니다.
        </p>
      </header>

      <nav className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2">
        {destinations.map(({ href, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col justify-between gap-8 rounded-2xl border border-border p-6 transition-colors hover:border-accent hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-7"
          >
            <div>
              <h2 className="font-mono text-sm font-semibold tracking-widest group-hover:text-accent">
                {label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {description}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="text-lg text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
            >
              →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
