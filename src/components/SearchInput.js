import React, { useEffect, useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import useDebounce from "../hooks/useDebounce";
import { searchPlaces } from "../services/geocoding";

export default function SearchInput({
  placeholder = "Search place",
  value,
  onChangeText,
  onPickSuggestion,
}) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounced = useDebounce(value, 350);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!debounced || debounced.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        setLoading(true);
        const res = await searchPlaces(debounced);
        if (!cancelled) setSuggestions(res);
      } catch (e) {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [debounced]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {loading ? <ActivityIndicator style={{ position: "absolute", right: 10, top: 12 }} /> : null}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, idx) => `${item.latitude},${item.longitude}-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                onPickSuggestion(item);
                setSuggestions([]);
              }}
            >
              <Text numberOfLines={2} style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  input: {
    height: 44, borderRadius: 8, paddingHorizontal: 12,
    backgroundColor: "#f2f2f2",
  },
  list: {
    position: "absolute", top: 46, left: 0, right: 0,
    backgroundColor: "white", borderRadius: 8, maxHeight: 200, elevation: 4,
  },
  item: { padding: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#eee" },
  itemText: { color: "#333" },
});
