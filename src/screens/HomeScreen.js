import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, ActivityIndicator, Alert } from "react-native";
import SearchInput from "../components/SearchInput";
import { geocodeOne } from "../services/geocoding";
import { formatKm, formatMins } from "../utils/format";
import { openExternalMaps } from "../utils/openExternalMaps";
import { OSM_ATTRIB } from "../config/constants";

// ⬇️ Member A should provide these:
import Map from "../components/Map";                // expects props: origin, destination, routeCoords, onMapReady?
import { getRoute } from "../services/directions";  // A's service (returns { coords, distance, duration })

export default function HomeScreen() {
  const mapRef = useRef(null);

  // Text values & chosen points
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);

  // Route + UI state
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI derived state
  const canFind = !loading && ((origin || fromText?.trim()) && (dest || toText?.trim()));
  const canOpen = !!(origin && dest);
  const canClear = !!(fromText || toText || origin || dest || (routeCoords && routeCoords.length));

  const handlePickFrom = (item) => {
    setOrigin({ latitude: item.latitude, longitude: item.longitude });
    setFromText(item.label);
  };
  const handlePickTo = (item) => {
    setDest({ latitude: item.latitude, longitude: item.longitude });
    setToText(item.label);
  };

  async function resolveIfNeeded() {
    const o = origin || (fromText ? await geocodeOne(fromText) : null);
    const d = dest   || (toText ? await geocodeOne(toText) : null);
    return {
      o: o ? { latitude: o.latitude, longitude: o.longitude } : null,
      d: d ? { latitude: d.latitude, longitude: d.longitude } : null,
    };
  }

  function onClear() {
    setFromText("");
    setToText("");
    setOrigin(null);
    setDest(null);
    setRouteCoords([]);
    setDistance(null);
    setDuration(null);
  }

  async function onFindRoute() {
    try {
      setLoading(true);
      Keyboard.dismiss();

      const { o, d } = await resolveIfNeeded();
      if (!o || !d) {
        Alert.alert("Missing place", "Please select valid From and To.");
        return;
      }
      setOrigin(o); setDest(d);

      // Delegate to Member A’s directions service
      const { coords, distance: dist, duration: dur } = await getRoute(
        { lat: o.latitude, lon: o.longitude },
        { lat: d.latitude, lon: d.longitude },
        "driving"
      );

      setRouteCoords(coords || []);
      setDistance(dist ?? null);
      setDuration(dur ?? null);

      // Fit the map (Member A's Map should handle fit on prop change, or expose a ref fn)
      // If Map exposes fitToCoordinates via ref, you can call it here.
      // Example (if implemented): mapRef.current?.fitToCoordinates(coords)
    } catch (e) {
      setRouteCoords([]);
      const msg = e?.message || "Unknown error";
      if (/no route/i.test(msg)) {
        Alert.alert("No route", "No route found between the selected points. Try different nearby points.");
      } else if (/network request failed/i.test(msg)) {
        Alert.alert("Network error", "Please check your internet connection and try again.");
      } else {
        Alert.alert("Route error", msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function onOpenInMaps() {
    if (!origin || !dest) {
      Alert.alert("Nothing to open", "Set From and To first.");
      return;
    }
    openExternalMaps(origin, dest);
  }

  return (
    <View style={{ flex: 1 }}>
      <Map
        ref={mapRef}
        origin={origin}
        destination={dest}
        routeCoords={routeCoords}
      />

      <View style={styles.card}>
        <SearchInput
          placeholder="From (type or pick)"
          value={fromText}
          onChangeText={setFromText}
          onPickSuggestion={handlePickFrom}
        />
        <View style={{ height: 8 }} />
        <SearchInput
          placeholder="To (address/place)"
          value={toText}
          onChangeText={setToText}
          onPickSuggestion={handlePickTo}
        />

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, { flex: 1 }, !canFind && styles.btnDisabled]}
            onPress={onFindRoute}
            disabled={!canFind}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Find Route</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGhost, { marginLeft: 8 }, !canOpen && styles.btnGhostDisabled]}
            onPress={onOpenInMaps}
            disabled={!canOpen}
          >
            <Text style={styles.btnGhostText}>Open in Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnGhost, { marginLeft: 8 }, !canClear && styles.btnGhostDisabled]}
            onPress={onClear}
            disabled={!canClear}
          >
            <Text style={styles.btnGhostText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {(distance || distance === 0) && (duration || duration === 0) ? (
          <Text style={styles.summary}>
            Distance: {formatKm(distance)} • ETA: {formatMins(duration)}
          </Text>
        ) : null}

        <Text style={styles.attrib}>{OSM_ATTRIB}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute", left: 12, right: 12, bottom: 12,
    backgroundColor: "white", padding: 12, borderRadius: 12, elevation: 6,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  btn: {
    backgroundColor: "black", borderRadius: 8, height: 44,
    alignItems: "center", justifyContent: "center",
  },
  btnDisabled: { backgroundColor: "#999" },
  btnText: { color: "white", fontWeight: "600" },
  btnGhost: {
    paddingHorizontal: 12, height: 44, alignItems: "center",
    justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: "#ccc",
  },
  btnGhostText: { color: "#333" },
  btnGhostDisabled: { opacity: 0.5 },
  summary: { marginTop: 8, fontWeight: "600" },
  attrib: { marginTop: 6, fontSize: 12, color: "#666" },
});
