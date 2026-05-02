import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getEventById,
  getAllEvents,
  formatEventDateRange,
  getRelativeTimeLabel,
} from "@/lib/events";
import { EventCard } from "@/components/event-card";
import { VibeChip } from "@/components/vibe-chip";
import { AudienceLine } from "@/components/comfort-signal";
import { detectUrgency, urgencyLabel, formatPrice } from "@/lib/ranking";
import { getSession } from "@/lib/auth";
import { toggleRsvpAction } from "@/lib/auth-actions";
import { VenueMap } from "@/components/venue-map";

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

  const allEvents = await getAllEvents();
  const similarEvents = allEvents
    .filter((e) => e.id !== event.id && (e.city === event.city || e.topics.some((t) => event.topics.includes(t))))
    .filter((e) => new Date(e.endsAt) >= new Date())
    .slice(0, 3);
  const location = event.isVirtual ? "Online" : (event.city ?? "TBA");
  const relative = getRelativeTimeLabel(event);
  const urgency = detectUrgency(event);
  const urgText = urgencyLabel(urgency);

  const dateStr = new Date(event.startsAt).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: event.timezone,
  });
  const timeStr = new Date(event.startsAt).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: event.timezone,
  });

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-[var(--border)]">
        <div
          className="absolute inset-0 -z-10 opacity-80"
          aria-hidden
          style={{
            background: urgency === "happening-today"
              ? "radial-gradient(60% 60% at 30% 20%, rgba(239,68,68,0.12), transparent 60%), radial-gradient(50% 50% at 80% 40%, rgba(168,85,247,0.08), transparent 60%)"
              : "radial-gradient(60% 60% at 30% 20%, rgba(168,85,247,0.12), transparent 60%), radial-gradient(50% 50% at 80% 40%, rgba(236,72,153,0.08), transparent 60%)",
          }}
        />

        <div className="mx-auto w-full max-w-3xl px-5 pb-8 pt-6">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ← Back to events
          </Link>

          {/* Badges row */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {event.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Staff pick
              </span>
            )}
            {urgText && (
              <span suppressHydrationWarning className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                urgency === "happening-today"
                  ? "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                  : urgency === "closing-soon"
                    ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                    : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              }`}>
                {urgency === "happening-today" && "● "}{urgText}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
              event.isFree
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-black/[0.05] text-[var(--foreground)]/60 dark:bg-white/[0.08]"
            }`}>
              {formatPrice(event)}
            </span>
            <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-semibold text-[var(--foreground)]/60 dark:bg-white/[0.06]">
              {event.isVirtual ? "Virtual" : "In person"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl">
            {event.title}
          </h1>

          {/* Meta line */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dateStr} · {timeStr}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </span>
            <span className="font-medium">{event.organizer}</span>
            {event.interestedCount != null && event.interestedCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                <span className="font-semibold text-[var(--foreground)]/70">{event.interestedCount}</span> going
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        {/* Action buttons — prominent, at the top */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={event.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-6 py-3.5 text-sm font-semibold text-[var(--background)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Register on {event.organizer}
            <svg className="h-4 w-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <form action={toggleRsvpAction} className="flex flex-1">
            <input type="hidden" name="eventId" value={event.id} />
            <input type="hidden" name="redirectTo" value={`/events/${event.id}`} />
            <button
              type="submit"
              className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                isGoing
                  ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30 hover:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-[var(--foreground)]/[0.04] text-[var(--foreground)]/80 ring-1 ring-[var(--border)] hover:ring-[var(--border-strong)] dark:bg-white/[0.04]"
              }`}
            >
              {isGoing ? "✓ You're going" : session ? "I'm going" : "Sign in to save"}
            </button>
          </form>
        </div>

        {/* Why attend — hero callout */}
        {event.whyAttend && (
          <section className="mt-8 rounded-2xl bg-gradient-to-br from-purple-500/[0.07] via-fuchsia-500/[0.04] to-pink-500/[0.07] p-6 ring-1 ring-purple-500/10 dark:from-purple-500/[0.12] dark:via-fuchsia-500/[0.06] dark:to-pink-500/[0.12]">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              Why attend
            </p>
            <p className="mt-2 text-lg font-semibold leading-snug text-[var(--foreground)]">
              {event.whyAttend}
            </p>
          </section>
        )}

        {/* Two-column: left = details, right = sidebar info */}
        <div className="mt-8 grid grid-cols-1 gap-16 sm:grid-cols-3">
          {/* Main column */}
          <div className="flex flex-col gap-6 sm:col-span-2">
            {/* About */}
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                About this event
              </p>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-[var(--foreground)]/80">
                {event.description}
              </p>
            </section>

            {/* Vibe + audience */}
            {((event.vibeTags && event.vibeTags.length > 0) || (event.audience && event.audience.length > 0)) && (
              <section className="rounded-xl bg-[var(--foreground)]/[0.02] p-5 ring-1 ring-[var(--border)] dark:bg-white/[0.02]">
                {event.vibeTags && event.vibeTags.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
                      Vibe
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.vibeTags.map((v) => (
                        <VibeChip key={v} vibe={v} size="md" />
                      ))}
                    </div>
                  </div>
                )}
                {event.audience && event.audience.length > 0 && (
                  <div className={event.vibeTags && event.vibeTags.length > 0 ? "mt-4 border-t border-[var(--border)] pt-4" : ""}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
                      Who shows up
                    </p>
                    <AudienceLine audience={event.audience} />
                  </div>
                )}
              </section>
            )}

            {/* Comfort note */}
            {event.comfortNote && (
              <section className="flex items-start gap-3 rounded-xl bg-emerald-500/[0.06] p-4 ring-1 ring-emerald-500/10 dark:bg-emerald-500/[0.08]">
                <span className="mt-0.5 text-lg">💬</span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    Going alone?
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground)]/80">
                    {event.comfortNote}
                  </p>
                </div>
              </section>
            )}

            {/* Venue map */}
            {!event.isVirtual && event.lat && event.lng && (
              <section>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
                  Venue
                </p>
                {event.venue && (
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/80">
                    <svg className="h-4 w-4 shrink-0 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {event.venue}{event.city ? `, ${event.city}` : ""}
                  </p>
                )}
                <VenueMap lat={event.lat} lng={event.lng} venue={event.venue} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Quick info cards */}
            {[
              { label: "Price", value: formatPrice(event) },
              { label: "Date", value: formatEventDateRange(event) },
              { label: "Mode", value: event.isVirtual ? "Virtual" : "In person" },
              { label: "Level", value: event.difficulty ?? "All levels" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-[var(--foreground)]/[0.02] p-3.5 ring-1 ring-[var(--border)] dark:bg-white/[0.02]">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold capitalize text-[var(--foreground)]">
                  {item.value}
                </dd>
              </div>
            ))}
            {event.deadline && (
              <div className="rounded-xl bg-red-500/[0.06] p-3.5 ring-1 ring-red-500/15 dark:bg-red-500/[0.1]">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                  Registration deadline
                </dt>
                <dd className="mt-1 flex flex-col gap-0.5 text-sm font-bold text-red-600 dark:text-red-400">
                  <span>
                    {new Date(event.deadline).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-[12px] font-semibold opacity-80">
                    {new Date(event.deadline).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </dd>
              </div>
            )}

            {/* Perks */}
            {event.perks && event.perks.length > 0 && (
              <div className="rounded-xl bg-[var(--foreground)]/[0.02] p-3.5 ring-1 ring-[var(--border)] dark:bg-white/[0.02]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Perks
                </p>
                <ul className="flex flex-col gap-1.5">
                  {event.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Calendar card */}
            <div className="overflow-hidden rounded-xl ring-1 ring-[var(--border)]">
              <div className="bg-[var(--foreground)]/[0.02] p-4 dark:bg-white/[0.02]">
                <p suppressHydrationWarning className="text-[12px] font-bold text-purple-600 dark:text-purple-400">
                  {dateStr}, {timeStr}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[13px] text-[var(--muted)]">
                  <svg className="h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Save to your calendar
                </div>
                <a
                  href={`/events/${event.id}/ics`}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1567d3] hover:shadow-md"
                >
                  Add to Calendar
                </a>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${event.title} — ${formatEventDateRange(event)}\n${event.registerUrl}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[var(--muted)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--foreground)]/[0.03] hover:text-[var(--foreground)]"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.1.55 4.13 1.6 5.93L0 24l6.3-1.66a11.84 11.84 0 0 0 5.76 1.47h.01c6.55 0 11.88-5.33 11.88-11.89 0-3.17-1.24-6.15-3.43-8.44zM12.07 21.75h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.83 9.83 0 0 1-1.51-5.23c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.11 1.03 6.97 2.89a9.8 9.8 0 0 1 2.89 6.98c0 5.45-4.43 9.86-9.86 9.86zm5.41-7.38c-.3-.15-1.76-.87-2.03-.97s-.47-.15-.67.15-.77.97-.94 1.17-.35.22-.65.07c-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5s.05-.37-.02-.52c-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.01-1.04 2.47 1.07 2.87 1.22 3.07c.15.2 2.11 3.22 5.12 4.51.72.31 1.27.49 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${event.title}\n${event.registerUrl}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium text-[var(--muted)] ring-1 ring-[var(--border)] transition-colors hover:bg-[var(--foreground)]/[0.03] hover:text-[var(--foreground)]"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
            </div>

            {!session && (
              <p className="text-center text-xs text-[var(--muted)]">
                <Link href="/login" className="underline underline-offset-2">Sign in</Link> to save events.
              </p>
            )}
          </div>
        </div>

        {/* Similar events */}
        {similarEvents.length > 0 && (
          <div className="mt-12 border-t border-[var(--border)] pt-8">
            <h2 className="mb-5 text-xl font-bold tracking-tight text-[var(--foreground)]">
              Similar events
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {similarEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
