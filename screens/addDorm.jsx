import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";
import { MapView, MarkerView } from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddDorm() {
  const [marker, setMarker] = useState(null);

  const handleStart = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    setMarker(coords);

    // Save to local storage
    const existingDorms = JSON.parse(await AsyncStorage.getItem('dorms')) || [];
    existingDorms.push(coords);
    await AsyncStorage.setItem('dorms', JSON.stringify(existingDorms));
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}>
        {marker && (
          <MarkerView coordinate={marker}>
            <Text style={styles.markerText}>🏠</Text>
          </MarkerView>
        )}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 50,
    left: '35%',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  markerText: {
    fontSize: 24,
  },
});
