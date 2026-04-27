import {
  GoogleMap,
  MarkerClusterer,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useMap } from "../../context/MapContext";

/* =========================
   CONFIG
========================= */

const DEFAULT_CENTER = { lat: -37.8136, lng: 144.9631 };

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

/* ✅ FIXED: HTTPS + cleaner mapping */
const ICONS = {
  feed: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  yellowpages: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  alerts: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  default: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  selected: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

/* =========================
   COMPONENT
========================= */

export default function CommunityMap() {
  const {
    selectedLocation,
    selectedMarkerId,
    filteredMarkers,
    focusLocation,
    getMarkerById,
    setSelectedMarkerId,
  } = useMap();

  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  /* =========================
     MAP LOAD (STABLE)
  ========================= */

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  /* =========================
     VIEWPORT TRACKING
  ========================= */

  const handleIdle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextBounds = map.getBounds();
    if (nextBounds) setBounds(nextBounds);
  }, []);

  /* =========================
     PAN TO SELECTED (SAFE)
  ========================= */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.panTo(selectedLocation);
    map.setZoom(14);
  }, [selectedLocation]);

  /* =========================
     HELPERS
  ========================= */

  const getPosition = useCallback((item) => {
    if (!item) return null;
    return item.location || { lat: item.lat, lng: item.lng };
  }, []);

  /* =========================
     DERIVED STATE
  ========================= */

  const selectedMarker = useMemo(() => {
    return selectedMarkerId ? getMarkerById?.(selectedMarkerId) : null;
  }, [selectedMarkerId, getMarkerById]);

  const visibleMarkers = useMemo(() => {
    if (!bounds) return filteredMarkers;

    return filteredMarkers.filter((item) => {
      const pos = getPosition(item);
      return pos && bounds.contains(pos);
    });
  }, [filteredMarkers, bounds, getPosition]);

  /* =========================
     LOAD STATE
  ========================= */

  if (!isLoaded) return <div>Loading map...</div>;

  /* =========================
     RENDER
  ========================= */

  return (
    <GoogleMap
      center={selectedLocation || DEFAULT_CENTER}
      zoom={12}
      mapContainerStyle={MAP_CONTAINER_STYLE}
      onLoad={handleLoad}
      onIdle={handleIdle}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* =========================
         CLUSTERS
      ========================= */}

      <MarkerClusterer>
        {(clusterer) =>
          visibleMarkers.map((item) => {
            const position = getPosition(item);
            if (!position) return null;

            const isSelected = item.id === selectedMarkerId;
            const source = item.__source || "default";

            const icon = isSelected
              ? ICONS.selected
              : ICONS[source] || ICONS.default;

            return (
              <MapMarker
                key={`${source}-${item.id}`}
                position={position}
                clusterer={clusterer}
                icon={icon}
                onClick={() => focusLocation(position, item.id)}
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
          <div style={{ minWidth: 180 }}>
            <strong>{selectedMarker.title}</strong>

            <div style={{ fontSize: 12, marginTop: 4 }}>
              Type: {selectedMarker.type}
            </div>

            <button style={{ marginTop: 8 }}>
              View details
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

/* =========================
   MARKER COMPONENT (ISOLATED)
========================= */

import { Marker } from "@react-google-maps/api";

const MapMarker = ({ position, clusterer, icon, onClick }) => {
  return (
    <Marker
      position={position}
      clusterer={clusterer}
      icon={icon}
      onClick={onClick}
    />
  );
};