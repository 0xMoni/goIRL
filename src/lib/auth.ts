import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ite_session";

export type Session = {
  email: string;
  name: string;
  followedTopics: string[];
  rsvps: string[];
  createdAt: string;
  preferredCities?: string[];
};

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.email || !parsed.name) return null;
    return {
      ...parsed,
      followedTopics: parsed.followedTopics ?? [],
      rsvps: parsed.rsvps ?? [],
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      preferredCities: parsed.preferredCities ?? [],
    };
  } catch {
    return null;
  }
}

export async function writeSession(session: Session): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
