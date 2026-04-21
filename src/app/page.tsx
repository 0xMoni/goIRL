import Link from "next/link";
import { getAllEvents } from "@/lib/events";
import { getSession } from "@/lib/auth";
import { TOPICS } from "@/data/topics";

export default async function LandingPage() {
  const session = await getSession();
  const eventCount = getAllEvents().length;

  const primaryCta = session
    ? { href: "/dashboard", label: "Go to your feed" }
    : { href: "/login?mode=signup", label: "Go IRL — it's free" };

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(236,72,153,0.15),transparent_50%)]" />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 pb-16 pt-16 sm:pt-24">
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-black sm:text-6xl dark:text-white">
            Put the phone down.
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Go IRL.
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg dark:text-white/60">
            The tech events in India that are actually worth showing up to —
            hackathons, meetups, workshops where you'll learn something{" "}
            <em className="not-italic font-medium text-black/80 dark:text-white/80">
              and
            </em>{" "}
            meet your people. Even if you come alone.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {primaryCta.label}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-black/80 transition-colors hover:border-black/40 hover:bg-black/5 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 dark:hover:bg-white/10"
            >
              Browse events
            </Link>
          </div>
          <p className="text-xs text-black/50 dark:text-white/50">
            {eventCount} upcoming events · takes 20 seconds
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-black/5 py-16 dark:border-white/10">
        <div className="mx-auto w-full max-w-4xl px-5">
          <p className="text-sm font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
            The real problem
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Going alone sucks. <br />
            Event apps don't fix that.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg dark:text-white/60">
            Lu.ma tells you when. Devfolio tells you where. Nothing tells you if
            you'll be the only person there without a squad. goIRL does — so you
            know which events are friendly to first-timers, who shows up, and
            what the room actually feels like.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-black/5 py-16 dark:border-white/10">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-sm font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Three steps. Then you show up.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Sign up in 20 seconds",
                body: "Email only. No phone, no KYC, no credit card. Google sign-in coming when we grow.",
              },
              {
                n: "02",
                title: "Pick your topics",
                body: "AI, Web3, design, startup, product — whatever. Your feed fills with events built for you.",
              },
              {
                n: "03",
                title: "Show up — even solo",
                body: "Every event has a vibe tag and a comfort note: who'll be there, what the room feels like, whether first-timers fit in.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-white/[0.02]"
              >
                <p className="font-mono text-xs text-black/40 dark:text-white/40">
                  {step.n}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-black dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/60">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vibe showcase */}
      <section className="border-t border-black/5 py-16 dark:border-white/10">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-sm font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
            Events come with a vibe
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            Know what the room feels like — before you RSVP.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black/80 dark:border-white/15 dark:bg-white/[0.02] dark:text-white/80"
              >
                <span className={`h-2 w-2 rounded-full ${v.color}`} aria-hidden />
                {v.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="border-t border-black/5 py-16 dark:border-white/10">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-sm font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
            What you can follow
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
            13 topics. More coming as we grow.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <span
                key={t.slug}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black/80 dark:border-white/15 dark:bg-white/[0.02] dark:text-white/80"
              >
                <span className={`h-2 w-2 rounded-full ${t.color}`} aria-hidden />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-t border-black/5 py-16 dark:border-white/10">
        <div className="mx-auto w-full max-w-4xl px-5 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-black/40 dark:text-white/40">
            Pulled from
          </p>
          <p className="mt-4 text-xl font-medium tracking-tight text-black sm:text-2xl dark:text-white">
            Lu.ma · Devfolio · MLH · Unstop · Meetup · Hasgeek
          </p>
          <p className="mt-3 text-sm text-black/50 dark:text-white/50">
            One feed. No doom-scrolling five event sites.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-black/5 py-20 dark:border-white/10">
        <div className="mx-auto w-full max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-5xl dark:text-white">
            Less scrolling.
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              More showing up.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-black/60 sm:text-lg dark:text-white/60">
            Twenty seconds to sign up. You'll thank yourself next Monday.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {primaryCta.label}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-black/80 transition-colors hover:border-black/40 hover:bg-black/5 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 dark:hover:bg-white/10"
            >
              Browse without signing up
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
