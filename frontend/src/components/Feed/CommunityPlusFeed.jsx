import { useEffect } from "react";
import { useMap } from "../../context/MapContext";

export default function Feed() {
  const { setMarkers, focusOnMarker } = useMap();

  const items = [
    {
      id: 1,
      title: "🚨 Incident",
      type: "incident",
      location: { lat: -37.8136, lng: 144.9631 },
    },
    {
      id: 2,
      title: "📅 Event",
      type: "event",
      location: { lat: -37.81, lng: 144.97 },
    },
  ];

  /* =========================
     LOAD INTO GLOBAL STATE
  ========================= */

  useEffect(() => {
    setMarkers((prev) => {
      // prevent duplication on re-render
      const existingIds = new Set(prev.map((m) => m.id));

      const newItems = items
        .filter((item) => !existingIds.has(item.id))
        .map((item) => ({
          ...item,
          __source: "feed",
        }));

      return [...prev, ...newItems];
    });
  }, [setMarkers]);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="feed">
      {items.map((item) => (
        <div
          key={item.id}
          className="feed-card"
          onClick={() => focusOnMarker(item.location, item.id)}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}