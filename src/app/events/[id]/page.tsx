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

        {/* Notification toggles (coming soon) */}
        <section className="mt-6 rounded-2xl border border-dashed border-black/10 p-4 dark:border-white/15">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
            Notify me (coming soon)
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              disabled
              className="flex flex-1 items-center justify-between rounded-xl border border-black/5 bg-black/[0.02] px-4 py-2.5 text-sm text-black/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40"
            >
              <span>Add to Google Calendar</span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium dark:bg-white/10">
                Soon
              </span>
            </button>
            <button
              type="button"
              disabled
              className="flex flex-1 items-center justify-between rounded-xl border border-black/5 bg-black/[0.02] px-4 py-2.5 text-sm text-black/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/40"
            >
              <span>Notify via WhatsApp</span>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium dark:bg-white/10">
                Soon
              </span>
            </button>
          </div>
        </section>

        {!session && (
          <p className="mt-4 text-xs text-black/50 dark:text-white/50">
            Sign in to save events and unlock notifications when calendar + WhatsApp launch.
          </p>
        )}
      </article>
    </div>
  );
}
