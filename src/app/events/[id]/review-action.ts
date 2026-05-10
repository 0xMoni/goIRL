"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function submitReviewAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;

  const eventId = String(formData.get("eventId") ?? "");
  const rating = Number(formData.get("rating") ?? "0");
  const comment = String(formData.get("comment") ?? "").trim();

  if (!eventId || rating < 1 || rating > 5) return;

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("reviews").upsert(
    {
      user_id: session.userId,
      event_id: eventId,
      rating,
      comment: comment || null,
      attended: true,
    },
    { onConflict: "user_id,event_id" },
  );

  if (error) {
    console.error("submitReviewAction:", error);
    return;
  }

  revalidatePath(`/events/${eventId}`);
}
