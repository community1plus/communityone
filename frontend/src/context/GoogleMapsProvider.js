// src/context/GoogleMapsProvider.jsx
import { useJsApiLoader } from "@react-google-maps/api";

const LIBRARIES = ["places"];

export function useGoogleMaps() {
  return useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });
}