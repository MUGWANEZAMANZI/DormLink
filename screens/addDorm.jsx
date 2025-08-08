import React, { useState } from "react";
import { Text, TouchableOpacity, Alert, TextInput, StyleSheet, View, ActivityIndicator } from "react-native";
import { MapView, MarkerView, RasterSource, RasterLayer } from "@maplibre/maplibre-react-native";
import * as Location from "expo-location";

export default function AddDorm() {
  const [marker, setMarker] = useState(null);
  // Coordinate validation helper (with range checks)
  const isValidCoord = (coord) =>
    coord &&
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 && coord.latitude <= 90 &&
    coord.longitude >= -180 && coord.longitude <= 180 &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude);
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("Room for rent");
  const [description, setDescription] = useState("Spacious and affordable dorm room available.");
  const [name, setName] = useState("");
  const [showInput, setShowInput] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!phone || !name || !title || !description) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
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
      // Coerce and validate coordinates
      const latitude = typeof location.coords.latitude === 'string' ? parseFloat(location.coords.latitude) : location.coords.latitude;
      const longitude = typeof location.coords.longitude === 'string' ? parseFloat(location.coords.longitude) : location.coords.longitude;
      const coords = {
        latitude,
        longitude,
        phone,
        name,
        title,
        description
      };
      console.log('Raw marker coords:', coords);
      if (!isValidCoord(coords)) {
        setLoading(false);
        Alert.alert('Error', 'Invalid coordinates. Please try again in a different location.');
        return;
      }
      // Send to backend
      try {
        const response = await fetch('https://dormlink.up.railway.app/api/add-dorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            name,
            latitude,
            longitude,
            title,
            description
          })
        });
        if (!response.ok) {
          setLoading(false);
          const error = await response.json();
          let msg = 'Failed to add dorm.';
          if (error.message && error.error) {
            msg = `${error.message}\n${error.error}`;
          } else if (error.message) {
            msg = error.message;
          } else if (error.error) {
            msg = error.error;
          }
          Alert.alert('Error', msg);
          return;
        }
        const data = await response.json();
        setMarker(coords);
        setShowInput(false);
        setLoading(false);
        console.log('Dorm added, marker set:', coords);
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
      {/* Camera fallback logic */}
      {(() => {
        let cameraSettings = {
          centerCoordinate: [30.1, -1.95], // default fallback
          zoom: 15,
        };
        if (isValidCoord(marker)) {
          cameraSettings.centerCoordinate = [marker.longitude, marker.latitude];
        }
        return (
          <MapView style={{ flex: 1 }} camera={cameraSettings}>
            {/* MapTiler raster tile source and layer */}
            <RasterSource
              id="maptiler"
              tileUrlTemplates={["https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=j9MPFHyHhzbXKIh6Q7Ov"]}
              tileSize={256}
            >
              <RasterLayer id="maptiler-layer" sourceID="maptiler" />
            </RasterSource>
            {/* Only render marker if valid */}
            {isValidCoord(marker) && (
              <MarkerView coordinate={[marker.longitude, marker.latitude]}>
                <TouchableOpacity onPress={() => setShowInfo((prev) => !prev)}>
                  <Text style={styles.markerText}>🏠</Text>
                </TouchableOpacity>
                {showInfo && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoText}>{marker.phone ?? 'Unknown'}</Text>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoText}>{marker.name ?? 'Unknown'}</Text>
                    <Text style={styles.infoLabel}>Title:</Text>
                    <Text style={styles.infoText}>{marker.title ?? 'Room for rent'}</Text>
                    <Text style={styles.infoLabel}>Description:</Text>
                    <Text style={styles.infoText}>{marker.description ?? ''}</Text>
                  </View>
                )}
              </MarkerView>
            )}
          </MapView>
        );
      })()}
      {showInput && (
        <View style={styles.inputContainer}>
          <Text style={styles.promptText}>Click Start and enter your name, phone, title, and description</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.inputLabel}>Phone:</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.inputLabel}>Title:</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Room for rent"
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.inputLabel}>Description:</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Spacious and affordable dorm room available."
              multiline
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
