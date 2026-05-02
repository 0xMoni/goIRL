import Link from "next/link";
import { getAllEvents } from "@/lib/events";
import { getSession } from "@/lib/auth";
import { TOPICS } from "@/data/topics";

export default async function LandingPage() {
  const session = await getSession();
  const allEvents = await getAllEvents();
  const eventCount = allEvents.length;
  const featuredCount = allEvents.filter((e) => e.isFeatured).length;

  const primaryCta = session
    ? { href: "/dashboard", label: "Go to your feed" }
    : { href: "/login?mode=signup", label: "goIRL - it's free" };

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh */}
        <div
          className="absolute inset-0 -z-10 opacity-90"
          aria-hidden
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(50% 45% at 85% 30%, rgba(236,72,153,0.14), transparent 60%), radial-gradient(45% 40% at 60% 90%, rgba(59,130,246,0.10), transparent 65%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent"
          aria-hidden
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-7 px-5 pb-20 pt-16 sm:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)]/60 px-3 py-1 text-xs font-medium text-[var(--foreground)]/70 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {eventCount} events live · {featuredCount} staff picks
          </div>

          <h1 className="max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.03em] text-[var(--foreground)] sm:text-7xl">
            Put the phone down.
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              goIRL.
            </span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
            The tech events in India that are actually worth showing up to -
            hackathons, meetups, workshops where you'll learn something{" "}
            <em className="not-italic font-semibold text-[var(--foreground)]/90">
              and
            </em>{" "}
            meet your people. Even if you come alone.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] shadow-[0_6px_20px_-8px_rgba(22,21,20,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-8px_rgba(168,85,247,0.5)]"
            >
              {primaryCta.label}
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)]/60 px-6 py-3 text-sm font-medium text-[var(--foreground)]/85 backdrop-blur-sm transition-colors hover:border-purple-500/40 hover:text-[var(--foreground)]"
            >
              Browse events
            </Link>
          </div>

          <p className="text-xs text-[var(--muted)]">
            {eventCount} upcoming events · takes 20 seconds
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto w-full max-w-4xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
            The real problem
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl">
            Going alone sucks.
            <br />
            Event apps don't fix that.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Lu.ma tells you when. Devfolio tells you where. Nothing tells you if
            you'll be the only person there without a squad. goIRL does - so
            you know which events are friendly to first-timers, who shows up,
            and what the room actually feels like.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Three steps. Then you show up.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Sign up in 20 seconds",
                body: "Just your email. We send a magic link - click it and you're in. No passwords, no phone, no credit card.",
              },
              {
                n: "02",
                title: "Pick your topics",
                body: "AI, Web3, design, startup, product - whatever. Your feed fills with events built for you.",
              },
              {
                n: "03",
                title: "Show up - even solo",
                body: "Every event has a vibe tag and a comfort note: who'll be there, what the room feels like, whether first-timers fit in.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/15 font-mono text-xs font-semibold text-purple-700 dark:text-purple-300">
                  {step.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vibe showcase */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
            Events come with a vibe
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Know what the room feels like - before you RSVP.
          </h2>
          <div className="mt-10 flex flex-wrap gap-2">
            {[
              { label: "Chill", color: "bg-emerald-500" },
              { label: "Networking", color: "bg-indigo-500" },
              { label: "Hands-on", color: "bg-cyan-500" },
              { label: "Competitive", color: "bg-red-500" },
              { label: "Beginner-friendly", color: "bg-lime-500" },
              { label: "Talks", color: "bg-slate-500" },
              { label: "Small room", color: "bg-amber-500" },
              { label: "Mixer", color: "bg-pink-500" },
              { label: "High-energy", color: "bg-orange-500" },
              { label: "Workshop", color: "bg-violet-500" },
            ].map((v) => (
              <span
                key={v.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)]/85 shadow-[var(--shadow-sm)]"
              >
                <span className={`h-2 w-2 rounded-full ${v.color}`} aria-hidden />
                {v.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
            What you can follow
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {TOPICS.length} topics. More coming as we grow.
          </h2>
          <div className="mt-10 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <span
                key={t.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)]/85 shadow-[var(--shadow-sm)]"
              >
                <span className={`h-2 w-2 rounded-full ${t.color}`} aria-hidden />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-t border-[var(--border)] py-20">
        <div className="mx-auto w-full max-w-4xl px-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
            Pulled from
          </p>
          <p className="mt-5 text-xl font-medium tracking-tight text-[var(--foreground)] sm:text-2xl">
            Lu.ma · Devfolio · MLH · Unstop · Meetup · Hasgeek
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            One feed. No doom-scrolling five event sites.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-[var(--border)] py-24">
        <div
          className="absolute inset-0 -z-10 opacity-70"
          aria-hidden
          style={{
            background:
              "radial-gradient(40% 50% at 50% 50%, rgba(168,85,247,0.16), transparent 60%), radial-gradient(30% 40% at 80% 50%, rgba(236,72,153,0.12), transparent 65%)",
          }}
        />
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <h2 className="text-4xl font-semibold leading-[1] tracking-tight text-[var(--foreground)] sm:text-6xl">
            Less scrolling.
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              More showing up.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Twenty seconds to sign up. You'll thank yourself next Monday.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--background)] shadow-[0_6px_20px_-8px_rgba(22,21,20,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-8px_rgba(168,85,247,0.5)]"
            >
              {primaryCta.label}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-raised)]/60 px-6 py-3 text-sm font-medium text-[var(--foreground)]/85 backdrop-blur-sm transition-colors hover:border-purple-500/40 hover:text-[var(--foreground)]"
            >
              Browse without signing up
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
