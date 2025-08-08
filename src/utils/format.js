export function formatKm(meters) {
    if (!meters && meters !== 0) return "";
    const km = meters / 1000;
    return km < 10 ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`;
  }
  
  export function formatMins(seconds) {
    if (!seconds && seconds !== 0) return "";
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  }
  