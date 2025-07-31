import React, { useState } from "react";
import { Text, TouchableOpacity, Alert, TextInput, StyleSheet, View, ActivityIndicator } from "react-native";
import { MapView, MarkerView, RasterSource, RasterLayer } from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";

export default function AddDorm() {
  const [marker, setMarker] = useState(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!phone || !name) {
      Alert.alert('Missing Info', 'Please enter your name and phone number.');
      return;
    }
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      if (!location?.coords) {
        setLoading(false);
        Alert.alert('Location Error', 'Could not get your current location.');
        return;
      }
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        phone: phone,
        name: name
      };
      // Send to backend
      try {
        const response = await fetch('https://dormlink.up.railway.app/api/add-dorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phone,
            name: name,
            latitude: coords.latitude,
            longitude: coords.longitude
          })
        });
        if (!response.ok) {
          setLoading(false);
          const error = await response.json();
          Alert.alert('Error', error.error || 'Failed to add dorm.');
          return;
        }
        const data = await response.json();
        setMarker(coords);
        setShowInput(false);
        setLoading(false);
        Alert.alert('Success', 'Dorm added successfully!');
      } catch (apiErr) {
        setLoading(false);
        Alert.alert('Network Error', 'Could not connect to server.');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}
        camera={marker ? {
          centerCoordinate: [marker.longitude, marker.latitude],
          zoom: 15,
        } : undefined}
      >
        {/* MapTiler raster tile source and layer */}
        <RasterSource
          id="maptiler"
          tileUrlTemplates={["https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=j9MPFHyHhzbXKIh6Q7Ov"]}
          tileSize={256}
        >
          <RasterLayer id="maptiler-layer" sourceID="maptiler" />
        </RasterSource>
        {marker && (
          <MarkerView coordinate={marker}>
            <TouchableOpacity onPress={() => setShowInfo((prev) => !prev)}>
              <Text style={styles.markerText}>🏠</Text>
            </TouchableOpacity>
            {showInfo && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoText}>{marker.phone}</Text>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoText}>{marker.name}</Text>
              </View>
            )}
          </MarkerView>
        )}
      </MapView>
      {showInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.promptText}>Click Start and enter your name and phone number</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.inputLabel}>Phone:</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleStart} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  markerText: {
    fontSize: 24,
  },
  inputContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginLeft: 8,
    flex: 1,
    minWidth: 120,
  },
  inputLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  promptText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
    alignItems: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
});
