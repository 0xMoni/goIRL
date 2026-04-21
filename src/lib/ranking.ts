import type { TechEvent } from "@/types/event";
import type { Session } from "@/lib/auth";

export type Urgency = "happening-today" | "this-weekend" | "closing-soon" | null;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function detectUrgency(event: TechEvent, now = new Date()): Urgency {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const deadline = event.deadline ? new Date(event.deadline) : null;

  if (now >= start && now <= end) return "happening-today";
  if (isSameDay(start, now)) return "happening-today";

  const daysToStart = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysToStart > 0 && daysToStart <= 7) {
    const dow = start.getDay();
    if (dow === 0 || dow === 6) return "this-weekend";
  }

  if (deadline) {
    const hoursToDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursToDeadline > 0 && hoursToDeadline < 72) return "closing-soon";
  }

  return null;
}

export function daysUntil(iso: string, now = new Date()): number {
  const d = new Date(iso);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function urgencyLabel(u: Urgency): string | null {
  switch (u) {
    case "happening-today":
      return "Happening today";
    case "this-weekend":
      return "This weekend";
    case "closing-soon":
      return "Closing soon";
    default:
      return null;
  }
}

// Simple, honest ranking. Featured events float up. After that, it's
// urgency + topic/city match, then date. No magical ML - just signals
// we can explain to users.
export function scoreEvent(event: TechEvent, session: Session | null, now = new Date()): number {
  let score = 0;

  // Featured events always lead
  if (event.isFeatured) score += 200;

  // Topic match - biggest personalization lever
  if (session?.followedTopics?.length) {
    const matches = event.topics.filter((t) => session.followedTopics.includes(t)).length;
    score += matches * 40;
  }

  // City match
  if (
    session?.preferredCities?.length &&
    event.city &&
    session.preferredCities.includes(event.city)
  ) {
    score += 30;
  }
  if (event.isVirtual) score += 5; // virtual is always geographically viable

  // Urgency boost - imminent events float up
  const u = detectUrgency(event, now);
  if (u === "happening-today") score += 40;
  else if (u === "closing-soon") score += 30;
  else if (u === "this-weekend") score += 15;

  // Tiny popularity tiebreaker
  score += Math.min(event.interestedCount ?? 0, 500) / 200;

  return score;
}

export function rankEvents(
  events: TechEvent[],
  session: Session | null,
  now = new Date(),
): TechEvent[] {
  return [...events].sort((a, b) => {
    const diff = scoreEvent(b, session, now) - scoreEvent(a, session, now);
    if (diff !== 0) return diff;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
}

export function filterByUrgency(
  events: TechEvent[],
  urgency: Urgency,
  now = new Date(),
): TechEvent[] {
  return events.filter((e) => detectUrgency(e, now) === urgency);
}

export function formatPrice(event: TechEvent): string {
  if (event.isFree || event.price === 0 || event.price === null || event.price === undefined) {
    return "Free";
  }
  return `₹${event.price.toLocaleString("en-IN")}`;
}

export function getFeaturedEvents(events: TechEvent[]): TechEvent[] {
  return events.filter((e) => e.isFeatured);
}
