import { useLocation } from "./context/LocationProvider";

export default function useUserLocation() {
  const location = useLocation();

  return {
    homeLocation: location?.homeLocation || null,
    liveLocation: location?.liveLocation || null,
    viewLocation: location?.viewLocation || null,
    loading: location?.loading || false,
  };
}