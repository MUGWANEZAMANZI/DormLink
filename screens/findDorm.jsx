import React, { useEffect, useState } from "react";
import { MapView, MarkerView, RasterSource, RasterLayer } from "@maplibre/maplibre-react-native";
import { Text } from "react-native";
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
    <MapView
      style={{ flex: 1 }}
      camera={{
        centerCoordinate: markers[0] ? [markers[0].longitude, markers[0].latitude] : [30.1, -1.95],
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
      {markers.map((coord, index) => (
        <MarkerView key={index} coordinate={coord}>
          <Text style={{ fontSize: 24 }}>🏠</Text>
        </MarkerView>
      ))}
    </MapView>
  );
}
