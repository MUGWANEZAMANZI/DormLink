import React, { useEffect, useState } from "react";
import { MapView, MarkerView, RasterSource, RasterLayer } from "@maplibre/maplibre-react-native";
import { Text, View, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import * as Location from 'expo-location';

export default function FindDorm() {
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [reportModal, setReportModal] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState(null);
  const [reportName, setReportName] = useState("");
  const [reportPhone, setReportPhone] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          // Debug log
          console.log('User Location:', loc.coords);
          setUserLocation(loc.coords);
        }
      } catch (e) {}
    })();
    const loadDorms = async () => {
      try {
        const response = await fetch('https://dormlink.up.railway.app/api/dorms');
        if (!response.ok) throw new Error('Failed to fetch dorms');
        const data = await response.json();
        // Debug log
        console.log('Fetched Dorms:', data);
        setMarkers(data);
        setLoadingDorms(false);
      } catch (e) {
        Alert.alert('Error', 'Could not load dorms from server.');
        setLoadingDorms(false);
      }
    };
    loadDorms();
  }, []);

  // Coordinate validation helper
  const isValidCoord = (coord) =>
    coord &&
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude);

  // Only use valid markers
  const validMarkers = markers.filter(isValidCoord);
  const validUserLocation = isValidCoord(userLocation) ? userLocation : null;
  const [loadingDorms, setLoadingDorms] = useState(true);
  const handleReport = async () => {
    if (!reportName || !reportPhone || !reportReason) {
      Alert.alert('Missing Info', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://dormlink.up.railway.app/api/add-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dorm_id: selectedDorm.id,
          name: reportName,
          phone: reportPhone,
          reason: reportReason
        })
      });
      if (!response.ok) {
        setLoading(false);
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to report dorm.');
        return;
      }
      setLoading(false);
      setReportModal(false);
      setReportName(""); setReportPhone(""); setReportReason("");
      Alert.alert('Success', 'Report submitted!');
    } catch (e) {
      setLoading(false);
      Alert.alert('Network Error', 'Could not connect to server.');
    }
  };

  // Show loading indicator if still loading dorms and no valid coordinates
  if (loadingDorms && !validUserLocation && validMarkers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no valid coordinates at all, show fallback message
  if (!validUserLocation && validMarkers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No dorms or location found.</Text>
      </View>
    );
  }

  // Pick center coordinate safely
  const centerCoordinate = validUserLocation
    ? [validUserLocation.longitude, validUserLocation.latitude]
    : validMarkers.length > 0
      ? [validMarkers[0].longitude, validMarkers[0].latitude]
      : [30.1, -1.95];

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        camera={{
          centerCoordinate,
          zoom: 13,
        }}
      >
        {/* MapTiler raster tile source and layer */}
        <RasterSource
          id="maptiler"
          tileUrlTemplates={["https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=j9MPFHyHhzbXKIh6Q7Ov"]}
          tileSize={256}
        >
          <RasterLayer id="maptiler-layer" sourceID="maptiler" />
        </RasterSource>
        {/* User's live location marker */}
        {validUserLocation && (
          <MarkerView coordinate={validUserLocation}>
            <Text style={{ fontSize: 24, color: 'blue' }}>📍</Text>
          </MarkerView>
        )}
        {validMarkers.map((coord, index) => (
          <MarkerView key={index} coordinate={coord}>
            <TouchableOpacity onPress={() => { setSelectedDorm(coord); setReportModal(true); }}>
              <Text style={{ fontSize: 24 }}>🏠</Text>
            </TouchableOpacity>
          </MarkerView>
        ))}
      </MapView>
      {/* Report Modal */}
      <Modal visible={reportModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Report House</Text>
            <Text>Dorm: {selectedDorm?.title || selectedDorm?.id}</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 10 }}
              placeholder="Your Name"
              value={reportName}
              onChangeText={setReportName}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 10 }}
              placeholder="Your Phone"
              value={reportPhone}
              onChangeText={setReportPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 10, minHeight: 60 }}
              placeholder="Reason"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
              <TouchableOpacity onPress={() => setReportModal(false)} style={{ padding: 10 }}>
                <Text style={{ color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReport} style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 6 }} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white' }}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
