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

function toMapPosition(location) {
  if (!location?.lat || !location?.lng) return null;

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
  };
}

export default function CommunityMap({
  mode = "embedded",
  searchQuery = "",
  searchMode = "local",
}) {
  const {
    filteredMarkers,
    selectedMarkerId,
    selectedLocation,
    focusLocation,
  } = useMap();

  const { viewLocation, displayLocation, locationMode } =
    useLocationContext();

  const { isLoaded } = useGoogleMaps();

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const activeLocation = useMemo(() => {
    return viewLocation || displayLocation;
  }, [viewLocation, displayLocation]);

  const userPosition = useMemo(() => {
    return toMapPosition(activeLocation);
  }, [activeLocation]);

  const center = useMemo(() => {
    return selectedLocation || userPosition || DEFAULT_CENTER;
  }, [selectedLocation, userPosition]);

  const zoom = useMemo(() => {
    if (selectedLocation) return 15;
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
      gestureHandling: "greedy",
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

  const createMarkerElement = useCallback((styles = {}, label = "") => {
    const el = document.createElement("div");

    Object.assign(el.style, {
      width: "15px",
      height: "15px",
      borderRadius: "50%",
      background: "#f59e0b",
      border: "2px solid #ffffff",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      cursor: "pointer",
      transform: "translateY(-2px)",
      ...styles,
    });

    if (label) {
      el.title = label;
      el.setAttribute("aria-label", label);
    }

    return el;
  }, []);

  const getMarkerColour = useCallback((item, isSelected) => {
    if (isSelected) return "#8d1b1b";

    switch (item?.type) {
      case "event":
        return "#2563eb";
      case "incident":
        return "#dc2626";
      case "beacon":
        return "#7c3aed";
      case "blob":
        return "#f59e0b";
      case "business":
        return "#16a34a";
      default:
        return "#f59e0b";
    }
  }, []);

  const createActivityMarker = useCallback(
    (item, map) => {
      const position = getPosition(item);
      if (!position) return null;

      const isSelected = item.id === selectedMarkerId;

      const el = createMarkerElement(
        {
          width: isSelected ? "19px" : "15px",
          height: isSelected ? "19px" : "15px",
          background: getMarkerColour(item, isSelected),
          boxShadow: isSelected
            ? "0 0 0 5px rgba(141,27,27,0.18), 0 6px 14px rgba(0,0,0,0.28)"
            : "0 4px 10px rgba(0,0,0,0.25)",
        },
        item.title || item.type || "Community marker"
      );

      el.addEventListener("click", () => {
        focusLocation(position, item.id);
      });

      return new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: el,
        title: item.title || item.type || "Community marker",
      });
    },
    [
      getPosition,
      selectedMarkerId,
      createMarkerElement,
      getMarkerColour,
      focusLocation,
    ]
  );

  const createUserLocationMarker = useCallback(
    (map) => {
      if (!userPosition) return null;

      const el = createMarkerElement(
        {
          width: "18px",
          height: "18px",
          background: locationMode === "manual" ? "#8d1b1b" : "#2563eb",
          border: "3px solid #ffffff",
          boxShadow: "0 0 0 5px rgba(37,99,235,0.16)",
        },
        "Your selected location"
      );

      return new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: userPosition,
        content: el,
        title: "Your selected location",
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
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) return;

    clearMarkers();

    const map = mapRef.current;

    const activityMarkers = filteredMarkers
      .map((item) => createActivityMarker(item, map))
      .filter(Boolean);

    const userMarker = createUserLocationMarker(map);

    if (userMarker) {
      activityMarkers.push(userMarker);
    }

    markersRef.current = activityMarkers;

    return clearMarkers;
  }, [
    filteredMarkers,
    createActivityMarker,
    createUserLocationMarker,
    clearMarkers,
  ]);

  if (!isLoaded) {
    return <div className="map-loading">Loading map...</div>;
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

      {searchQuery && (
        <div className="map-search-context">
          <span>{searchMode}</span>
          <strong>{searchQuery}</strong>
        </div>
      )}
    </div>
  );
}