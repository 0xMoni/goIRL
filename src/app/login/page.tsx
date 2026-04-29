import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";
import { getSession } from "@/lib/auth";

type SearchParams = {
  mode?: "signup" | "login";
  error?: string;
  next?: string;
  sent?: string;
  email?: string;
};

export const metadata = {
  title: "Sign in · goIRL",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  if (session) redirect(sp.next ?? "/dashboard");

  const isSignup = sp.mode === "signup";

  if (sp.sent) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md items-center px-5 py-10">
        <div className="w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-black dark:text-white">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            We sent a magic link to{" "}
            <span className="font-medium text-black dark:text-white">{sp.email}</span>.
            Click it to sign in — no password needed.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-xs font-medium text-black/60 underline-offset-4 hover:underline dark:text-white/60"
          >
            ← Use a different email
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md items-center px-5 py-10">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {isSignup
              ? "Takes 20 seconds. We'll email you a magic link to sign in."
              : "Enter your email — we'll send you a magic link."}
          </p>
        </div>

        {sp.error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {sp.error}
          </div>
        )}

        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="next" value={sp.next ?? "/dashboard"} />

          {isSignup && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium text-black/70 dark:text-white/70"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Priya Sharma"
                autoComplete="name"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-black/40 dark:border-white/15 dark:bg-white/[0.02] dark:placeholder:text-white/30 dark:focus:border-white/50"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-black/70 dark:text-white/70"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@college.edu"
              autoComplete="email"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-black/40 dark:border-white/15 dark:bg-white/[0.02] dark:placeholder:text-white/30 dark:focus:border-white/50"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {isSignup ? "Send magic link" : "Send magic link"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-black/50 dark:text-white/50">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                href={`/login${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`}
                className="font-medium text-black hover:underline dark:text-white"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have one yet?{" "}
              <Link
                href={`/login?mode=signup${sp.next ? `&next=${encodeURIComponent(sp.next)}` : ""}`}
                className="font-medium text-black hover:underline dark:text-white"
              >
                Create an account
              </Link>
            </>
          )}
        </p>

        <p className="mt-8 rounded-xl border border-dashed border-black/10 p-3 text-center text-[11px] leading-relaxed text-black/40 dark:border-white/15 dark:text-white/40">
          Passwordless sign-in via magic link. Google OAuth + calendar access
          coming with Phase 5.
        </p>
      </div>
    </main>
  );
}
