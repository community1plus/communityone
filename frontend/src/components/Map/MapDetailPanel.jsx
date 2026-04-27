import { useMap } from "../../context/MapContext";
import { useMemo } from "react";

export default function MapDetailPanel() {
  const { selectedMarkerId, getMarkerById, setSelectedMarkerId } = useMap();

  const marker = useMemo(() => {
    return getMarkerById(selectedMarkerId);
  }, [selectedMarkerId, getMarkerById]);

  if (!marker) return null;

  return (
    <div className="map-detail-panel">
      <button onClick={() => setSelectedMarkerId(null)}>✖</button>

      <h3>{marker.title}</h3>

      <p>Type: {marker.type}</p>
      <p>Source: {marker.__source}</p>

      {/* 🔥 Extend this later */}
      <div style={{ marginTop: "12px" }}>
        Full details go here...
      </div>
    </div>
  );
}