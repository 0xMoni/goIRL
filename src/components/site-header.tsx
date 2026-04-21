import Link from "next/link";
import { getSession, getInitials } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[var(--background)]/80 backdrop-blur-md dark:border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" aria-hidden />
          <span>
            go<span className="text-purple-600 dark:text-purple-400">IRL</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/dashboard"
            className="rounded-full px-3 py-1.5 text-black/70 transition-colors hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Browse
          </Link>

          <ThemeToggle />

          {session ? (
            <>
              <Link
                href="/profile"
                className="ml-1 flex items-center gap-2 rounded-full border border-black/10 py-1 pl-1 pr-3 transition-colors hover:border-black/25 dark:border-white/15 dark:hover:border-white/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-[10px] font-semibold text-white">
                  {getInitials(session.name)}
                </span>
                <span className="hidden text-xs font-medium text-black/80 sm:inline dark:text-white/80">
                  {session.name.split(" ")[0]}
                </span>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-xs text-black/50 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-black/70 transition-colors hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-full bg-black px-3 py-1.5 text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
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
