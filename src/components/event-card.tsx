import Link from "next/link";
import type { TechEvent } from "@/types/event";
import { formatEventDateRange, getRelativeTimeLabel } from "@/lib/events";
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

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group relative flex flex-col rounded-2xl border p-5 transition-all hover:shadow-sm ${
        event.isFeatured
          ? "border-purple-500/25 bg-gradient-to-br from-purple-500/[0.04] to-pink-500/[0.04] hover:border-purple-500/40 dark:border-purple-500/30 dark:from-purple-500/[0.06] dark:to-pink-500/[0.04] dark:hover:border-purple-500/50"
          : "border-black/5 bg-white hover:border-black/15 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
      }`}
    >
      {event.isFeatured && (
        <span className="absolute -top-2 right-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Staff pick
        </span>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {urgency && <UrgencyBadge urgency={urgency} />}
        <PriceBadge event={event} />
        {event.isBeginnerFriendly && !event.vibeTags?.includes("beginner-friendly") && (
          <span className="rounded-full bg-lime-500/10 px-2 py-0.5 text-[10px] font-medium text-lime-700 dark:bg-lime-500/15 dark:text-lime-300">
            Beginner-friendly
          </span>
        )}
        <span className="ml-auto text-xs font-medium text-black/60 dark:text-white/60">
          {location}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-black dark:text-white">
        {event.title}
      </h3>

      {event.whyAttend ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/70 dark:text-white/70">
          {event.whyAttend}
        </p>
      ) : (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60 dark:text-white/60">
          {event.description}
        </p>
      )}

      {/* Vibe chips */}
      {event.vibeTags && event.vibeTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {event.vibeTags.slice(0, 3).map((v) => (
            <VibeChip key={v} vibe={v} />
          ))}
        </div>
      )}

      {/* Topics */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {event.topics.slice(0, 2).map((t) => (
          <TopicChip key={t} slug={t} />
        ))}
      </div>

      {/* Comfort signal */}
      <ComfortSignal note={event.comfortNote} compact />

      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs dark:border-white/10">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-black/70 dark:text-white/70">
            {formatEventDateRange(event)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-black/50 dark:text-white/50">{relative}</span>
            {event.deadline && (
              <>
                <span className="text-black/30 dark:text-white/30">·</span>
                <DeadlineCountdown deadline={event.deadline} />
              </>
            )}
          </div>
        </div>
        {event.interestedCount !== undefined && event.interestedCount > 30 && (
          <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-black/5 px-2 py-1 text-[11px] font-medium text-black/70 dark:bg-white/5 dark:text-white/70">
            <span className="font-semibold text-black dark:text-white">
              {event.interestedCount}
            </span>
            going
          </span>
        )}
      </div>
    </Link>
  );
}
