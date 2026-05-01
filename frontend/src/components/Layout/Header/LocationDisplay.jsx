// LocationDisplay.jsx
import { useUserLocation } from "../../../hooks/useUserLocation";
import LocationPin from "../../UI/LocationPin";

export default function LocationDisplay() {
  const { location, loading } = useUserLocation();

  const label = loading
    ? "Detecting location..."
    : location?.label || "Set location";

  return (
    <div className="location-display">
      <LocationPin loading={loading} />
      <span>{label}</span>
    </div>
  );
}