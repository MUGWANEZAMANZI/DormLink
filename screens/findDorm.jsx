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
          setUserLocation(loc.coords);
        }
      } catch (e) {}
    })();
    const loadDorms = async () => {
      try {
        const response = await fetch('https://dormlink.up.railway.app/api/dorms');
        if (!response.ok) throw new Error('Failed to fetch dorms');
        const data = await response.json();
        setMarkers(data);
      } catch (e) {
        Alert.alert('Error', 'Could not load dorms from server.');
      }
    };
    loadDorms();
  }, []);

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

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        camera={{
          centerCoordinate: userLocation
            ? [userLocation.longitude, userLocation.latitude]
            : markers[0]
              ? [markers[0].longitude, markers[0].latitude]
              : [30.1, -1.95],
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
        {userLocation && (
          <MarkerView coordinate={userLocation}>
            <Text style={{ fontSize: 24, color: 'blue' }}>📍</Text>
          </MarkerView>
        )}
        {markers.map((coord, index) => (
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
