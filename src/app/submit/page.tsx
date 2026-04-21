import Link from "next/link";
import { TOPICS, CITIES } from "@/data/topics";
import { submitEventAction } from "@/lib/auth-actions";

type SearchParams = {
  success?: string;
  error?: string;
};

export const metadata = {
  title: "Submit an event · goIRL",
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  if (sp.success) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-md items-center px-5 py-10">
        <div className="w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-black dark:text-white">
            Thanks - we got it.
          </h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">
            We'll review your submission and add it to the feed within 24 hours. You'll
            get an email when it's live (when we wire up emails - soon).
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Back to events
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-black/70 dark:border-white/15 dark:text-white/70"
            >
              Submit another
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
          Know an event we're missing?
        </h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Drop the details below. We review submissions manually, so give us enough to
          decide - the better the info, the faster it goes live.
        </p>
      </header>

      {sp.error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {sp.error}
        </div>
      )}

      <form action={submitEventAction} className="space-y-5">
        <Field label="Event title" required>
          <input
            name="title"
            required
            placeholder="HackBLR 2026"
            className={inputClass}
          />
        </Field>

        <Field label="What is this event about?" required>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="36-hour student hackathon at IIIT-B with tracks on AI, dev tools, and climate tech. ₹5L in prizes…"
            className={inputClass}
          />
        </Field>

        <Field label="Why should people attend? (one line)">
          <input
            name="whyAttend"
            placeholder="Build something real in 36 hours and win ₹5L."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start date / time" required>
            <input
              type="datetime-local"
              name="startsAt"
              required
              className={inputClass}
            />
          </Field>
          <Field label="End date / time" required>
            <input
              type="datetime-local"
              name="endsAt"
              required
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Registration deadline">
          <input type="datetime-local" name="deadline" className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City">
            <select name="city" defaultValue="" className={inputClass}>
              <option value="">- Virtual / online -</option>
              {CITIES.filter((c) => c !== "Online").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price (₹)" hint="Leave empty if free">
            <input
              type="number"
              min="0"
              name="price"
              placeholder="0"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Registration URL" required>
          <input
            type="url"
            name="registerUrl"
            required
            placeholder="https://devfolio.co/..."
            className={inputClass}
          />
        </Field>

        <Field label="Who's organizing it?" required>
          <input
            name="organizer"
            required
            placeholder="Devfolio / Bengaluru AI Builders / ..."
            className={inputClass}
          />
        </Field>

        <fieldset>
          <legend className="mb-2 block text-xs font-medium text-black/70 dark:text-white/70">
            Topics (pick 1-3)
          </legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <label
                key={t.slug}
                className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/70 transition-colors has-[input:checked]:border-black has-[input:checked]:bg-black has-[input:checked]:text-white dark:border-white/15 dark:text-white/70 dark:has-[input:checked]:border-white dark:has-[input:checked]:bg-white dark:has-[input:checked]:text-black"
              >
                <input
                  type="checkbox"
                  name="topics"
                  value={t.slug}
                  className="sr-only"
                />
                <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} aria-hidden />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Difficulty">
          <select name="difficulty" defaultValue="" className={inputClass}>
            <option value="">- Any level -</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Field>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Submit for review
          </button>
          <Link
            href="/dashboard"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-black/15 px-6 py-3 text-sm font-medium text-black/70 hover:border-black/40 dark:border-white/20 dark:text-white/70 dark:hover:border-white/40"
          >
            Cancel
          </Link>
        </div>

        <p className="pt-2 text-center text-[11px] text-black/40 dark:text-white/40">
          Demo mode: submissions aren't stored yet. Once we wire up the DB, this form
          will land in a moderator queue.
        </p>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-black/40 dark:border-white/15 dark:bg-white/[0.02] dark:placeholder:text-white/30 dark:focus:border-white/50";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-black/70 dark:text-white/70">
        <span>
          {label}
          {required && <span className="ml-1 text-red-500/70">*</span>}
        </span>
        {hint && <span className="text-[10px] font-normal text-black/40 dark:text-white/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
