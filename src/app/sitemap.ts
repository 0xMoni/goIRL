import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BASE_URL = "https://goirl-tau.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/dashboard`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/map`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/submit`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const supabase = createSupabaseAdminClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, updated_at")
    .eq("status", "published");

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((event) => ({
    url: `${BASE_URL}/events/${event.id}`,
    lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...eventRoutes];
}
