import { Suspense } from "react";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { EventFilters } from "@/components/event-filters";
import { ScrollStrip } from "@/components/scroll-strip";
import { getUpcomingEvents } from "@/lib/events";
import { getSession } from "@/lib/auth";
import { rankEvents, filterByUrgency } from "@/lib/ranking";

type Tab = "top-picks" | "my-topics" | "all";
type SearchParams = {
  topic?: string;
  city?: string;
  mode?: "in-person" | "virtual" | "all";
  q?: string;
  tab?: Tab;
};

export const metadata = {
  title: "Browse events · goIRL",
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getSession();

  const allUpcoming = await getUpcomingEvents({
    topic: sp.topic,
    city: sp.city,
    mode: sp.mode,
    query: sp.q,
  });

  const hasFollows = !!session && session.followedTopics.length > 0;
  const hasAnyPrefs =
    !!session &&
    (hasFollows || (session.preferredCities?.length ?? 0) > 0);

  const defaultTab: Tab = hasAnyPrefs ? "top-picks" : "all";
  const tab: Tab = sp.tab ?? defaultTab;

  const hasFiltersActive = !!sp.topic || !!sp.city || !!sp.q || !!sp.mode;

  // Sections that ignore filters - always pull from full upcoming pool
  const fullUpcoming = await getUpcomingEvents({});
  const happeningToday = filterByUrgency(fullUpcoming, "happening-today").slice(0, 6);
  const closingSoon = filterByUrgency(fullUpcoming, "closing-soon").slice(0, 6);
  const thisWeekend = filterByUrgency(fullUpcoming, "this-weekend").slice(0, 6);

  let tabEvents = allUpcoming;
  if (tab === "top-picks" && !hasFiltersActive) {
    tabEvents = rankEvents(allUpcoming, session).slice(0, 18);
  } else if (tab === "my-topics") {
    tabEvents = allUpcoming.filter((e) =>
      e.topics.some((t) => session?.followedTopics.includes(t)),
    );
  }

  const tabCounts = {
    "top-picks": session ? Math.min(allUpcoming.length, 18) : 0,
    "my-topics": hasFollows
      ? allUpcoming.filter((e) =>
          e.topics.some((t) => session!.followedTopics.includes(t)),
        ).length
      : 0,
    all: allUpcoming.length,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
          {session ? `Hey, ${session.name.split(" ")[0]}.` : "Upcoming events"}
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {tab === "top-picks" && hasAnyPrefs
            ? "Ranked for you - based on your topics, cities, and preferences."
            : tab === "my-topics" && hasFollows
              ? `Matching the ${session!.followedTopics.length} topics you follow.`
              : "Hackathons, meetups, workshops across India and online."}
        </p>
      </header>

      {/* Urgency strips */}
      {(happeningToday.length > 0 || closingSoon.length > 0 || thisWeekend.length > 0) && (
        <section className="mb-8 flex flex-col gap-6">
          {happeningToday.length > 0 && (
            <UrgencyStrip
              title="Happening today"
              subtitle="Show up - these are live now or starting tonight"
              events={happeningToday}
              accent="red"
            />
          )}
          {closingSoon.length > 0 && (
            <UrgencyStrip
              title="Closing soon"
              subtitle="Registration ends in under 3 days"
              events={closingSoon}
              accent="amber"
            />
          )}
          {thisWeekend.length > 0 && (
            <UrgencyStrip
              title="This weekend"
              subtitle="Happening Sat / Sun"
              events={thisWeekend}
              accent="blue"
            />
          )}
        </section>
      )}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-black/10 p-1 text-xs dark:border-white/15">
          {session && (
            <Link
              href={`/dashboard${buildQuery(sp, { tab: "top-picks" })}`}
              className={tabClass(tab === "top-picks")}
            >
              Top picks
            </Link>
          )}
          {hasFollows && (
            <Link
              href={`/dashboard${buildQuery(sp, { tab: "my-topics" })}`}
              className={tabClass(tab === "my-topics")}
            >
              My topics{" "}
              <span className="ml-1 text-[10px] opacity-70">{tabCounts["my-topics"]}</span>
            </Link>
          )}
          <Link
            href={`/dashboard${buildQuery(sp, { tab: "all" })}`}
            className={tabClass(tab === "all")}
          >
            All events{" "}
            <span className="ml-1 text-[10px] opacity-70">{tabCounts.all}</span>
          </Link>
        </div>
        {!session && (
          <Link
            href="/login?mode=signup&next=/dashboard"
            className="ml-auto text-xs font-medium text-black/60 underline-offset-4 hover:underline dark:text-white/60"
          >
            Sign up to personalize →
          </Link>
        )}
      </div>

      <section className="mb-8">
        <Suspense fallback={null}>
          <EventFilters />
        </Suspense>
      </section>

      <section className="mb-6 flex items-baseline justify-between">
        <p className="text-sm text-black/60 dark:text-white/60">
          Showing{" "}
          <span className="font-medium text-black dark:text-white">{tabEvents.length}</span>{" "}
          {tabEvents.length === 1 ? "event" : "events"}
        </p>
      </section>

      {tabEvents.length === 0 ? (
        <EmptyState tab={tab} hasFilters={hasFiltersActive} hasFollows={hasFollows} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tabEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildQuery(current: Record<string, string | undefined>, override: Record<string, string>) {
  const merged = { ...current, ...override };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && v !== "") qs.set(k, v as string);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function tabClass(active: boolean) {
  return `rounded-full px-3 py-1 transition-colors ${
    active
      ? "bg-black text-white dark:bg-white dark:text-black"
      : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
  }`;
}

function UrgencyStrip({
  title,
  subtitle,
  events,
  accent,
}: {
  title: string;
  subtitle: string;
  events: Awaited<ReturnType<typeof getUpcomingEvents>>;
  accent: "amber" | "blue" | "red";
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-700 dark:text-amber-400"
      : accent === "red"
        ? "text-red-700 dark:text-red-400"
        : "text-blue-700 dark:text-blue-400";

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${accentClass}`}>
            {title}
          </h2>
          <p className="text-xs text-black/50 dark:text-white/50">{subtitle}</p>
        </div>
      </div>
      <ScrollStrip>
        {events.map((e) => (
          <div key={e.id} className="w-72 shrink-0">
            <EventCard event={e} hideUrgency />
          </div>
        ))}
      </ScrollStrip>
    </div>
  );
}

function EmptyState({
  tab,
  hasFilters,
  hasFollows,
}: {
  tab: Tab;
  hasFilters: boolean;
  hasFollows: boolean;
}) {
  if (hasFilters) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 p-12 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        <p className="mb-2 text-base font-medium text-black dark:text-white">
          Nothing matched your filters.
        </p>
        <p>Try broader filters or clear them to see everything.</p>
      </div>
    );
  }
  if (tab === "my-topics" && !hasFollows) {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 p-12 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        <p className="mb-2 text-base font-medium text-black dark:text-white">
          You haven't picked any topics yet.
        </p>
        <p>
          <Link href="/profile" className="font-medium underline">
            Head to your profile
          </Link>{" "}
          and pick a few - takes 10 seconds.
        </p>
      </div>
    );
  }
  if (tab === "my-topics") {
    return (
      <div className="rounded-2xl border border-dashed border-black/15 p-12 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
        <p className="mb-2 text-base font-medium text-black dark:text-white">
          Nothing in your topics right now.
        </p>
        <p>
          <Link href="/dashboard?tab=all" className="font-medium underline">
            See all events
          </Link>{" "}
          or{" "}
          <Link href="/profile" className="font-medium underline">
            adjust your topics
          </Link>.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-black/15 p-12 text-center text-sm text-black/60 dark:border-white/15 dark:text-white/60">
      <p>No upcoming events right now. Check back soon.</p>
    </div>
  );
}
