import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useMap } from "../../context/MapContext";

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
  feed: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  yellowpages: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  alerts: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  default: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  selected: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
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
     MAP LOAD
  ========================= */

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  /* =========================
     VIEWPORT TRACKING
  ========================= */

  const handleIdle = useCallback(() => {
    if (!mapRef.current) return;
    setBounds(mapRef.current.getBounds());
  }, []);

  /* =========================
     PAN TO SELECTED
  ========================= */

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.panTo(selectedLocation);
      mapRef.current.setZoom(14);
    }
  }, [selectedLocation]);

  /* =========================
     HELPERS
  ========================= */

  const getPosition = useCallback(
    (item) => item.location || { lat: item.lat, lng: item.lng },
    []
  );

  /* =========================
     SELECTED MARKER (ID-BASED)
  ========================= */

  const selectedMarker = useMemo(() => {
    return getMarkerById?.(selectedMarkerId);
  }, [selectedMarkerId, getMarkerById]);

  /* =========================
     VIEWPORT FILTER
  ========================= */

  const visibleMarkers = useMemo(() => {
    if (!bounds) return filteredMarkers;

    return filteredMarkers.filter((item) =>
      bounds.contains(getPosition(item))
    );
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
         CLUSTERED MARKERS
      ========================= */}

      <MarkerClusterer>
        {(clusterer) =>
          visibleMarkers.map((item) => {
            const position = getPosition(item);

            const isSelected = item.id === selectedMarkerId;

            const source = item.__source || "default";

            const icon = isSelected
              ? ICONS.selected
              : ICONS[source] || ICONS.default;

            return (
              <Marker
                key={`${item.__source}-${item.id}`}
                position={position}
                clusterer={clusterer}
                icon={icon}
                onClick={() => focusLocation(position, item.id)} // 🔥 ID-based
              />
            );
          })
        }
      </MarkerClusterer>

      {/* =========================
         INFOWINDOW (SYNCED)
      ========================= */}

      {selectedMarker && (
        <InfoWindow
          position={getPosition(selectedMarker)}
          onCloseClick={() => {
            setSelectedMarkerId(null);
          }}
        >
          <div style={{ minWidth: "180px" }}>
            <strong>{selectedMarker.title}</strong>

            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Type: {selectedMarker.type}
            </div>

            <button
              style={{ marginTop: "8px" }}
              onClick={() => {
                // Panel is already synced via selectedMarkerId
              }}
            >
              View details
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}