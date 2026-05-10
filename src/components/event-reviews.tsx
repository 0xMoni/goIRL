import { createSupabaseServerClient } from "@/lib/supabase/server";

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  name: string | null;
};

export async function EventReviews({ eventId }: { eventId: string }) {
  const supabase = await createSupabaseServerClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, user_id, rating, comment, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  const reviewList = (reviews ?? []) as ReviewRow[];

  if (reviewList.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
        <p className="text-sm text-[var(--muted)]">No reviews yet. Be the first to share your experience.</p>
      </div>
    );
  }

  // Fetch profile names for reviewers
  const userIds = reviewList.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name")
    .in("id", userIds);

  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p.name ?? "Anonymous"]),
  );

  const avgRating =
    reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`h-5 w-5 ${star <= Math.round(avgRating) ? "text-amber-400" : "text-[var(--border)]"}`}
              viewBox="0 0 24 24"
              fill={star <= Math.round(avgRating) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {avgRating.toFixed(1)}
        </span>
        <span className="text-sm text-[var(--muted)]">
          ({reviewList.length} {reviewList.length === 1 ? "review" : "reviews"})
        </span>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviewList.map((review) => (
          <div
            key={review.id}
            className="rounded-xl bg-[var(--foreground)]/[0.02] p-4 ring-1 ring-[var(--border)] dark:bg-white/[0.02]"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {profileMap.get(review.user_id) ?? "Anonymous"}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-3.5 w-3.5 ${star <= review.rating ? "text-amber-400" : "text-[var(--border)]"}`}
                      viewBox="0 0 24 24"
                      fill={star <= review.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-xs text-[var(--muted)]">
                {new Date(review.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {review.comment && (
              <p className="text-sm leading-relaxed text-[var(--foreground)]/80">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
