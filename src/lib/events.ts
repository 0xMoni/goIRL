import rawEvents from "@/data/events.json";
import type { TechEvent } from "@/types/event";

export type EventFilter = {
  topic?: string;
  city?: string;
  mode?: "in-person" | "virtual" | "all";
  from?: Date;
  to?: Date;
  query?: string;
};

export function getAllEvents(): TechEvent[] {
  return rawEvents as TechEvent[];
}

export function getEventById(id: string): TechEvent | undefined {
  return getAllEvents().find((e) => e.id === id);
}

export function filterEvents(events: TechEvent[], filter: EventFilter): TechEvent[] {
  return events.filter((e) => {
    if (filter.topic && !e.topics.includes(filter.topic)) return false;
    if (filter.city && filter.city !== "all") {
      if (filter.city === "Online") {
        if (!e.isVirtual) return false;
      } else if (e.city !== filter.city) {
        return false;
      }
    }
    if (filter.mode === "in-person" && e.isVirtual) return false;
    if (filter.mode === "virtual" && !e.isVirtual) return false;
    if (filter.from && new Date(e.startsAt) < filter.from) return false;
    if (filter.to && new Date(e.startsAt) > filter.to) return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      const hit =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });
}

export function sortByStart(events: TechEvent[], direction: "asc" | "desc" = "asc"): TechEvent[] {
  return [...events].sort((a, b) => {
    const diff = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    return direction === "asc" ? diff : -diff;
  });
}

export function getUpcomingEvents(filter: EventFilter = {}): TechEvent[] {
  const now = new Date();
  const futureOrOngoing = getAllEvents().filter((e) => new Date(e.endsAt) >= now);
  return sortByStart(filterEvents(futureOrOngoing, filter));
}

export function formatEventDateRange(event: TechEvent, locale = "en-IN"): string {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: event.timezone,
  });
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: event.timezone,
  });

  if (sameDay) {
    return `${dateFmt.format(start)} · ${timeFmt.format(start)}-${timeFmt.format(end)}`;
  }
  return `${dateFmt.format(start)} - ${dateFmt.format(end)}`;
}

export function getRelativeTimeLabel(event: TechEvent): string {
  const now = new Date();
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  if (now >= start && now <= end) return "Happening now";
  const diffMs = start.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Starting soon";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
  return `In ${Math.round(diffDays / 30)} months`;
}
