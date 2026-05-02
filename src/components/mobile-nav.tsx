"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/lib/auth-actions";

type MobileNavProps = {
  session: {
    name: string;
    initials: string;
    isAdmin: boolean;
  } | null;
};

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const linkClass =
    "block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground)]/80 transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]";

  return (
    <div className="relative sm:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)]/70 transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-30 mt-2 w-56 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] p-2 shadow-[var(--shadow-md)]"
        >
          <nav className="flex flex-col gap-0.5">
            <Link href="/dashboard" onClick={() => setOpen(false)} className={linkClass}>
              Browse
            </Link>
            <Link href="/map" onClick={() => setOpen(false)} className={linkClass}>
              Map
            </Link>
            <Link href="/submit" onClick={() => setOpen(false)} className={linkClass}>
              Submit
            </Link>

            {session?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-500/10 dark:text-purple-400"
              >
                Admin
              </Link>
            )}

            <div className="my-1.5 border-t border-[var(--border)]" />

            {session ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className={linkClass}>
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] font-semibold text-white shadow-sm">
                      {session.initials}
                    </span>
                    {session.name.split(" ")[0]}
                  </span>
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className={linkClass}>
                  Log in
                </Link>
                <Link
                  href="/login?mode=signup"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-[var(--foreground)] px-3 py-2.5 text-center text-sm font-medium text-[var(--background)] shadow-sm transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
