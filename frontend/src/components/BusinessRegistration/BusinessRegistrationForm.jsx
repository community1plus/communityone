import { useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";

import { useGoogleMaps } from "../../context/GoogleMapsProvider";
import Button from "../UI/Button";

import "./BusinessRegistrationForm.css";

const EMPTY_BUSINESS = {
  name: "",
  registration: "",
  website: "",
  description: "",

  location: {
    fullAddress: "",
    lat: null,
    lng: null,
    source: "USER_ENTERED",
  },

  phone: "",
  email: "",

  emailVerified: false,
  phoneVerified: false,
  domainVerified: false,

  googlePlaceId: null,
  osmId: null,

  source: "USER_SUBMITTED",
};

const DEFAULT_CENTER = {
  lat: -37.8136,
  lng: 144.9631,
};

function buildBusinessPayload(business) {
  return {
    ...business,
    source: business.source || "USER_SUBMITTED",
    canonicalStatus: "DRAFT",
    verificationStatus: "PENDING_VERIFICATION",

    location: {
      ...business.location,
      source: business.location?.source || "USER_ENTERED",
    },

    verification: {
      emailVerified: business.emailVerified || false,
      phoneVerified: business.phoneVerified || false,
      domainVerified: business.domainVerified || false,
      ownerVerified: false,
    },

    googlePlaceId: business.googlePlaceId || null,
    osmId: business.osmId || null,

    verifiedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export default function BusinessRegistrationForm({
  initialBusinessName = "",
  accountType = "ORG",
  onCancel,
  onComplete,
}) {
  const { isLoaded } = useGoogleMaps();

  const locationAutoRef = useRef(null);

  const [business, setBusiness] = useState({
    ...EMPTY_BUSINESS,
    name: initialBusinessName || "",
  });

  const [businessSearchTerm, setBusinessSearchTerm] =
    useState(initialBusinessName || "");

  const [searchStatus, setSearchStatus] = useState("idle");
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);

  const title = useMemo(() => {
    return accountType === "MIXED"
      ? "Mixed Business Registration"
      : "Business Registration";
  }, [accountType]);

  const mapCenter = useMemo(() => {
    if (business.location.lat && business.location.lng) {
      return {
        lat: business.location.lat,
        lng: business.location.lng,
      };
    }

    return DEFAULT_CENTER;
  }, [business.location.lat, business.location.lng]);

  const updateBusiness = (field, value) => {
    setBusiness((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocation = (field, value) => {
    setBusiness((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const handleLocationChanged = () => {
    const place = locationAutoRef.current?.getPlace();

    if (!place?.geometry) return;

    const nextLocation = {
      fullAddress: place.formatted_address || place.name || "",
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      source: "GOOGLE_AUTOCOMPLETE",
    };

    setBusiness((prev) => ({
      ...prev,
      location: nextLocation,
    }));
  };

  const handleSearchSources = async () => {
    if (searchStatus === "searching") return;

    setSearchStatus("searching");
    setMatches([]);
    setSelectedMatchId(null);
    setManualEntryMode(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/business/source-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: businessSearchTerm,
            name: businessSearchTerm,
            address: business.location.fullAddress,
            lat: business.location.lat,
            lng: business.location.lng,
            radiusMeters: 1500,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Source check failed");
      }

      const nextMatches = data?.matches || [];

      setMatches(nextMatches);
      setSearchStatus(
        nextMatches.length > 0 ? "matched" : "no-match"
      );
    } catch (err) {
      console.error("Business source search failed:", err);
      setSearchStatus("error");
    }
  };

  const handleSelectMatch = (match) => {
    setSelectedMatchId(match.id);
    setManualEntryMode(false);

    setBusiness((prev) => ({
      ...prev,

      name: match.name || prev.name,
      registration: match.registration || prev.registration,
      website: match.website || prev.website,
      description: match.description || prev.description,

      location: {
        fullAddress:
          match.location?.fullAddress ||
          prev.location.fullAddress ||
          "",
        lat: match.location?.lat ?? prev.location.lat,
        lng: match.location?.lng ?? prev.location.lng,
        source:
          match.location?.source ||
          match.source ||
          "IMPORTED",
      },

      phone: match.phone || prev.phone,
      email: match.email || prev.email,

      emailVerified: Boolean(match.emailVerified),
      phoneVerified: Boolean(match.phoneVerified),
      domainVerified: Boolean(match.domainVerified),

      googlePlaceId: match.googlePlaceId || null,
      osmId: match.osmId || null,

      source: match.source || "IMPORTED",
    }));
  };

  const handleManualEntry = () => {
    setManualEntryMode(true);
    setSelectedMatchId(null);

    setBusiness((prev) => ({
      ...prev,
      name: businessSearchTerm || prev.name,
      source: "USER_SUBMITTED",
      googlePlaceId: null,
      osmId: null,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = buildBusinessPayload(business);

    onComplete?.(payload);
  };

  const canSearchBusiness =
    Boolean(business.location.lat) &&
    Boolean(business.location.lng) &&
    Boolean(businessSearchTerm.trim());

  return (
    <form
      className="business-registration-form"
      onSubmit={handleSubmit}
    >
      <header className="business-registration-header">
        <div>
          <p className="business-registration-eyebrow">
            COMMUNITY ONE
          </p>

          <h2>{title}</h2>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </header>

      <div className="business-registration-grid">
        <aside className="business-registration-source-panel business-map-panel">
          <h3>Business Location</h3>

          <p>
            Start with the location. Community One will search
            nearby sources for matching businesses.
          </p>

          <div className="business-map-box">
            {isLoaded ? (
              <GoogleMap
                mapContainerClassName="business-google-map"
                center={mapCenter}
                zoom={business.location.lat ? 16 : 11}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                {business.location.lat && business.location.lng && (
                  <Marker
                    position={{
                      lat: business.location.lat,
                      lng: business.location.lng,
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="business-map-placeholder">
                Loading map...
              </div>
            )}
          </div>

          <div className="business-source-summary">
            <strong>
              {business.location.fullAddress ||
                "No location selected"}
            </strong>

            <span>
              {business.location.lat && business.location.lng
                ? `${business.location.lat.toFixed(5)}, ${business.location.lng.toFixed(5)}`
                : "Select a location to begin"}
            </span>
          </div>
        </aside>

        <section className="business-registration-details">
          <section className="business-registration-section">
            <h3>1. Choose Location</h3>

            <div className="business-form-grid">
              <label className="business-form-full">
                Business Location
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      locationAutoRef.current = autocomplete;
                    }}
                    onPlaceChanged={handleLocationChanged}
                  >
                    <input
                      value={business.location.fullAddress}
                      onChange={(event) =>
                        updateLocation(
                          "fullAddress",
                          event.target.value
                        )
                      }
                      placeholder="Search address, suburb, or business location"
                      required
                    />
                  </Autocomplete>
                ) : (
                  <input
                    value={business.location.fullAddress}
                    onChange={(event) =>
                      updateLocation(
                        "fullAddress",
                        event.target.value
                      )
                    }
                    placeholder="Loading address search..."
                    required
                  />
                )}
              </label>
            </div>
          </section>

          <section className="business-registration-section">
            <h3>2. Search Business at this Location</h3>

            <div className="business-form-grid">
              <label className="business-form-full">
                Business Name
                <input
                  value={businessSearchTerm}
                  onChange={(event) => {
                    setBusinessSearchTerm(event.target.value);
                    updateBusiness("name", event.target.value);
                  }}
                  placeholder="Example: KFC, pharmacy, cafe, accountant"
                  required
                />
              </label>
            </div>

            <div className="business-registration-actions inline-actions">
              <Button
                type="button"
                onClick={handleSearchSources}
                disabled={
                  !canSearchBusiness ||
                  searchStatus === "searching"
                }
              >
                {searchStatus === "searching"
                  ? "Searching..."
                  : "Search this location"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleManualEntry}
              >
                Manual Entry
              </Button>
            </div>

            {searchStatus === "matched" && (
              <div className="business-registration-hint">
                Select a matching business below, or choose manual entry.
              </div>
            )}

            {searchStatus === "no-match" && (
              <div className="business-registration-hint">
                No matching business was found at this location.
                You can create a new Community One listing.
              </div>
            )}

            {searchStatus === "error" && (
              <div className="business-registration-error">
                Source search failed. You can still continue manually.
              </div>
            )}

            {matches.length > 0 && (
              <div className="business-match-list match-dropdown">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    className={`business-match-card ${
                      selectedMatchId === match.id ? "active" : ""
                    }`}
                    onClick={() => handleSelectMatch(match)}
                  >
                    <strong>{match.name}</strong>

                    <span>
                      {match.location?.fullAddress}
                    </span>

                    <small>
                      {match.source}
                      {match.confidence
                        ? ` · ${Math.round(match.confidence * 100)}% match`
                        : ""}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </section>

          {(selectedMatchId || manualEntryMode) && (
            <>
              <section className="business-registration-section">
                <h3>3. Confirm Business Profile</h3>

                <div className="business-form-grid">
                  <label>
                    Business Name
                    <input
                      value={business.name}
                      onChange={(event) =>
                        updateBusiness(
                          "name",
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Registration / ABN
                    <input
                      value={business.registration}
                      onChange={(event) =>
                        updateBusiness(
                          "registration",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Website
                    <input
                      value={business.website}
                      onChange={(event) =>
                        updateBusiness(
                          "website",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label className="business-form-full">
                    Description
                    <textarea
                      value={business.description}
                      onChange={(event) =>
                        updateBusiness(
                          "description",
                          event.target.value
                        )
                      }
                      rows={4}
                    />
                  </label>
                </div>
              </section>

              <section className="business-registration-section">
                <h3>4. Confirm Address</h3>

                <div className="business-form-grid">
                  <label className="business-form-full">
                    Full Address
                    <input
                      value={business.location.fullAddress}
                      onChange={(event) =>
                        updateLocation(
                          "fullAddress",
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Latitude
                    <input
                      type="number"
                      step="any"
                      value={business.location.lat ?? ""}
                      onChange={(event) =>
                        updateLocation(
                          "lat",
                          event.target.value
                            ? Number(event.target.value)
                            : null
                        )
                      }
                    />
                  </label>

                  <label>
                    Longitude
                    <input
                      type="number"
                      step="any"
                      value={business.location.lng ?? ""}
                      onChange={(event) =>
                        updateLocation(
                          "lng",
                          event.target.value
                            ? Number(event.target.value)
                            : null
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="business-registration-section">
                <h3>5. Contact</h3>

                <div className="business-form-grid">
                  <label>
                    Business Phone
                    <input
                      value={business.phone}
                      onChange={(event) =>
                        updateBusiness(
                          "phone",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Business Email
                    <input
                      type="email"
                      value={business.email}
                      onChange={(event) =>
                        updateBusiness(
                          "email",
                          event.target.value
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="business-registration-section">
                <h3>6. Verification</h3>

                <div className="business-verification-list">
                  <span>
                    Email Verified:{" "}
                    <strong>
                      {business.emailVerified ? "Yes" : "No"}
                    </strong>
                  </span>

                  <span>
                    Phone Verified:{" "}
                    <strong>
                      {business.phoneVerified ? "Yes" : "No"}
                    </strong>
                  </span>

                  <span>
                    Domain Verified:{" "}
                    <strong>
                      {business.domainVerified ? "Yes" : "No"}
                    </strong>
                  </span>
                </div>
              </section>

              <footer className="business-registration-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Import into Profile
                </Button>
              </footer>
            </>
          )}
        </section>
      </div>
    </form>
  );
}