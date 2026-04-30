import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

/* ===============================
CONFIG (🔥 MUST BE STATIC)
=============================== */

const GOOGLE_LIBRARIES = ["places"];
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* ===============================
CONTEXT (SAFE DEFAULT)
=============================== */

const GoogleMapsContext = createContext({
isLoaded: false,
loadError: null,
google: null,
});

/* ===============================
PROVIDER
=============================== */

export function GoogleMapsProvider({ children }) {
const { isLoaded, loadError } = useJsApiLoader({
id: "google-maps-script",
googleMapsApiKey: GOOGLE_API_KEY,
libraries: GOOGLE_LIBRARIES, // 🔥 prevents reload warning
});

const value = {
isLoaded,
loadError,
google: isLoaded ? window.google : null, // ✅ safe access
};

return (
<GoogleMapsContext.Provider value={value}>
{children}
</GoogleMapsContext.Provider>
);
}

/* ===============================
HOOK
=============================== */

export const useGoogleMaps = () => {
const context = useContext(GoogleMapsContext);

if (!context) {
throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
}

return context;
};
