import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getEventById,
  formatEventDateRange,
  getRelativeTimeLabel,
} from "@/lib/events";
import { TopicChip } from "@/components/topic-chip";
import { PriceBadge } from "@/components/price-badge";
import { UrgencyBadge, DeadlineCountdown } from "@/components/urgency-badge";
import { VibeChip } from "@/components/vibe-chip";
import { ComfortSignal, AudienceLine } from "@/components/comfort-signal";
import { detectUrgency, formatPrice } from "@/lib/ranking";
import { getSession } from "@/lib/auth";
import { toggleRsvpAction } from "@/lib/auth-actions";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: "Event not found" };
  return {
    title: `${event.title} · goIRL`,
    description: (event.whyAttend ?? event.description).slice(0, 155),
  };
}

export default async function EventPage({ params }: { params: Params }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const session = await getSession();
  const isGoing = session?.rsvps.includes(event.id) ?? false;
  const location = event.isVirtual ? "Online / virtual" : (event.city ?? "Location TBA");
  const relative = getRelativeTimeLabel(event);
  const urgency = detectUrgency(event);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-12">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-black/60 transition-colors hover:text-black dark:text-white/60 dark:hover:text-white"
      >
        ← All events
      </Link>

      <article>
        {event.isFeatured && (
          <span className="mb-4 inline-flex rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Staff pick
          </span>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {urgency && <UrgencyBadge urgency={urgency} />}
          <PriceBadge event={event} size="md" />
          {event.isBeginnerFriendly && (
            <span className="rounded-full bg-lime-500/10 px-2.5 py-1 text-xs font-medium text-lime-700 dark:bg-lime-500/15 dark:text-lime-300">
              Beginner-friendly
            </span>
          )}
          <span className="text-xs text-black/50 dark:text-white/50">·</span>
          <span className="text-xs font-medium text-black/70 dark:text-white/70">{location}</span>
          <span className="text-xs text-black/50 dark:text-white/50">·</span>
          <span className="text-xs text-black/70 dark:text-white/70">{event.organizer}</span>
        </div>

        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-black sm:text-4xl dark:text-white">
          {event.title}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-black/70 dark:text-white/70">
          {formatEventDateRange(event)}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-black/60 dark:text-white/60">
          <span>{relative}</span>
          {event.deadline && (
            <>
              <span className="text-black/30 dark:text-white/30">·</span>
              <DeadlineCountdown deadline={event.deadline} />
            </>
          )}
          {event.interestedCount !== undefined && (
            <>
              <span className="text-black/30 dark:text-white/30">·</span>
              <span>
                <span className="font-medium text-black/80 dark:text-white/80">
                  {event.interestedCount}
                </span>{" "}
                going
              </span>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {event.topics.map((t) => (
            <TopicChip key={t} slug={t} size="md" />
          ))}
        </div>

        {/* Why attend */}
        {event.whyAttend && (
          <section className="mt-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-purple-700/80 dark:text-purple-400/80">
              Why attend
            </p>
            <p className="mt-2 text-lg leading-snug font-medium text-black dark:text-white">
              {event.whyAttend}
            </p>
          </section>
        )}

        {/* What it feels like - vibe */}
        {event.vibeTags && event.vibeTags.length > 0 && (
          <section className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
              What it feels like
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.vibeTags.map((v) => (
                <VibeChip key={v} vibe={v} size="md" />
              ))}
            </div>
          </section>
        )}

        {/* Who you'll meet */}
        {event.audience && event.audience.length > 0 && (
          <section className="mt-6 rounded-2xl border border-black/5 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.02]">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
              Who you'll meet
            </p>
            <div className="mt-2">
              <AudienceLine audience={event.audience} />
            </div>
          </section>
        )}

        {/* Come alone? Comfort note */}
        {event.comfortNote && (
          <section className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
              Going alone?
            </p>
            <ComfortSignal note={event.comfortNote} />
          </section>
        )}

        {/* Perks */}
        {event.perks && event.perks.length > 0 && (
          <section className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
              What you'll get
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {event.perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-2 rounded-xl border border-black/5 bg-black/[0.02] px-3 py-2 text-sm text-black/80 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/80"
                >
                  <span
                    className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500"
                    aria-hidden
                  />
                  {perk}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Full description */}
        <section className="mt-8 rounded-2xl border border-black/5 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
            About this event
          </p>
          <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-black/80 dark:text-white/80">
            {event.description}
          </p>
        </section>

        {/* Quick info */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
            <dt className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50">
              Price
            </dt>
            <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
              {formatPrice(event)}
            </dd>
          </div>
          <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
            <dt className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50">
              Deadline
            </dt>
            <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
              {event.deadline
                ? new Date(event.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "Open"}
            </dd>
          </div>
          <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
            <dt className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50">
              Mode
            </dt>
            <dd className="mt-1 text-sm font-semibold text-black dark:text-white">
              {event.isVirtual ? "Virtual" : "In person"}
            </dd>
          </div>
          <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
            <dt className="text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50">
              Level
            </dt>
            <dd className="mt-1 text-sm font-semibold capitalize text-black dark:text-white">
              {event.difficulty ?? "All"}
            </dd>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={event.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Register on {event.organizer}
          </a>

          <form action={toggleRsvpAction} className="flex flex-1">
            <input type="hidden" name="eventId" value={event.id} />
            <input type="hidden" name="redirectTo" value={`/events/${event.id}`} />
            <button
              type="submit"
              className={`w-full rounded-full px-6 py-3 text-sm font-medium transition-colors ${
                isGoing
                  ? "border border-green-600/30 bg-green-600/10 text-green-700 hover:bg-green-600/15 dark:text-green-400"
                  : "border border-black/15 text-black/80 hover:border-black/40 hover:bg-black/5 dark:border-white/20 dark:text-white/80 dark:hover:border-white/40 dark:hover:bg-white/10"
              }`}
            >
              {isGoing ? "You're going · tap to remove" : session ? "I'm going" : "Sign in to save"}
            </button>
          </form>
        </div>

        {/* Share + add to calendar */}
        <section className="mt-6 rounded-2xl border border-dashed border-black/10 p-4 dark:border-white/15">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
            Don&apos;t forget
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <a
              href={`/events/${event.id}/ics`}
              className="flex flex-1 items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black/85 transition-colors hover:border-black/30 hover:bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.02] dark:text-white/85 dark:hover:border-white/40 dark:hover:bg-white/[0.05]"
            >
              <span>Add to calendar</span>
              <svg className="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${event.title} — ${formatEventDateRange(event)}\n${event.registerUrl}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-black/85 transition-colors hover:border-black/30 hover:bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.02] dark:text-white/85 dark:hover:border-white/40 dark:hover:bg-white/[0.05]"
            >
              <span>Share on WhatsApp</span>
              <svg className="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.1.55 4.13 1.6 5.93L0 24l6.3-1.66a11.84 11.84 0 0 0 5.76 1.47h.01c6.55 0 11.88-5.33 11.88-11.89 0-3.17-1.24-6.15-3.43-8.44zM12.07 21.75h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.83 9.83 0 0 1-1.51-5.23c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.11 1.03 6.97 2.89a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.43 9.86-9.86 9.86zm5.41-7.38c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07c-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5s.05-.37-.02-.52c-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.01-1.04 2.47 1.07 2.87 1.22 3.07c.15.2 2.11 3.22 5.12 4.51.72.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35z" />
              </svg>
            </a>
          </div>
          <p className="mt-2 text-[11px] text-black/40 dark:text-white/40">
            Calendar file works with Google, Apple, Outlook. WhatsApp opens a share sheet.
          </p>
        </section>

        {!session && (
          <p className="mt-4 text-xs text-black/50 dark:text-white/50">
            Sign in to save events to your profile.
          </p>
        )}
      </article>
    </div>
  );
}
