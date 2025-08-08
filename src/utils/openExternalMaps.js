import { Linking, Platform } from "react-native";

export function openExternalMaps(origin, dest) {
  if (!origin || !dest) return;
  if (Platform.OS === "ios") {
    const url = `http://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${dest.latitude},${dest.longitude}`;
    Linking.openURL(url);
  } else {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${dest.latitude},${dest.longitude}&travelmode=driving`;
    Linking.openURL(url);
  }
}
