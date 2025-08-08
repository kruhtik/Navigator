import React, { useEffect, useRef, useState } from "react";
import { View, Button } from "react-native";
import Map from "../components/Map";
import { getRoute } from "../services/directions";

export default function MapTest() {
  const mapRef = useRef(null);
  const [origin] = useState({ latitude: 12.9716, longitude: 77.5946 });
  const [destination] = useState({ latitude: 12.2958, longitude: 76.6394 }); // BLR -> Mysuru
  const [routeCoords, setRouteCoords] = useState([]);

  async function fetchRoute() {
    const { coords } = await getRoute(
      { lat: origin.latitude, lon: origin.longitude },
      { lat: destination.latitude, lon: destination.longitude },
      "driving"
    );
    setRouteCoords(coords);
    setTimeout(() => mapRef.current?.fitToCoordinates(coords), 300);
  }

  useEffect(() => { fetchRoute(); }, []);

  return (
    <View style={{ flex: 1 }}>
      <Map ref={mapRef} origin={origin} destination={destination} routeCoords={routeCoords} />
      <Button title="Recenter" onPress={() => mapRef.current?.recenter()} />
    </View>
  );
}
