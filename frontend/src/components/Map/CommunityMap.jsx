import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef } from "react";
import { useMap } from "../../context/MapContext";

const DEFAULT_CENTER = {
  lat: -37.8136, // Melbourne
  lng: 144.9631,
};

export default function CommunityMap() {
  const { selectedLocation, filteredMarkers } = useMap();

  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
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
     LOAD STATE
  ========================= */

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <GoogleMap
      center={DEFAULT_CENTER}
      zoom={12}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      onLoad={(map) => (mapRef.current = map)}
    >

      {/* 🔥 MARKERS */}
      {filteredMarkers.map((item) => (
        <Marker
          key={item.id}
          position={item.location}
        />
      ))}

      {/* 🔥 SELECTED HIGHLIGHT */}
      {selectedLocation && (
        <Marker
          position={selectedLocation}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />
      )}

    </GoogleMap>
  );
}