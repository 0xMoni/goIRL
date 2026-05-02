import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Session = {
  userId: string;
  email: string;
  name: string;
  followedTopics: string[];
  rsvps: string[];
  preferredCities: string[];
  createdAt: string;
  isAdmin: boolean;
};

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export async function getSession(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, topicsRes, citiesRes, rsvpsRes] = await Promise.all([
    supabase.from("profiles").select("name, email, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("followed_topics").select("topic").eq("user_id", user.id),
    supabase.from("preferred_cities").select("city").eq("user_id", user.id),
    supabase.from("rsvps").select("event_id").eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const name =
    profile?.name && profile.name.length > 0
      ? profile.name
      : (user.email ?? "").split("@")[0].replace(/[._-]/g, " ");

  const email = profile?.email ?? user.email ?? "";
  return {
    userId: user.id,
    email,
    name,
    followedTopics: (topicsRes.data ?? []).map((r) => r.topic),
    rsvps: (rsvpsRes.data ?? []).map((r) => r.event_id),
    preferredCities: (citiesRes.data ?? []).map((r) => r.city),
    createdAt: profile?.created_at ?? user.created_at ?? new Date().toISOString(),
    isAdmin: isEmailAdmin(email),
  };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
