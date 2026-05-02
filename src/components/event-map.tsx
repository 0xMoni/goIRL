"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useEffect, useMemo } from "react";
import maplibregl from "maplibre-gl";
import type { TechEvent } from "@/types/event";
import { coordsFor } from "@/data/city-coords";
import { formatEventDateRange } from "@/lib/event-utils";
import { formatPrice } from "@/lib/ranking";

export function EventMap({ events }: { events: TechEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const pins = useMemo(
    () =>
      events
        .filter((e) => !e.isVirtual && e.city)
        .map((e) => ({ event: e, coords: coordsFor(e) }))
        .filter(
          (p): p is { event: TechEvent; coords: { lat: number; lng: number } } =>
            p.coords !== null,
        ),
    [events],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [78.9629, 20.5937],
      zoom: 4.5,
      pitch: 0,
      bearing: 0,
      touchPitch: true,
      dragRotate: true,
    });

    map.on("load", () => {
      for (const { event, coords } of pins) {
        const isFeatured = !!event.isFeatured;
        const bg = isFeatured
          ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
          : "#1a1a1a";
        const shadow = isFeatured
          ? "0 4px 12px rgba(168,85,247,0.5)"
          : "0 2px 6px rgba(0,0,0,0.35)";

        const el = document.createElement("div");
        el.style.cssText = `
          width:28px;height:28px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${bg};
          box-shadow:${shadow};
          border:2px solid white;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;
        `;
        const inner = document.createElement("div");
        inner.style.cssText =
          "transform:rotate(45deg);width:8px;height:8px;background:white;border-radius:50%;";
        el.appendChild(inner);

        const popup = new maplibregl.Popup({ offset: 28, maxWidth: "280px" }).setHTML(`
          <div style="font-family:system-ui,sans-serif;min-width:200px;">
            ${
              isFeatured
                ? '<span style="display:inline-block;margin-bottom:4px;padding:2px 6px;border-radius:99px;background:linear-gradient(90deg,#a855f7,#ec4899);color:white;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Staff pick</span>'
                : ""
            }
            <a href="/events/${event.id}" style="display:block;margin-bottom:4px;font-size:13px;font-weight:600;line-height:1.3;color:#111;text-decoration:none;">
              ${event.title}
            </a>
            <div style="font-size:11px;color:rgba(0,0,0,0.6);">
              ${formatEventDateRange(event)}
            </div>
            <div style="margin-top:4px;font-size:11px;color:rgba(0,0,0,0.7);">
              <strong>${event.city}</strong> · ${formatPrice(event)}
            </div>
            <a href="/events/${event.id}" style="display:inline-block;margin-top:8px;padding:4px 10px;border-radius:99px;background:#111;color:white;font-size:10px;font-weight:500;text-decoration:none;">
              View details →
            </a>
          </div>
        `);

        new maplibregl.Marker({ element: el })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(popup)
          .addTo(map);
      }

      // User location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;

            // Accuracy circle
            const circle = createGeoJSONCircle([longitude, latitude], accuracy);
            map.addSource("user-accuracy", {
              type: "geojson",
              data: circle,
            });
            map.addLayer({
              id: "user-accuracy-fill",
              type: "fill",
              source: "user-accuracy",
              paint: {
                "fill-color": "#3b82f6",
                "fill-opacity": 0.08,
              },
            });
            map.addLayer({
              id: "user-accuracy-border",
              type: "line",
              source: "user-accuracy",
              paint: {
                "line-color": "#3b82f6",
                "line-width": 1,
                "line-opacity": 0.3,
              },
            });

            // Blue dot
            const dot = document.createElement("div");
            dot.style.cssText = `
              width:16px;height:16px;border-radius:50%;
              background:#3b82f6;
              border:3px solid white;
              box-shadow:0 0 0 2px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.3);
            `;

            new maplibregl.Marker({ element: dot })
              .setLngLat([longitude, latitude])
              .setPopup(
                new maplibregl.Popup({ offset: 12 }).setHTML(
                  '<span style="font-family:system-ui;font-size:13px;font-weight:500;">You are here</span>',
                ),
              )
              .addTo(map);

            map.flyTo({ center: [longitude, latitude], zoom: 11, duration: 1500 });
          },
          () => {},
          { enableHighAccuracy: false, timeout: 10000 },
        );
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [pins]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)]">
      <div ref={containerRef} className="h-full w-full" style={{ minHeight: 500 }} />
    </div>
  );
}

// Approximate circle as a 64-sided polygon for the accuracy ring
function createGeoJSONCircle(
  center: [number, number],
  radiusMeters: number,
): GeoJSON.FeatureCollection {
  const points = 64;
  const km = radiusMeters / 1000;
  const coords: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
    const dy = km / 110.574;
    coords.push([center[0] + dx * Math.cos(angle), center[1] + dy * Math.sin(angle)]);
  }
  coords.push(coords[0]);
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [coords] },
      },
    ],
  };
}
