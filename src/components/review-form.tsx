"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { submitReviewAction } from "@/app/events/[id]/review-action";

type Props = {
  eventId: string;
  session: { userId: string; name: string } | null;
  existingReview?: { rating: number; comment: string | null } | null;
};

export function ReviewForm({ eventId, session, existingReview }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!session) {
    return (
      <div className="mt-6 rounded-xl bg-[var(--surface-raised)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/login" className="font-medium text-[var(--foreground)] underline underline-offset-2">
            Sign in
          </Link>{" "}
          to leave a review.
        </p>
      </div>
    );
  }

  if (submitted && !existingReview) {
    return (
      <div className="mt-6 rounded-xl bg-emerald-500/[0.06] p-5 ring-1 ring-emerald-500/10">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Thanks for your review!
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="mt-6 rounded-xl bg-[var(--foreground)]/[0.02] p-5 ring-1 ring-[var(--border)] dark:bg-white/[0.02]"
      action={(formData) => {
        startTransition(async () => {
          await submitReviewAction(formData);
          setSubmitted(true);
        });
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="rating" value={rating} />

      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
        {existingReview ? "Update your review" : "Leave a review"}
      </p>

      {/* Star rating */}
      <div className="mb-4 flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hoveredStar || rating);
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
            >
              <svg
                className={`h-6 w-6 ${filled ? "text-amber-400" : "text-[var(--border)]"}`}
                viewBox="0 0 24 24"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          );
        })}
        {rating > 0 && (
          <span className="ml-2 text-xs text-[var(--muted)]">{rating}/5</span>
        )}
      </div>

      {/* Comment */}
      <textarea
        name="comment"
        rows={3}
        defaultValue={existingReview?.comment ?? ""}
        placeholder="How was the event? (optional)"
        className="mb-4 w-full resize-none rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-purple-500/50 focus:outline-none"
      />

      <button
        type="submit"
        disabled={rating === 0 || isPending}
        className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)] transition-opacity disabled:opacity-40"
      >
        {isPending ? "Submitting…" : existingReview ? "Update review" : "Submit review"}
      </button>
    </form>
  );
}
