import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getInitials } from "@/lib/auth";
import {
  saveProfileAction,
  toggleTopicAction,
  toggleCityAction,
} from "@/lib/auth-actions";
import { TOPICS, CITIES } from "@/data/topics";
import { getAllEvents } from "@/lib/events";
import { EventCard } from "@/components/event-card";

export const metadata = {
  title: "Your profile · goIRL",
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/profile");

  const rsvpEvents = getAllEvents()
    .filter((e) => session.rsvps.includes(e.id))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const cityCount = session.preferredCities?.length ?? 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:py-12">
      {/* Profile card */}
      <section className="flex items-center gap-4 border-b border-black/5 pb-8 dark:border-white/10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-semibold text-white">
          {getInitials(session.name)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
            {session.name}
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">{session.email}</p>
        </div>
      </section>

      {/* Edit name */}
      <section className="border-b border-black/5 py-8 dark:border-white/10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
          Display name
        </h2>
        <form action={saveProfileAction} className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            defaultValue={session.name}
            className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-black/40 dark:border-white/15 dark:bg-white/[0.02] dark:focus:border-white/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Save
          </button>
        </form>
      </section>

      {/* Followed topics */}
      <section className="border-b border-black/5 py-8 dark:border-white/10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
              Topics you follow
            </h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              Events matching these show up on your dashboard.{" "}
              {session.followedTopics.length === 0 && "Pick a few to get started."}
            </p>
          </div>
          <span className="text-xs text-black/40 dark:text-white/40">
            {session.followedTopics.length} / {TOPICS.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const active = session.followedTopics.includes(t.slug);
            return (
              <form key={t.slug} action={toggleTopicAction}>
                <input type="hidden" name="topic" value={t.slug} />
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/10 text-black/70 hover:border-black/30 dark:border-white/15 dark:text-white/70 dark:hover:border-white/40"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${t.color}`} aria-hidden />
                  {t.label}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      {/* Preferred cities */}
      <section className="border-b border-black/5 py-8 dark:border-white/10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
              Cities you'd travel to
            </h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">
              We'll prioritize events in these cities.
            </p>
          </div>
          <span className="text-xs text-black/40 dark:text-white/40">
            {cityCount} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CITIES.filter((c) => c !== "Online").map((c) => {
            const active = session.preferredCities?.includes(c) ?? false;
            return (
              <form key={c} action={toggleCityAction}>
                <input type="hidden" name="city" value={c} />
                <button
                  type="submit"
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/10 text-black/70 hover:border-black/30 dark:border-white/15 dark:text-white/70 dark:hover:border-white/40"
                  }`}
                >
                  {c}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      {/* RSVPs */}
      <section className="py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-black/50 dark:text-white/50">
          Events you're going to
          <span className="ml-2 text-xs font-normal text-black/40 dark:text-white/40">
            {rsvpEvents.length} saved
          </span>
        </h2>

        {rsvpEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
            <p className="mb-2 text-base font-medium text-black dark:text-white">
              No saved events yet - start with one.
            </p>
            <p>
              <Link href="/dashboard" className="font-medium underline">
                Browse upcoming events
              </Link>{" "}
              and tap <span className="font-medium">I'm going</span> on anything that catches your eye.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rsvpEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
