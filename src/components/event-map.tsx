"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import type { TechEvent } from "@/types/event";
import { coordsFor } from "@/data/city-coords";
import { formatEventDateRange } from "@/lib/event-utils";
import { formatPrice } from "@/lib/ranking";

function makeIcon(featured: boolean) {
  const bg = featured
    ? "background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);"
    : "background: #1a1a1a;";
  const shadow = featured
    ? "box-shadow: 0 4px 12px rgba(168,85,247,0.5);"
    : "box-shadow: 0 2px 6px rgba(0,0,0,0.35);";
  const html = `
    <div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      ${bg}
      ${shadow}
      border:2px solid white;
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="transform:rotate(45deg);width:8px;height:8px;background:white;border-radius:50%;"></div>
    </div>
  `;
  return L.divIcon({
    html,
    className: "goirl-pin",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export function EventMap({ events }: { events: TechEvent[] }) {
  const pins = useMemo(
    () =>
      events
        .filter((e) => !e.isVirtual && e.city)
        .map((e) => ({ event: e, coords: coordsFor(e) }))
        .filter((p): p is { event: TechEvent; coords: { lat: number; lng: number } } => p.coords !== null),
    [events],
  );

  // Center map on India
  const center: [number, number] = [20.5937, 78.9629];

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        className="h-full w-full"
        style={{ minHeight: 500 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map(({ event, coords }) => (
          <Marker
            key={event.id}
            position={[coords.lat, coords.lng]}
            icon={makeIcon(!!event.isFeatured)}
          >
            <Popup>
              <div className="min-w-[220px] font-sans">
                {event.isFeatured && (
                  <span className="mb-1 inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                    Staff pick
                  </span>
                )}
                <Link
                  href={`/events/${event.id}`}
                  className="mb-1 block text-[13px] font-semibold leading-snug text-black hover:text-purple-700"
                >
                  {event.title}
                </Link>
                <p className="text-[11px] text-black/60">
                  {formatEventDateRange(event)}
                </p>
                <p className="mt-1 text-[11px] text-black/70">
                  <span className="font-medium">{event.city}</span>
                  {" · "}
                  {formatPrice(event)}
                </p>
                <Link
                  href={`/events/${event.id}`}
                  className="mt-2 inline-block rounded-full bg-black px-2.5 py-1 text-[10px] font-medium text-white hover:bg-black/85"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
