import polyline from "@mapbox/polyline";
import { OSRM_BASE, APP_UA } from "../config/constants";

/**
 * origin: { lat, lon }, dest: { lat, lon }
 * profile: "driving" | "walking" | "cycling"
 */
export async function getRoute(origin, dest, profile = "driving") {
  const coords = `${origin.lon},${origin.lat};${dest.lon},${dest.lat}`;
  const url = `${OSRM_BASE}/route/v1/${profile}/${coords}?overview=full&geometries=polyline&steps=false`;

  const res = await fetch(url, { headers: { "User-Agent": APP_UA } });
  if (!res.ok) throw new Error("OSRM request failed");

  const data = await res.json();
  const r = data?.routes?.[0];
  if (!r) return { coords: [], distance: 0, duration: 0 };

  const decoded = polyline.decode(r.geometry).map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return { coords: decoded, distance: r.distance, duration: r.duration };
}
