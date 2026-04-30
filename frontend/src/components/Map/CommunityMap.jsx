import { GoogleMap } from "@react-google-maps/api";
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

  const { isLoaded } = useGoogleMaps();

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  /* =========================
     HELPERS
  ========================= */

  const getPosition = useCallback((item) => {
    if (!item) return null;
    return item.location || { lat: item.lat, lng: item.lng };
  }, []);

  /* =========================
     CENTER
  ========================= */

  const center = useMemo(() => {
    return selectedLocation || userLocation || DEFAULT_CENTER;
  }, [selectedLocation, userLocation]);

  /* =========================
     ZOOM
  ========================= */

  const zoom = mode === "full" ? 14 : 12;

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
     PAN TO SELECTED
  ========================= */

  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    mapRef.current.panTo(selectedLocation);
    mapRef.current.setZoom(14);
  }, [selectedLocation]);

  /* =========================
     CLEAR MARKERS
  ========================= */

  const clearMarkers = () => {
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];
  };

  /* =========================
     CREATE MARKER
  ========================= */

  const createMarker = (item, map) => {
    const position = getPosition(item);
    if (!position) return null;

    const isSelected = item.id === selectedMarkerId;

    const el = document.createElement("div");

    el.style.width = "14px";
    el.style.height = "14px";
    el.style.borderRadius = "50%";
    el.style.background = isSelected ? "#b11226" : "#f59e0b";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    el.style.cursor = "pointer";

    el.addEventListener("click", () =>
      focusLocation(position, item.id)
    );

    return new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: el,
    });
  };

  /* =========================
     UPDATE MARKERS
  ========================= */

  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.google?.maps?.marker) return;

    clearMarkers();

    const map = mapRef.current;

    const newMarkers = filteredMarkers
      .map((item) => createMarker(item, map))
      .filter(Boolean);

    /* USER LOCATION MARKER */
    if (userLocation) {
      const userEl = document.createElement("div");

      userEl.style.width = "16px";
      userEl.style.height = "16px";
      userEl.style.borderRadius = "50%";
      userEl.style.background = "#2563eb";
      userEl.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      userEl.style.border = "2px solid white";

      const userMarker =
        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: userLocation,
          content: userEl,
        });

      newMarkers.push(userMarker);
    }

    markersRef.current = newMarkers;

    return () => {
      clearMarkers(); // 🔥 prevents leaks
    };

  }, [filteredMarkers, selectedMarkerId, userLocation]);

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
    />
  );
}