import { NOMINATIM_BASE, APP_UA } from "../config/constants";

/** Search places for autocomplete (returns up to 5) */
export async function searchPlaces(q) {
  if (!q || !q.trim()) return [];
  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { "User-Agent": APP_UA } });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return data.map(item => ({
    label: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

/** Resolve a single best match (used on submit) */
export async function geocodeOne(q) {
  const list = await searchPlaces(q);
  return list[0] || null;
}
