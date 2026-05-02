"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export function ScrollStrip({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    check();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [check]);

  function scroll(dir: "left" | "right") {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] shadow-md transition-all hover:scale-105 hover:shadow-lg sm:-left-4"
          aria-label="Scroll left"
        >
          <svg className="h-4 w-4 text-[var(--foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div
        ref={ref}
        className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
        <div className="w-5 shrink-0 sm:w-1" aria-hidden />
      </div>

      {canRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] shadow-md transition-all hover:scale-105 hover:shadow-lg sm:-right-4"
          aria-label="Scroll right"
        >
          <svg className="h-4 w-4 text-[var(--foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
