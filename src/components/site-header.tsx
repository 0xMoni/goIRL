import Link from "next/link";
import { getSession, getInitials } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="group flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span
            className="relative inline-flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm transition-transform group-hover:scale-105"
            aria-hidden
          >
            <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/30 to-transparent" />
          </span>
          <span>
            go<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">IRL</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/dashboard"
            className="rounded-full px-3 py-1.5 text-[var(--foreground)]/70 transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            Browse
          </Link>

          <Link
            href="/submit"
            className="hidden rounded-full px-3 py-1.5 text-[var(--foreground)]/70 transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)] sm:inline-flex"
          >
            Submit
          </Link>

          <ThemeToggle />

          {session ? (
            <>
              <Link
                href="/profile"
                className="ml-1 flex items-center gap-2 rounded-full border border-[var(--border-strong)] py-1 pl-1 pr-3 transition-colors hover:border-purple-500/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] font-semibold text-white shadow-sm">
                  {getInitials(session.name)}
                </span>
                <span className="hidden text-xs font-medium text-[var(--foreground)]/85 sm:inline">
                  {session.name.split(" ")[0]}
                </span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-[var(--foreground)]/70 transition-colors hover:bg-[var(--border)] hover:text-[var(--foreground)]"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-full bg-[var(--foreground)] px-3.5 py-1.5 text-[var(--background)] shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
