import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-muted sm:text-base">
        주소가 바뀌었거나 삭제된 글일 수 있습니다.
      </p>
      <Link
        href="/blog"
        className="mt-2 inline-flex h-11 items-center rounded-lg text-sm font-medium text-accent transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        블로그 목록으로 →
      </Link>
    </div>
  );
}
