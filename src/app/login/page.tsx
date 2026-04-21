import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/lib/auth-actions";
import { getSession } from "@/lib/auth";

type SearchParams = {
  mode?: "signup" | "login";
  error?: string;
  next?: string;
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

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md items-center px-5 py-10">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            {isSignup
              ? "Takes 20 seconds. No phone, no credit card."
              : "Sign in to get events in your calendar and inbox."}
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
            {isSignup ? "Create account" : "Sign in"}
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
          Demo auth: any valid email signs you in. Real Google OAuth + calendar
          access coming in the next build phase.
        </p>
      </div>
    </main>
  );
}
