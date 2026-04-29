"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type PendingRow = {
  id: string;
  title: string;
  description: string;
  why_attend: string | null;
  starts_at: string;
  ends_at: string;
  deadline: string | null;
  city: string | null;
  is_virtual: boolean;
  register_url: string;
  organizer: string;
  topics: string[];
  difficulty: string | null;
  price: number | null;
  submitter_email: string | null;
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function assertAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) redirect("/");
  return session;
}

export async function approveSubmissionAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const admin = createSupabaseAdminClient();

  const { data: pending, error: fetchErr } = await admin
    .from("pending_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr || !pending) {
    console.error("approve: pending not found", fetchErr);
    return;
  }

  const row = pending as PendingRow;
  const startYear = new Date(row.starts_at).getFullYear();
  const eventId = `${slugify(row.title)}-${startYear}-${id.slice(0, 6)}`;

  const { error: insertErr } = await admin.from("events").insert({
    id: eventId,
    title: row.title,
    description: row.description,
    why_attend: row.why_attend,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    timezone: "Asia/Kolkata",
    city: row.city,
    country: "IN",
    is_virtual: row.is_virtual,
    register_url: row.register_url,
    organizer: row.organizer,
    source: "user-submission",
    source_id: id,
    topics: row.topics ?? [],
    is_free: row.price === null || row.price === 0,
    price: row.price,
    deadline: row.deadline,
    difficulty: row.difficulty,
    status: "published",
  });

  if (insertErr) {
    console.error("approve: insert failed", insertErr);
    return;
  }

  await admin
    .from("pending_events")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

export async function rejectSubmissionAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!id) return;

  const admin = createSupabaseAdminClient();
  await admin
    .from("pending_events")
    .update({
      status: "rejected",
      moderator_note: note || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin");
}
