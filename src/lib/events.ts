import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TechEvent } from "@/types/event";
import { filterEvents, sortByStart, type EventFilter } from "@/lib/event-utils";

export { filterEvents, sortByStart, formatEventDateRange, getRelativeTimeLabel } from "@/lib/event-utils";
export type { EventFilter } from "@/lib/event-utils";

type EventRow = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  city: string | null;
  country: string;
  is_virtual: boolean;
  register_url: string;
  organizer: string;
  source: string;
  source_id: string;
  topics: string[];
  cover_image: string | null;
  price: number | null;
  is_free: boolean;
  deadline: string | null;
  tags: string[] | null;
  difficulty: string | null;
  why_attend: string | null;
  perks: string[] | null;
  interested_count: number | null;
  vibe_tags: string[] | null;
  audience: string[] | null;
  is_beginner_friendly: boolean | null;
  comfort_note: string | null;
  is_featured: boolean | null;
  lat: number | null;
  lng: number | null;
  venue: string | null;
};

function rowToEvent(row: EventRow): TechEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    city: row.city,
    country: row.country,
    isVirtual: row.is_virtual,
    registerUrl: row.register_url,
    organizer: row.organizer,
    source: row.source as TechEvent["source"],
    sourceId: row.source_id,
    topics: row.topics ?? [],
    coverImage: row.cover_image ?? undefined,
    price: row.price,
    isFree: row.is_free,
    deadline: row.deadline ?? undefined,
    tags: row.tags ?? undefined,
    difficulty: (row.difficulty as TechEvent["difficulty"]) ?? undefined,
    whyAttend: row.why_attend ?? undefined,
    perks: row.perks ?? undefined,
    interestedCount: row.interested_count ?? undefined,
    vibeTags: (row.vibe_tags as TechEvent["vibeTags"]) ?? undefined,
    audience: (row.audience as TechEvent["audience"]) ?? undefined,
    isBeginnerFriendly: row.is_beginner_friendly ?? undefined,
    comfortNote: row.comfort_note ?? undefined,
    isFeatured: row.is_featured ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    venue: row.venue ?? undefined,
  };
}

export async function getAllEvents(): Promise<TechEvent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("getAllEvents:", error);
    return [];
  }
  return (data ?? []).map((r) => rowToEvent(r as EventRow));
}

export async function getEventById(id: string): Promise<TechEvent | undefined> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getEventById:", error);
    return undefined;
  }
  return data ? rowToEvent(data as EventRow) : undefined;
}

export async function getUpcomingEvents(filter: EventFilter = {}): Promise<TechEvent[]> {
  const now = new Date();
  const all = await getAllEvents();
  const futureOrOngoing = all.filter((e) => new Date(e.endsAt) >= now);
  return sortByStart(filterEvents(futureOrOngoing, filter));
}
