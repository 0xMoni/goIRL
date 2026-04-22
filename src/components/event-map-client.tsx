"use client";

import dynamic from "next/dynamic";
import type { TechEvent } from "@/types/event";

const EventMap = dynamic(
  () => import("@/components/event-map").then((m) => m.EventMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]">
        <div className="flex flex-col items-center gap-2 text-sm text-[var(--muted)]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
          Loading map…
        </div>
      </div>
    ),
  },
);

export function EventMapClient({ events }: { events: TechEvent[] }) {
  return <EventMap events={events} />;
}
