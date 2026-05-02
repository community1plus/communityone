const LOCATION_STATUS = {
  LEVEL_4: {
    label: "Accurate to Level 4",
    className: "location-green",
  },
  LEVEL_3: {
    label: "Accurate to Level 3",
    className: "location-amber",
  },
  MANUAL: {
    label: "Manually fixed",
    className: "location-red",
  },
};

export default function LocationDisplay({ location }) {
  const safeLocation = location || {
    suburb: "Set location",
    state: "",
    accuracy: "LEVEL_3",
  };

  const status =
    LOCATION_STATUS[safeLocation.accuracy] || LOCATION_STATUS.LEVEL_3;

  return (
    <div className="location-display" title={status.label}>
      <span className={`location-pin ${status.className}`}>●</span>

      <span className="location-text">
        {safeLocation.suburb}
        {safeLocation.state ? `, ${safeLocation.state}` : ""}
      </span>
    </div>
  );
}