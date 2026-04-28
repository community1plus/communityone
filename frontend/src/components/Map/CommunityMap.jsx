import {
  GoogleMap,
  MarkerClusterer,
  InfoWindow,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useMap } from "../../context/MapContext";

/* =========================
   CONFIG
========================= */

const DEFAULT_CENTER = { lat: -37.8136, lng: 144.9631 };

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

export default function CommunityMap() {
  const {
    filteredMarkers,
    selectedMarkerId,
    selectedLocation,
    focusLocation, // 🔥 use consistent naming
    setSelectedMarkerId,
    getMarkerById,
    userLocation,
  } = useMap();

  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"], // 🔥 future-proof (header autocomplete)
  });

  /* =========================
     MAP LIFECYCLE
  ========================= */

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onIdle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const b = map.getBounds();
    if (b) setBounds(b);
  }, []);

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

  const mapCenter = useMemo(() => {
    return selectedLocation || userLocation || DEFAULT_CENTER;
  }, [selectedLocation, userLocation]);

  /* =========================
     PAN TO SELECTION
  ========================= */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.panTo(selectedLocation);
    map.setZoom(14);
  }, [selectedLocation]);

  /* =========================
     VIEWPORT FILTER (SAFE)
  ========================= */

  const visibleMarkers = useMemo(() => {
    if (!bounds || !bounds.contains) return filteredMarkers;

    return filteredMarkers.filter((m) => {
      const pos = getPosition(m);
      return pos && bounds.contains(pos);
    });
  }, [filteredMarkers, bounds, getPosition]);

  /* =========================
     SELECTED MARKER (SAFE)
  ========================= */

  const selectedMarker = useMemo(() => {
    if (!selectedMarkerId || !getMarkerById) return null;
    return getMarkerById(selectedMarkerId);
  }, [selectedMarkerId, getMarkerById]);

  /* =========================
     LOAD STATE
  ========================= */

  if (!isLoaded) return <div>Loading map...</div>;

  /* =========================
     RENDER
  ========================= */

  return (
    <GoogleMap
      center={mapCenter}
      zoom={12}
      mapContainerStyle={containerStyle}
      onLoad={onLoad}
      onIdle={onIdle}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* =========================
         CLUSTERED MARKERS
      ========================= */}

      <MarkerClusterer>
        {(clusterer) =>
          visibleMarkers.map((m) => {
            const position = getPosition(m);
            if (!position) return null;

            const isSelected = m.id === selectedMarkerId;

            return (
              <Marker
                key={m.id}
                position={position}
                clusterer={clusterer}
                icon={isSelected ? ICONS.selected : ICONS.default}
                onClick={() => focusLocation(position, m.id)}
              />
            );
          })
        }
      </MarkerClusterer>

      {/* =========================
         INFOWINDOW
      ========================= */}

      {selectedMarker && (
        <InfoWindow
          position={getPosition(selectedMarker)}
          onCloseClick={() => setSelectedMarkerId(null)}
        >
          <div style={{ minWidth: "160px" }}>
            <strong>{selectedMarker.title}</strong>

            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Type: {selectedMarker.type}
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}