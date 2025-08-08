import React from "react";
import { SafeAreaView, StyleSheet, StatusBar, Platform } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import MapTest from "./src/screens/MapTest";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Main navigation screen */}
      <HomeScreen />
      <MapTest />
      {/* StatusBar styling */}
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
        backgroundColor="#fff"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
