"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "copied" | "failed";

const LABEL: Record<Status, string> = {
  idle: "복사",
  copied: "복사됨",
  failed: "복사 실패",
};

/**
 * Reads the code out of the rendered block rather than taking it as a prop:
 * a prop would serialize every snippet a second time into the RSC payload,
 * while the text is already sitting in the DOM next to the button.
 */
export function CopyButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    const code = ref.current
      ?.closest("[data-code-block]")
      ?.querySelector("pre code");
    if (!code?.textContent) return;

    try {
      await navigator.clipboard.writeText(code.textContent);
      setStatus("copied");
    } catch {
      // Clipboard API missing or denied (insecure origin, permissions).
      setStatus("failed");
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-md px-1.5 py-0.5 font-mono text-xs text-muted transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {LABEL[status]}
    </button>
  );
}
