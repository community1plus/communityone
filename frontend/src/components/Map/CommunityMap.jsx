// =========================================================
// CommunityMap.jsx
// =========================================================

import { GoogleMap } from "@react-google-maps/api";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useMap } from "../../context/MapContext";

import { useGoogleMaps } from "../../context/GoogleMapsProvider";

import { useLocationContext } from "../../context/LocationProvider";

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_CENTER = {
  lat: -37.8136,
  lng: 144.9631,
};

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

/* =========================================================
   HELPERS
========================================================= */

function toMapPosition(location) {
  if (!location?.lat || !location?.lng) {
    return null;
  }

  return {
    lat: Number(location.lat),
    lng: Number(location.lng),
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CommunityMap({
  mode = "embedded",
  searchQuery = "",
  searchMode = "local",
}) {
  /* ======================================================
     MAP CONTEXT
  ====================================================== */

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

  const { isLoaded } =
    useGoogleMaps();

  /* ======================================================
     STATE
  ====================================================== */

  const [mapReady, setMapReady] =
    useState(false);

  /* ======================================================
     REFS
  ====================================================== */

  const mapRef = useRef(null);

  const markersRef = useRef([]);

  const mapLoadStart = useRef(
    performance.now()
  );

  /* ======================================================
     ACTIVE LOCATION
  ====================================================== */

  const activeLocation =
    useMemo(() => {
      return (
        viewLocation ||
        displayLocation
      );
    }, [
      viewLocation,
      displayLocation,
    ]);

  /* ======================================================
     USER POSITION
  ====================================================== */

  const userPosition =
    useMemo(() => {
      return toMapPosition(
        activeLocation
      );
    }, [activeLocation]);

  /* ======================================================
     CENTER
  ====================================================== */

  const center = useMemo(() => {
    return (
      selectedLocation ||
      userPosition ||
      DEFAULT_CENTER
    );
  }, [
    selectedLocation,
    userPosition,
  ]);

  /* ======================================================
     ZOOM
  ====================================================== */

  const zoom = useMemo(() => {
    if (selectedLocation) return 15;

    if (
      locationMode === "manual"
    )
      return 15;

    if (userPosition) return 13;

    return mode === "full"
      ? 14
      : 12;
  }, [
    selectedLocation,
    locationMode,
    userPosition,
    mode,
  ]);

  /* ======================================================
     MAP OPTIONS
  ====================================================== */

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

  /* ======================================================
     POSITION
  ====================================================== */

  const getPosition =
    useCallback((item) => {
      if (!item) return null;

      const raw =
        item.location || {
          lat: item.lat,
          lng: item.lng,
        };

      return toMapPosition(raw);
    }, []);

  /* ======================================================
     CLEAR MARKERS
  ====================================================== */

  const clearMarkers =
    useCallback(() => {
      markersRef.current.forEach(
        (marker) => {
          marker.map = null;
        }
      );

      markersRef.current = [];
    }, []);

  /* ======================================================
     MARKER ELEMENT
  ====================================================== */

  const createMarkerElement =
    useCallback(
      (
        styles = {},
        label = ""
      ) => {
        const el =
          document.createElement(
            "div"
          );

        Object.assign(
          el.style,
          {
            width: "15px",

            height: "15px",

            borderRadius: "50%",

            background:
              "#f59e0b",

            border:
              "2px solid #ffffff",

            boxShadow:
              "0 4px 10px rgba(0,0,0,0.25)",

            cursor: "pointer",

            transform:
              "translateY(-2px)",

            ...styles,
          }
        );

        if (label) {
          el.title = label;

          el.setAttribute(
            "aria-label",
            label
          );
        }

        return el;
      },
      []
    );

  /* ======================================================
     MARKER COLOUR
  ====================================================== */

  const getMarkerColour =
    useCallback(
      (item, isSelected) => {
        if (isSelected)
          return "#8d1b1b";

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
      },
      []
    );

  /* ======================================================
     ACTIVITY MARKER
  ====================================================== */

  const createActivityMarker =
    useCallback(
      (item, map) => {
        const position =
          getPosition(item);

        if (!position)
          return null;

        const isSelected =
          item.id ===
          selectedMarkerId;

        const el =
          createMarkerElement(
            {
              width:
                isSelected
                  ? "19px"
                  : "15px",

              height:
                isSelected
                  ? "19px"
                  : "15px",

              background:
                getMarkerColour(
                  item,
                  isSelected
                ),

              boxShadow:
                isSelected
                  ? "0 0 0 5px rgba(141,27,27,0.18), 0 6px 14px rgba(0,0,0,0.28)"
                  : "0 4px 10px rgba(0,0,0,0.25)",
            },
            item.title ||
              item.type ||
              "Community marker"
          );

        el.addEventListener(
          "click",
          () => {
            focusLocation(
              position,
              item.id
            );
          }
        );

        return new window.google.maps.marker.AdvancedMarkerElement(
          {
            map,

            position,

            content: el,

            title:
              item.title ||
              item.type ||
              "Community marker",
          }
        );
      },
      [
        getPosition,
        selectedMarkerId,
        createMarkerElement,
        getMarkerColour,
        focusLocation,
      ]
    );

  /* ======================================================
     USER LOCATION MARKER
  ====================================================== */

  const createUserLocationMarker =
    useCallback(
      (map) => {
        if (!userPosition)
          return null;

        const el =
          createMarkerElement(
            {
              width: "18px",

              height: "18px",

              background:
                locationMode ===
                "manual"
                  ? "#8d1b1b"
                  : "#2563eb",

              border:
                "3px solid #ffffff",

              boxShadow:
                "0 0 0 5px rgba(37,99,235,0.16)",
            },
            "Your selected location"
          );

        return new window.google.maps.marker.AdvancedMarkerElement(
          {
            map,

            position:
              userPosition,

            content: el,

            title:
              "Your selected location",
          }
        );
      },
      [
        userPosition,
        locationMode,
        createMarkerElement,
      ]
    );

  /* ======================================================
     PAN + ZOOM
  ====================================================== */

  useEffect(() => {
    if (
      !mapRef.current ||
      !center
    )
      return;

    mapRef.current.panTo(
      center
    );

    mapRef.current.setZoom(
      zoom
    );
  }, [center, zoom]);

  /* ======================================================
     MARKERS
  ====================================================== */

  useEffect(() => {
    if (!mapRef.current)
      return;

    if (
      !window.google?.maps
        ?.marker
        ?.AdvancedMarkerElement
    )
      return;

    clearMarkers();

    const map =
      mapRef.current;

    const activityMarkers =
      filteredMarkers
        .map((item) =>
          createActivityMarker(
            item,
            map
          )
        )
        .filter(Boolean);

    const userMarker =
      createUserLocationMarker(
        map
      );

    if (userMarker) {
      activityMarkers.push(
        userMarker
      );
    }

    markersRef.current =
      activityMarkers;

    return clearMarkers;
  }, [
    filteredMarkers,
    createActivityMarker,
    createUserLocationMarker,
    clearMarkers,
  ]);

  /* ======================================================
     SDK LOADING
  ====================================================== */

  if (!isLoaded) {
    return (
      <div className="map-skeleton">
        <div className="map-shimmer" />

        <div className="map-loading-text">
          Loading Community One...
        </div>
      </div>
    );
  }

  /* ======================================================
     RENDER
  ====================================================== */

  /* ======================================================
   RENDER
====================================================== */

return (
  <div className="map-wrapper">
    {/* MAP SKELETON */}

    <div
      className="map-skeleton"
      style={{
        opacity: mapReady ? 0 : 1,
      }}
    >
      <div className="map-shimmer" />

      <div className="map-loading-text">
        Loading your area...
      </div>
    </div>

    {/* MAP */}

    <div className="map-visible">
      <GoogleMap
        center={center}
        zoom={zoom}
        mapContainerStyle={
          MAP_CONTAINER_STYLE
        }
        onLoad={(map) => {
          console.log(
            "MAP READY:",
            (
              performance.now() -
              mapLoadStart.current
            ).toFixed(2),
            "ms"
          );

          mapRef.current = map;

          requestAnimationFrame(
            () => {
              setMapReady(
                true
              );
            }
          );
        }}
        onUnmount={() => {
          clearMarkers();

          mapRef.current =
            null;

          setMapReady(false);
        }}
        options={mapOptions}
      />
    </div>

    {/* SEARCH CONTEXT */}

    {searchQuery && (
      <div className="map-search-context">
        <span>
          {searchMode}
        </span>

        <strong>
          {searchQuery}
        </strong>
      </div>
    )}
  </div>
);
}