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

function getAddressComponent(place, type) {
  return (
    place?.address_components?.find((component) =>
      component.types.includes(type)
    )?.long_name || ""
  );
}

function extractLocationFromPlace(place) {
  const suburb =
    getAddressComponent(place, "locality") ||
    getAddressComponent(place, "postal_town") ||
    getAddressComponent(place, "sublocality") ||
    getAddressComponent(place, "administrative_area_level_2") ||
    place?.name ||
    "Selected location";

  const state =
    getAddressComponent(place, "administrative_area_level_1") || "";

  const label = [suburb, state].filter(Boolean).join(", ");

  return {
    suburb,
    state,
    label,
    type: "manual",
    accuracy: "MANUAL",
  };
}

export default function LocationDisplay({ location, onManualSet }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const safeLocation = location || {
    suburb: "Enter location",
    state: "",
    label: "Enter location",
    type: "auto",
    accuracy: "LEVEL_3",
  };

  const status =
    LOCATION_STATUS[safeLocation.accuracy] || LOCATION_STATUS.LEVEL_3;

  const isManual = safeLocation.type === "manual";

  const toggleTitle = isManual
    ? "Switch to auto location"
    : "Switch to manual location";

  const displayLabel =
    safeLocation.label ||
    [safeLocation.suburb, safeLocation.state].filter(Boolean).join(", ") ||
    "Enter location";

  useEffect(() => {
    if (!editing || !inputRef.current) return;

    inputRef.current.focus();

    if (!window.google?.maps?.places) {
      console.warn("Google Places library is not loaded.");
      return;
    }

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "au" },
        fields: ["address_components", "formatted_address", "name", "types"],
      }
    );

    const listener = autocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = autocompleteRef.current.getPlace();
        const selectedLocation = extractLocationFromPlace(place);

        onManualSet(selectedLocation);
        setInputValue("");
        setEditing(false);
      }
    );

    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [editing, onManualSet]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = inputValue.trim();
    if (!value) return;

    onManualSet({
      suburb: value,
      state: "",
      label: value,
      type: "manual",
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
          autoComplete="off"
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => {
            setTimeout(() => {
              if (!inputValue.trim()) setEditing(false);
            }, 150);
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
        title={toggleTitle}
      >
        ●
      </button>

      <span className="location-text">{displayLabel}</span>
    </div>
  );
}