"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, writeSession, clearSession, type Session } from "@/lib/auth";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawName = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email.includes("@") || email.length < 5) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email")}`);
  }

  const name = rawName || email.split("@")[0].replace(/[._-]/g, " ");
  const session: Session = {
    email,
    name,
    followedTopics: [],
    rsvps: [],
    createdAt: new Date().toISOString(),
    preferredCities: [],
  };
  await writeSession(session);
  redirect(next);
}

export async function signOutAction() {
  await clearSession();
  redirect("/");
}

export async function toggleTopicAction(formData: FormData) {
  const topic = String(formData.get("topic") ?? "");
  const current = await getSession();
  if (!current || !topic) return;
  const has = current.followedTopics.includes(topic);
  const next: Session = {
    ...current,
    followedTopics: has
      ? current.followedTopics.filter((t) => t !== topic)
      : [...current.followedTopics, topic],
  };
  await writeSession(next);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function toggleCityAction(formData: FormData) {
  const city = String(formData.get("city") ?? "");
  const current = await getSession();
  if (!current || !city) return;
  const preferred = current.preferredCities ?? [];
  const has = preferred.includes(city);
  const next: Session = {
    ...current,
    preferredCities: has
      ? preferred.filter((c) => c !== city)
      : [...preferred, city],
  };
  await writeSession(next);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function toggleRsvpAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");
  const current = await getSession();
  if (!current || !eventId) {
    if (redirectTo) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
    redirect("/login");
  }
  const has = current!.rsvps.includes(eventId);
  const next: Session = {
    ...current!,
    rsvps: has
      ? current!.rsvps.filter((id) => id !== eventId)
      : [...current!.rsvps, eventId],
  };
  await writeSession(next);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/profile");
}

export async function saveProfileAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const current = await getSession();
  if (!current) redirect("/login");
  if (!name) {
    revalidatePath("/profile");
    return;
  }
  const next: Session = { ...current!, name };
  await writeSession(next);
  revalidatePath("/profile");
}

export async function submitEventAction(formData: FormData) {
  // Mock: no persistence yet. Later: insert into a pending_submissions table.
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    redirect(`/submit?error=${encodeURIComponent("Title is required")}`);
  }
  redirect("/submit?success=1");
}
