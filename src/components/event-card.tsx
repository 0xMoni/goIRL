import Link from "next/link";
import type { TechEvent } from "@/types/event";
import { getRelativeTimeLabel } from "@/lib/event-utils";
import { detectUrgency, urgencyLabel } from "@/lib/ranking";

export function EventCard({ event, hideUrgency }: { event: TechEvent; hideUrgency?: boolean }) {
  const location = event.isVirtual ? "Online" : (event.city ?? "TBA");
  const relative = getRelativeTimeLabel(event);
  const urgency = detectUrgency(event);
  const urgText = urgencyLabel(urgency);
  const isFeatured = !!event.isFeatured;

  const month = new Date(event.startsAt).toLocaleDateString("en-IN", {
    month: "short",
    timeZone: event.timezone ?? "Asia/Kolkata",
  }).toUpperCase();
  const day = new Date(event.startsAt).toLocaleDateString("en-IN", {
    day: "numeric",
    timeZone: event.timezone ?? "Asia/Kolkata",
  });
  const time = new Date(event.startsAt).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: event.timezone ?? "Asia/Kolkata",
  });

  // Date block: muted in dark mode, vivid in light
  // Rotating palette for normal cards so date blocks always have color
  const palette = [
    "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400",
    "bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400",
    "bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400",
    "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400",
    "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400",
    "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    "bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400",
    "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  ];
  let hash = 0;
  for (let i = 0; i < event.id.length; i++) hash = ((hash << 5) - hash + event.id.charCodeAt(i)) | 0;
  const defaultColor = palette[Math.abs(hash) % palette.length];

  const dateBlockClass =
    urgency === "happening-today"
      ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
      : urgency === "closing-soon"
        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
        : urgency === "this-weekend"
          ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          : isFeatured
            ? "bg-purple-100 dark:bg-gradient-to-b dark:from-purple-500/25 dark:via-fuchsia-500/20 dark:to-pink-500/25 text-purple-600 dark:text-purple-300"
            : defaultColor;

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group relative flex h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
        isFeatured
          ? "bg-[var(--surface-raised)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-purple-500/15 hover:shadow-[0_2px_8px_rgba(168,85,247,0.1)] hover:ring-purple-500/25"
          : "bg-[var(--surface-raised)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.06] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:ring-black/[0.1] dark:ring-white/[0.06] dark:hover:ring-white/[0.1]"
      }`}
    >
      {/* Date block */}
      <div className={`relative flex w-20 shrink-0 flex-col items-center justify-center ${dateBlockClass}`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent dark:from-white/5" aria-hidden />
        <span className="relative text-[10px] font-bold uppercase tracking-[0.15em] opacity-75">{month}</span>
        <span className="relative text-[28px] font-extrabold leading-none tracking-tight">{day}</span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Meta */}
        <div className="flex items-center gap-2">
          {urgText && !hideUrgency && (
            <span suppressHydrationWarning className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
              urgency === "happening-today" ? "text-red-500 dark:text-red-400"
                : urgency === "closing-soon" ? "text-amber-500 dark:text-amber-400"
                : "text-blue-500 dark:text-blue-400"
            }`}>
              {urgency === "happening-today" && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              )}
              {urgText}
            </span>
          )}
          {event.isFree ? (
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              Free
            </span>
          ) : event.price != null && event.price > 0 ? (
            <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-bold text-[var(--foreground)]/60 dark:bg-white/[0.08] dark:text-white/60">
              ₹{event.price.toLocaleString("en-IN")}
            </span>
          ) : null}
          {isFeatured && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Pick
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[var(--foreground)] transition-colors duration-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
          {event.title}
        </h3>

        {/* One-liner */}
        <p className="line-clamp-1 text-[12px] text-[var(--muted)]">
          {event.whyAttend ?? event.organizer}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <svg className="h-3 w-3 shrink-0 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="font-semibold text-[var(--foreground)]/60 dark:text-white/50">{location}</span>
            <span className="opacity-20">·</span>
            <span suppressHydrationWarning>{time}</span>
          </div>
          {event.interestedCount != null && event.interestedCount > 30 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              {event.interestedCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
