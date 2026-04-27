// components/Map/CommunityMap.jsx
import {
  GoogleMap,
  MarkerClusterer,
  InfoWindow,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { useMap } from "../../context/MapContext";

const DEFAULT_CENTER = { lat: -37.8136, lng: 144.9631 };

const containerStyle = {
  width: "100%",
  height: "100%",
};

const ICONS = {
  default: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  selected: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
};

export default function CommunityMap() {
  const {
    filteredMarkers,
    selectedMarkerId,
    selectedLocation,
    focusOnMarker,
    setSelectedMarkerId,
    getMarkerById,
  } = useMap();

  const mapRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
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
     PAN TO SELECTION
  ========================= */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.panTo(selectedLocation);
    map.setZoom(14);
  }, [selectedLocation]);

  /* =========================
     FILTER BY VIEWPORT
  ========================= */

  const visibleMarkers = useMemo(() => {
    if (!bounds) return filteredMarkers;

    return filteredMarkers.filter((m) => {
      const pos = m.location;
      return pos && bounds.contains(pos);
    });
  }, [filteredMarkers, bounds]);

  const selectedMarker = useMemo(() => {
    return selectedMarkerId ? getMarkerById(selectedMarkerId) : null;
  }, [selectedMarkerId, getMarkerById]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      center={DEFAULT_CENTER}
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
      <MarkerClusterer>
        {(clusterer) =>
          visibleMarkers.map((m) => {
            const isSelected = m.id === selectedMarkerId;

            return (
              <Marker
                key={m.id}
                position={m.location}
                clusterer={clusterer}
                icon={isSelected ? ICONS.selected : ICONS.default}
                onClick={() => focusOnMarker(m.location, m.id)}
              />
            );
          })
        }
      </MarkerClusterer>

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.location}
          onCloseClick={() => setSelectedMarkerId(null)}
        >
          <div>
            <strong>{selectedMarker.title}</strong>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}