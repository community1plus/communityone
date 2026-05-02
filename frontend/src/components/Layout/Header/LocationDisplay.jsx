import { useEffect, useRef, useState } from "react";

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

export default function LocationDisplay({ location, onManualSet }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const safeLocation = location || {
    suburb: "Enter location",
    state: "",
    accuracy: "LEVEL_3",
  };

  const status =
    LOCATION_STATUS[safeLocation.accuracy] || LOCATION_STATUS.LEVEL_3;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = inputValue.trim();
    if (!value) return;

    onManualSet({
      suburb: value,
      state: "",
      accuracy: "MANUAL",
    });

    setInputValue("");
    setEditing(false);
  };

  if (editing) {
    return (
      <form className="location-edit" onSubmit={handleSubmit}>
        <span className="location-pin location-red">●</span>

        <input
          ref={inputRef}
          className="location-input"
          value={inputValue}
          placeholder="Enter location"
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => {
            if (!inputValue.trim()) setEditing(false);
          }}
        />
      </form>
    );
  }

  return (
    <div className="location-display" title={status.label}>
      <button
        type="button"
        className={`location-pin-button ${status.className}`}
        onClick={() => setEditing(true)}
        title="Manually set location"
      >
        ●
      </button>

      <span className="location-text">
        {safeLocation.suburb}
        {safeLocation.state ? `, ${safeLocation.state}` : ""}
      </span>
    </div>
  );
}