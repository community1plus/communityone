import { GoogleMap } from "@react-google-maps/api";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useMap } from "../../context/MapContext";
import { useGoogleMaps } from "../../context/GoogleMapsProvider";
import { useLocationContext } from "../../context/LocationProvider";

const DEFAULT_CENTER = {
  lat: -37.8136,
  lng: 144.9631,
};

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const toMapPosition = (location) => {
  if (!location?.lat || !location?.lng) return null;

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
  };
};

export default function CommunityMap({ mode = "embedded" }) {
  const {
    filteredMarkers,
    selectedMarkerId,
    selectedLocation,
    focusLocation,
  } = useMap();

  const {
    viewLocation,
    displayLocation,
    locationMode,
  } = useLocationContext();

  const { isLoaded } = useGoogleMaps();

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const activeLocation = useMemo(
    () => viewLocation || displayLocation,
    [viewLocation, displayLocation]
  );

  const userPosition = useMemo(
    () => toMapPosition(activeLocation),
    [activeLocation]
  );

  const center = useMemo(() => {
    return selectedLocation || userPosition || DEFAULT_CENTER;
  }, [selectedLocation, userPosition]);

  const zoom = useMemo(() => {
    if (selectedLocation) return 14;
    if (locationMode === "manual") return 15;
    if (userPosition) return 13;
    return mode === "full" ? 14 : 12;
  }, [selectedLocation, locationMode, userPosition, mode]);

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

  const getPosition = useCallback((item) => {
    if (!item) return null;

    const raw = item.location || {
      lat: item.lat,
      lng: item.lng,
    };

    return toMapPosition(raw);
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });

    markersRef.current = [];
  }, []);

  const createMarkerElement = useCallback((styles = {}) => {
    const el = document.createElement("div");

    Object.assign(el.style, {
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      background: "#f59e0b",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      cursor: "pointer",
      ...styles,
    });

    return el;
  }, []);

  const createMarker = useCallback(
    (item, map) => {
      const position = getPosition(item);
      if (!position) return null;

      const isSelected = item.id === selectedMarkerId;

      const el = createMarkerElement({
        background: isSelected ? "#b11226" : "#f59e0b",
      });

      el.addEventListener("click", () => {
        focusLocation(position, item.id);
      });

      return new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: el,
      });
    },
    [getPosition, selectedMarkerId, createMarkerElement, focusLocation]
  );

  const createUserLocationMarker = useCallback(
    (map) => {
      if (!userPosition) return null;

      const el = createMarkerElement({
        width: "16px",
        height: "16px",
        background: locationMode === "manual" ? "#b11226" : "#2563eb",
        border: "2px solid white",
      });

      return new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: userPosition,
        content: el,
      });
    },
    [userPosition, locationMode, createMarkerElement]
  );

  useEffect(() => {
    if (!mapRef.current || !center) return;

    mapRef.current.panTo(center);
    mapRef.current.setZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.google?.maps?.marker) return;

    clearMarkers();

    const map = mapRef.current;

    const newMarkers = filteredMarkers
      .map((item) => createMarker(item, map))
      .filter(Boolean);

    const userMarker = createUserLocationMarker(map);

    if (userMarker) {
      newMarkers.push(userMarker);
    }

    markersRef.current = newMarkers;

    return clearMarkers;
  }, [
    filteredMarkers,
    createMarker,
    createUserLocationMarker,
    clearMarkers,
  ]);

  if (!isLoaded) {
    return <div style={{ padding: 20 }}>Loading map...</div>;
  }

  return (
    <div className="map-wrapper">
      <GoogleMap
        center={center}
        zoom={zoom}
        mapContainerStyle={MAP_CONTAINER_STYLE}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        onUnmount={() => {
          clearMarkers();
          mapRef.current = null;
        }}
        options={mapOptions}
      />
    </div>
  );
}