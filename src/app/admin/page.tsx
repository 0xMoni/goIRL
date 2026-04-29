import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
} from "./actions";

export const metadata = {
  title: "Moderation · goIRL",
};

type Tab = "pending" | "approved" | "rejected";

type SearchParams = { tab?: Tab };

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
  status: "pending" | "approved" | "rejected";
  moderator_note: string | null;
  submitter_email: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (!session.isAdmin) redirect("/");

  const sp = await searchParams;
  const tab: Tab = sp.tab ?? "pending";

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pending_events")
    .select("*")
    .eq("status", tab)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-4xl px-5 py-10">
        <p className="text-sm text-red-600">Failed to load submissions: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as PendingRow[];

  const counts = await Promise.all(
    (["pending", "approved", "rejected"] as const).map(async (s) => {
      const { count } = await admin
        .from("pending_events")
        .select("*", { count: "exact", head: true })
        .eq("status", s);
      return [s, count ?? 0] as const;
    }),
  );
  const countMap = Object.fromEntries(counts) as Record<Tab, number>;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:py-12">
      <header className="mb-6 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
          Moderation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          Event submissions
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Review what people submitted via{" "}
          <Link href="/submit" className="underline underline-offset-2">/submit</Link>. Approved events ship straight to the feed.
        </p>
      </header>

      <div className="mb-6 inline-flex rounded-full border border-[var(--border)] p-1 text-xs">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <Link
            key={t}
            href={`/admin?tab=${t}`}
            className={`rounded-full px-3 py-1 capitalize transition-colors ${
              tab === t
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t}{" "}
            <span className="ml-1 text-[10px] opacity-70">{countMap[t] ?? 0}</span>
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--muted)]">
          No {tab} submissions.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((r) => (
            <SubmissionCard key={r.id} row={r} tab={tab} />
          ))}
        </ul>
      )}
    </main>
  );
}

function SubmissionCard({ row, tab }: { row: PendingRow; tab: Tab }) {
  const start = new Date(row.starts_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {row.title}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {row.organizer} · {start} ·{" "}
            {row.is_virtual ? "Online" : row.city ?? "TBA"}
            {row.submitter_email && <> · submitted by {row.submitter_email}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {row.topics.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {row.why_attend && (
        <p className="mt-3 text-sm font-medium text-[var(--foreground)]/90">
          {row.why_attend}
        </p>
      )}

      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] line-clamp-4">
        {row.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
        <a
          href={row.register_url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-[var(--foreground)]"
        >
          Registration link ↗
        </a>
        {row.price != null && <span>₹{row.price}</span>}
        {row.difficulty && <span>Level: {row.difficulty}</span>}
        {row.deadline && (
          <span>
            Deadline: {new Date(row.deadline).toLocaleDateString("en-IN")}
          </span>
        )}
      </div>

      {row.moderator_note && (
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          Note: {row.moderator_note}
        </p>
      )}

      {tab === "pending" && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <form action={approveSubmissionAction} className="flex-1">
            <input type="hidden" name="id" value={row.id} />
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Approve & publish
            </button>
          </form>
          <form action={rejectSubmissionAction} className="flex flex-1 flex-col gap-2 sm:flex-row">
            <input type="hidden" name="id" value={row.id} />
            <input
              name="note"
              placeholder="Reason (optional)"
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none focus:border-[var(--border-strong)]"
            />
            <button
              type="submit"
              className="rounded-full border border-red-500/40 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              Reject
            </button>
          </form>
        </div>
      )}
    </li>
  );
}
