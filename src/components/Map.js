import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { View, StyleSheet } from "react-native";
import { getEdgePadding } from "../utils/mapBounds";

const DEFAULT_REGION = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const Map = forwardRef(function Map(
  { origin, destination, routeCoords = [] },
  ref
) {
  const mapRef = useRef(null);

  // Expose helpers to parent via ref
  useImperativeHandle(ref, () => ({
    fitToCoordinates: (coords = routeCoords) => {
      if (!mapRef.current || !coords?.length) return;
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: getEdgePadding(40),
        animated: true,
      });
    },
    recenter: () => {
      if (!mapRef.current) return;
      mapRef.current.animateToRegion(DEFAULT_REGION, 600);
    },
  }));

  // When we have both ends & polyline, we’ll auto-fit once on render.
  const shouldAutoFit = useMemo(
    () => origin && destination && routeCoords.length > 1,
    [origin, destination, routeCoords]
  );

  // Also auto-fit whenever the route updates (not only on first map ready)
  React.useEffect(() => {
    if (origin && destination && routeCoords.length > 1 && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: getEdgePadding(40),
        animated: true,
      });
    }
  }, [origin, destination, routeCoords]);

  // Auto-fit after first layout
  function onMapReady() {
    if (shouldAutoFit) {
      setTimeout(() => {
        if (mapRef.current && routeCoords.length > 1) {
          mapRef.current.fitToCoordinates(routeCoords, {
            edgePadding: getEdgePadding(40),
            animated: true,
          });
        }
      }, 0);
    }
  }

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        onMapReady={onMapReady}
      >
        {/* Free OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
          zIndex={-1}
        />

        {origin && <Marker coordinate={origin} title="Start" />}
        {destination && <Marker coordinate={destination} title="Destination" />}

        {routeCoords?.length ? (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#007AFF"
            zIndex={10}
          />
        ) : null}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  map: { flex: 1 },
});

export default Map;
