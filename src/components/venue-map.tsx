"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

export function VenueMap({ lat, lng, venue }: { lat: number; lng: number; venue?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: ref.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [lng, lat],
      zoom: 15,
      interactive: false,
    });

    const el = document.createElement("div");
    el.style.cssText = `
      width:24px;height:24px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:linear-gradient(135deg, #a855f7, #ec4899);
      box-shadow:0 3px 8px rgba(168,85,247,0.4);
      border:2.5px solid white;
      display:flex;align-items:center;justify-content:center;
    `;
    const inner = document.createElement("div");
    inner.style.cssText = "transform:rotate(45deg);width:6px;height:6px;background:white;border-radius:50%;";
    el.appendChild(inner);

    new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [lat, lng]);

  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group/map block overflow-hidden rounded-xl border border-black/5 dark:border-white/10"
    >
      <div ref={ref} className="h-48 w-full" />
      <div className="flex items-center justify-between bg-black/[0.02] px-4 py-2.5 dark:bg-white/[0.03]">
        <span className="text-xs font-medium text-black/70 dark:text-white/70">
          Get directions
        </span>
        <svg className="h-3.5 w-3.5 text-black/40 transition-transform group-hover/map:translate-x-0.5 dark:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </a>
  );
}
