"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawName = String(formData.get("name") ?? "").trim();
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email.includes("@") || email.length < 5) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email")}`);
  }

  const supabase = await createSupabaseServerClient();
  const hdrs = await headers();
  const host = hdrs.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const emailRedirectTo = `${protocol}://${host}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
      data: rawName ? { name: rawName } : undefined,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function toggleTopicAction(formData: FormData) {
  const topic = String(formData.get("topic") ?? "");
  const session = await getSession();
  if (!session || !topic) return;

  const supabase = await createSupabaseServerClient();
  if (session.followedTopics.includes(topic)) {
    await supabase
      .from("followed_topics")
      .delete()
      .eq("user_id", session.userId)
      .eq("topic", topic);
  } else {
    await supabase
      .from("followed_topics")
      .insert({ user_id: session.userId, topic });
  }
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function toggleCityAction(formData: FormData) {
  const city = String(formData.get("city") ?? "");
  const session = await getSession();
  if (!session || !city) return;

  const supabase = await createSupabaseServerClient();
  if (session.preferredCities.includes(city)) {
    await supabase
      .from("preferred_cities")
      .delete()
      .eq("user_id", session.userId)
      .eq("city", city);
  } else {
    await supabase
      .from("preferred_cities")
      .insert({ user_id: session.userId, city });
  }
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function toggleRsvpAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");
  const session = await getSession();
  if (!session) {
    if (redirectTo) redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
    redirect("/login");
  }
  if (!eventId) return;

  const supabase = await createSupabaseServerClient();
  if (session.rsvps.includes(eventId)) {
    await supabase
      .from("rsvps")
      .delete()
      .eq("user_id", session.userId)
      .eq("event_id", eventId);
  } else {
    await supabase
      .from("rsvps")
      .insert({ user_id: session.userId, event_id: eventId });
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/profile");
}

export async function saveProfileAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const session = await getSession();
  if (!session) redirect("/login");
  if (!name) {
    revalidatePath("/profile");
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ name }).eq("id", session!.userId);
  revalidatePath("/profile");
}

export async function submitEventAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const whyAttend = String(formData.get("whyAttend") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const registerUrl = String(formData.get("registerUrl") ?? "").trim();
  const organizer = String(formData.get("organizer") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "").trim();
  const topics = formData.getAll("topics").map((t) => String(t));

  if (!title || !description || !startsAt || !endsAt || !registerUrl || !organizer) {
    redirect(`/submit?error=${encodeURIComponent("Please fill all required fields")}`);
  }

  const session = await getSession();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("pending_events").insert({
    submitter_id: session?.userId ?? null,
    submitter_email: session?.email ?? null,
    title,
    description,
    why_attend: whyAttend || null,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: new Date(endsAt).toISOString(),
    deadline: deadline ? new Date(deadline).toISOString() : null,
    city: city || null,
    is_virtual: !city,
    register_url: registerUrl,
    organizer,
    topics,
    difficulty: difficulty || null,
    price: priceRaw === "" ? null : Number(priceRaw),
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/submit?success=1");
}
