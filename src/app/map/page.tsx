import Link from "next/link";
import { getUpcomingEvents } from "@/lib/events";
import { CITY_COORDS } from "@/data/city-coords";
import { EventMapClient } from "@/components/event-map-client";

export const metadata = {
  title: "Map · goIRL",
  description: "See in-person tech events across India on a map.",
};

export default async function MapPage() {
  const events = await getUpcomingEvents({});
  const inPerson = events.filter((e) => !e.isVirtual && e.city);
  const byCity = Object.keys(CITY_COORDS).map((city) => ({
    city,
    count: inPerson.filter((e) => e.city === city).length,
  }));

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:py-12">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Events on the map
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            In-person only. {inPerson.length} upcoming events across India.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--foreground)]/80 hover:border-purple-500/40"
        >
          Back to list view
        </Link>
      </header>

      <section className="mb-4 flex flex-wrap gap-2">
        {byCity.map(({ city, count }) => (
          <span
            key={city}
            className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs font-medium ${
              count > 0
                ? "text-[var(--foreground)]/85"
                : "text-[var(--muted)]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                count > 0 ? "bg-purple-500" : "bg-[var(--muted)]"
              }`}
              aria-hidden
            />
            {city}
            <span className="ml-0.5 tabular-nums opacity-60">{count}</span>
          </span>
        ))}
      </section>

      <section className="h-[70vh] min-h-[500px]">
        <EventMapClient events={events} />
      </section>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Pins are approximate (city-level). Exact venues coming when we add
        geocoding in the next build phase. Map © OpenStreetMap contributors.
      </p>
    </main>
  );
}
