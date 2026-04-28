import { GoogleMap, Marker } from "@react-google-maps/api";
import { useEffect, useRef, useMemo, useCallback } from "react";

import { useMap } from "../../context/MapContext";
import { useGoogleMaps } from "../../context/GoogleMapsProvider";

/* =========================
   CONFIG
========================= */

const DEFAULT_CENTER = {
  lat: -37.8136,
  lng: 144.9631,
};

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const ICONS = {
  default: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  selected: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  user: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
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

  const { isLoaded } = useGoogleMaps(); // 🔥 shared loader
  const mapRef = useRef(null);

  /* =========================
     HELPERS
  ========================= */

  const getPosition = useCallback((item) => {
    if (!item) return null;
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
     MAP OPTIONS
  ========================= */

  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      clickableIcons: false,
    }),
    []
  );

  /* =========================
     ZOOM
  ========================= */

  const zoom = mode === "full" ? 14 : 12;

  /* =========================
     LOAD STATE
  ========================= */

  if (!isLoaded) {
    return <div style={{ padding: 20 }}>Loading map...</div>;
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <GoogleMap
      center={center}
      zoom={zoom}
      mapContainerStyle={MAP_CONTAINER_STYLE}
      onLoad={(map) => (mapRef.current = map)}
      options={mapOptions}
    >
      {/* USER LOCATION */}
      {userLocation && (
        <Marker position={userLocation} icon={ICONS.user} />
      )}

      {/* FEED MARKERS */}
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