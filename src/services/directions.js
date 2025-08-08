import { OSRM_BASE, APP_UA } from "../config/constants";

/**
 * origin: { lat, lon }, dest: { lat, lon }
 * profile: "driving" | "walking" | "cycling"
 */
export async function getRoute(origin, dest, profile = "driving") {
  const coords = `${origin.lon},${origin.lat};${dest.lon},${dest.lat}`;
  const url = `${OSRM_BASE}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=false`;

  const res = await fetch(url, { headers: { "User-Agent": APP_UA } });
  if (!res.ok) throw new Error("OSRM request failed");

  const data = await res.json();
  if (data?.code && data.code !== "Ok") {
    // OSRM returns 200 with code "NoRoute" etc.
    throw new Error(data.code === "NoRoute" ? "No route found" : data.code);
  }
  const r = data?.routes?.[0];
  if (!r || !r.geometry?.coordinates?.length) {
    throw new Error("No route found");
  }

  // GeoJSON coordinates are [lon, lat]
  const decoded = r.geometry.coordinates.map(([lon, lat]) => ({
    latitude: lat,
    longitude: lon,
  }));

  return { coords: decoded, distance: r.distance, duration: r.duration };
}
