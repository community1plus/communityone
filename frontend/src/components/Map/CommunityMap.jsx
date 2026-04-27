import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef, useMemo } from "react";
import { useMap } from "../../context/MapContext";

const DEFAULT_CENTER = {
  lat: -37.8136,
  lng: 144.9631,
};

export default function CommunityMap() {
  const { selectedLocation, filteredMarkers } = useMap();

  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  /* =========================
     PAN TO SELECTED LOCATION
  ========================= */

  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.panTo(selectedLocation);
      mapRef.current.setZoom(14);
    }
  }, [selectedLocation]);

  /* =========================
     MEMO MARKERS
  ========================= */

  const markers = useMemo(() => {
    return filteredMarkers.map((item) => {
      const position =
        item.location || { lat: item.lat, lng: item.lng };

      const isSelected =
        selectedLocation &&
        position.lat === selectedLocation.lat &&
        position.lng === selectedLocation.lng;

      return (
        <Marker
          key={item.id}
          position={position}
          icon={
            isSelected
              ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              : undefined
          }
        />
      );
    });
  }, [filteredMarkers, selectedLocation]);

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
      mapContainerStyle={{ width: "100%", height: "100%" }}
      onLoad={(map) => (mapRef.current = map)}
    >
      {markers}
    </GoogleMap>
  );
}