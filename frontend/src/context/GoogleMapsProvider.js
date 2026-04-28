import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GoogleMapsContext = createContext();

export function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"], // 🔥 critical
  });

  const value = {
    isLoaded,
    loadError,
    google: window.google, // optional access
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);

  if (!context) {
    throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  }

  return context;
};