import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useMap } from "../../context/MapContext";

/* =========================
   CONFIG
========================= */

const DEFAULT_CENTER = {
  lat: -37.8136,
  lng: 144.9631,
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const ICONS = {
  default: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  selected: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

/* =========================
   COMPONENT
========================= */

export default function CommunityMap({ mode = "embedded" }) {
  const {
    filteredMarkers,
    selectedMarkerId,
    selectedLocation,
    focusLocation,
    userLocation,
  } = useMap();

  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ["places"], // 🔥 THIS FIXES IT
});

  /* =========================
     HELPERS
  ========================= */

  const getPosition = useCallback((item) => {
    return item.location || { lat: item.lat, lng: item.lng };
  }, []);

  /* =========================
     CENTER LOGIC
  ========================= */

  const center = useMemo(() => {
    return selectedLocation || userLocation || DEFAULT_CENTER;
  }, [selectedLocation, userLocation]);

  /* =========================
     PAN TO SELECTED
  ========================= */

  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    mapRef.current.panTo(selectedLocation);
    mapRef.current.setZoom(14);
  }, [selectedLocation]);

  /* =========================
     LOAD
  ========================= */

  if (!isLoaded) return <div>Loading map...</div>;

  /* =========================
     RENDER
  ========================= */

  return (
    <GoogleMap
      center={center}
      zoom={12}
      mapContainerStyle={containerStyle}
      onLoad={(map) => (mapRef.current = map)}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
      }}
    >
      {/* 🔥 USER LOCATION (optional but nice) */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        />
      )}

      {/* 🔥 FEED MARKERS */}
      {filteredMarkers.map((item) => {
        const position = getPosition(item);
        if (!position) return null;

        const isSelected = item.id === selectedMarkerId;

        return (
          <Marker
            key={item.id}
            position={position}
            icon={isSelected ? ICONS.selected : ICONS.default}
            onClick={() => focusLocation(position, item.id)}
          />
        );
      })}
    </GoogleMap>
  );
}