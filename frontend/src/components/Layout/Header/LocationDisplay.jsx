import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function buildDisplayLabel({ suburb, city, state }) {
  if (suburb && state) return `${suburb}, ${state}`;
  if (city && state) return `${city}, ${state}`;
  if (suburb) return suburb;
  if (city) return city;
  if (state) return state;

  return "Selected location";
}

const label = buildDisplayLabel({
  suburb,
  city: suburb,
  state,
});

function extractLocationFromPlace(place) {
  const lat = place?.geometry?.location?.lat?.() ?? null;
  const lng = place?.geometry?.location?.lng?.() ?? null;

  const suburb =
    getAddressComponent(place, "locality") ||
    getAddressComponent(place, "postal_town") ||
    getAddressComponent(place, "sublocality") ||
    getAddressComponent(place, "administrative_area_level_2") ||
    place?.name ||
    "Selected location";

  const state =
    getAddressComponent(place, "administrative_area_level_1") || "";

  return {
  lat,
  lng,
  suburb,
  city: suburb,
  state,

  label,
  fullAddress: place?.formatted_address || "",

  type: "manual",
  accuracy: "MANUAL",
  updatedAt: Date.now(),
};
}

export default function LocationDisplay({
  location,
  mode = "auto",
  loading = false,
  error = null,
  onManualSet,
  onAutoSet,
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const isManualMode = mode === "manual";

  const safeLocation = useMemo(
    () =>
      location || {
        suburb: "",
        city: "",
        state: "",
        label: loading ? "Resolving location..." : "Enter location",
        type: mode,
        accuracy: isManualMode ? "MANUAL" : "LEVEL_3",
      },
    [location, loading, mode, isManualMode]
  );

  const status =
    LOCATION_STATUS[safeLocation.accuracy] ||
    LOCATION_STATUS[isManualMode ? "MANUAL" : "LEVEL_3"];

  const displayLabel = useMemo(() => {
    if (loading && !location) return "Resolving location...";
    if (error && !location) return "Enter location";

    return (
      safeLocation.label ||
      [safeLocation.suburb, safeLocation.state].filter(Boolean).join(", ") ||
      "Enter location"
    );
  }, [loading, error, location, safeLocation]);

  const handlePinClick = useCallback(() => {
    if (editing) return;

    if (isManualMode) {
      onAutoSet?.();
      return;
    }

    setEditing(true);
    setInputValue("");
  }, [editing, isManualMode, onAutoSet]);

  const handleManualSubmit = useCallback(
    (nextLocation) => {
      if (!nextLocation) return;

      onManualSet?.(nextLocation);
      setInputValue("");
      setEditing(false);
    },
    [onManualSet]
  );

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
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "name",
          "types",
        ],
      }
    );

    const listener = autocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = autocompleteRef.current.getPlace();

        if (!place) return;

        handleManualSubmit(extractLocationFromPlace(place));
      }
    );

    return () => {
      if (listener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener);
      }

      autocompleteRef.current = null;
    };
  }, [editing, handleManualSubmit]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const value = inputValue.trim();
      if (!value) return;

      handleManualSubmit({
        lat: null,
        lng: null,
        suburb: value,
        city: value,
        state: "",
        label: value,
        type: "manual",
        accuracy: "MANUAL",
        updatedAt: Date.now(),
      });
    },
    [inputValue, handleManualSubmit]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!inputValue.trim()) {
        setEditing(false);
      }
    }, 150);
  }, [inputValue]);

  if (editing) {
    return (
      <form className="location-edit" onSubmit={handleSubmit}>
        <button
          type="button"
          className="location-pin-button location-red"
          title="Use auto location"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setEditing(false);
            setInputValue("");
            onAutoSet?.();
          }}
        >
          ●
        </button>

        <input
          ref={inputRef}
          className="location-input"
          value={inputValue}
          placeholder="Enter location"
          autoComplete="off"
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={handleBlur}
        />
      </form>
    );
  }

  return (
    <div className="location-display" title={error || status.label}>
      <button
        type="button"
        className={`location-pin-button ${status.className}`}
        onClick={handlePinClick}
        title={isManualMode ? "Switch to auto location" : "Switch to manual location"}
        aria-label={
          isManualMode ? "Switch to auto location" : "Switch to manual location"
        }
      >
        ●
      </button>

      <span className="location-text">{displayLabel}</span>
    </div>
  );
}