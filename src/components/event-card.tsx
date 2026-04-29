import Link from "next/link";
import type { TechEvent } from "@/types/event";
import { formatEventDateRange, getRelativeTimeLabel } from "@/lib/event-utils";
import { TopicChip } from "@/components/topic-chip";
import { PriceBadge } from "@/components/price-badge";
import { UrgencyBadge, DeadlineCountdown } from "@/components/urgency-badge";
import { VibeChip } from "@/components/vibe-chip";
import { ComfortSignal } from "@/components/comfort-signal";
import { detectUrgency } from "@/lib/ranking";

export function EventCard({ event }: { event: TechEvent }) {
  const location = event.isVirtual ? "Online" : (event.city ?? "TBA");
  const relative = getRelativeTimeLabel(event);
  const urgency = detectUrgency(event);

  const baseCard =
    "group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5";

  const styleCard = event.isFeatured
    ? "border border-purple-500/20 bg-[var(--surface-raised)] shadow-[0_1px_2px_rgba(168,85,247,0.08),0_8px_24px_rgba(236,72,153,0.10)] hover:border-purple-500/40 hover:shadow-[0_2px_4px_rgba(168,85,247,0.12),0_12px_32px_rgba(236,72,153,0.18)]"
    : "border border-[var(--border)] bg-[var(--surface-raised)] shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]";

  return (
    <Link href={`/events/${event.id}`} className={`${baseCard} ${styleCard}`}>
      {event.isFeatured && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
          aria-hidden
        />
      )}

      {event.isFeatured && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
          Staff pick
        </span>
      )}

      <div className="flex flex-wrap items-center gap-1.5 pr-24">
        {urgency && <UrgencyBadge urgency={urgency} />}
        <PriceBadge event={event} />
        {event.isBeginnerFriendly && !event.vibeTags?.includes("beginner-friendly") && (
          <span className="rounded-full bg-lime-500/10 px-2 py-0.5 text-[10px] font-medium text-lime-700 dark:bg-lime-500/15 dark:text-lime-300">
            Beginner-friendly
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-tight tracking-tight text-[var(--foreground)] transition-colors group-hover:text-purple-700 dark:group-hover:text-purple-300">
        {event.title}
      </h3>

      {event.whyAttend ? (
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)]">
          {event.whyAttend}
        </p>
      ) : (
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)]">
          {event.description}
        </p>
      )}

      {event.vibeTags && event.vibeTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {event.vibeTags.slice(0, 3).map((v) => (
            <VibeChip key={v} vibe={v} />
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {event.topics.slice(0, 2).map((t) => (
          <TopicChip key={t} slug={t} />
        ))}
      </div>

      <ComfortSignal note={event.comfortNote} compact />

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--border)] pt-3 text-[11px]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium text-[var(--foreground)]/85">
            {formatEventDateRange(event)}
          </span>
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {relative}
            </span>
            {event.deadline && (
              <>
                <span className="opacity-40">·</span>
                <DeadlineCountdown deadline={event.deadline} />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="whitespace-nowrap text-[11px] font-medium text-[var(--muted)]">
            {location}
          </span>
          {event.interestedCount !== undefined && event.interestedCount > 30 && (
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-[var(--foreground)]/75 dark:bg-white/10">
              <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
              <span className="font-semibold text-[var(--foreground)]">
                {event.interestedCount}
              </span>
              going
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
