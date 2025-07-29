import React, { useEffect, useState } from "react";
import { MapView, MarkerView } from "@maplibre/maplibre-react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FindDorm() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const loadDorms = async () => {
      const saved = await AsyncStorage.getItem('dorms');
      if (saved) {
        setMarkers(JSON.parse(saved));
      }
    };

    loadDorms();
  }, []);

  return (
    <MapView style={{ flex: 1 }}>
      {markers.map((coord, index) => (
        <MarkerView key={index} coordinate={coord}>
          <Text style={{ fontSize: 24 }}>🏠</Text>
        </MarkerView>
      ))}
    </MapView>
  );
}
