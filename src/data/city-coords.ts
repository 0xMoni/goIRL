// Approximate center coordinates for Indian tech-event cities.
// Used as fallback venue coords for events without precise lat/lng.
// Real geocoding via Nominatim comes in Phase 2.

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
};

// Jitter coords slightly per-event so pins don't all stack on city center.
// Deterministic based on event id so the same event pins the same spot.
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function coordsFor(event: { id: string; city: string | null; lat?: number; lng?: number }) {
  if (event.lat !== undefined && event.lng !== undefined) {
    return { lat: event.lat, lng: event.lng };
  }
  if (!event.city) return null;
  const center = CITY_COORDS[event.city];
  if (!center) return null;

  // Jitter ~±0.025 deg (~2.5km) so markers don't stack
  const h = hashCode(event.id);
  const latJitter = ((h % 1000) / 1000 - 0.5) * 0.05;
  const lngJitter = (((h >> 10) % 1000) / 1000 - 0.5) * 0.05;
  return { lat: center.lat + latJitter, lng: center.lng + lngJitter };
}
