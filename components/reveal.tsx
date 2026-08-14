"use client";

import { useEffect, useRef } from "react";

/**
 * Fades its children in the first time they scroll into view, then stops
 * observing. The animation itself is CSS — this only flips `data-revealed`, so
 * the styling (including the reduced-motion and no-JS fallbacks) lives in
 * `globals.css` next to the rest of the theme.
 */
export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reveal = () => element.setAttribute("data-revealed", "");

    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal();
          observer.unobserve(entry.target);
        }
      },
      // A threshold in the middle would never fire for a card taller than the
      // viewport, so trigger on first contact and pull the bottom edge up
      // instead: the block reveals once it is a tenth of the way up the screen.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
