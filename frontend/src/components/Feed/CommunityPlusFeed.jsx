import { useEffect } from "react";
import { useMap } from "../../context/MapContext";

export default function Feed() {
  const { focusLocation, setMapMarkers } = useMap();

  const items = [
    {
      id: 1,
      title: "🚨 Incident",
      location: { lat: -37.8136, lng: 144.9631 },
    },
    {
      id: 2,
      title: "📅 Event",
      location: { lat: -37.81, lng: 144.97 },
    },
  ];

  /* push markers to map */
  useEffect(() => {
    setMapMarkers(items);
  }, [items, setMapMarkers]);

  return (
    <div className="feed">
      {items.map((item) => (
        <div
          key={item.id}
          className="feed-card"
          onClick={() => focusLocation(item.location)}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
}