import { useMemo, useState } from "react";

import Button from "../UI/Button";

import "./BusinessRegistrationForm.css";

const businessPayload = {
  ...business,

  source: "USER_SUBMITTED",

  canonicalStatus: "DRAFT",

  verificationStatus: "PENDING_VERIFICATION",

  location: {
    ...business.location,
    source: business.location.source || "USER_ENTERED",
  },

  verification: {
    emailVerified: business.emailVerified || false,
    phoneVerified: business.phoneVerified || false,
    domainVerified: business.domainVerified || false,
    ownerVerified: false,
  },

  updatedAt: new Date().toISOString(),
};


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

export default function BusinessRegistrationForm({
  initialBusinessName = "",
  accountType = "ORG",
  onCancel,
  onComplete,
}) {
  const [business, setBusiness] = useState({
    ...EMPTY_BUSINESS,
    name: initialBusinessName,
  });

  const [searchStatus, setSearchStatus] = useState("idle");
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const title = useMemo(() => {
    return accountType === "MIXED"
      ? "Mixed Business Registration"
      : "Business Registration";
  }, [accountType]);

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

  const handleSearchSources = async () => {
    setSearchStatus("searching");

    try {
      /*
        Later:
        - Search Community One DB
        - Search Google
        - Search OSM
      */

      setMatches([]);
      setSearchStatus("no-match");
    } catch (err) {
      console.error("Business source search failed:", err);
      setSearchStatus("error");
    }
  };

  const handleSelectMatch = (match) => {
    setSelectedMatchId(match.id);

    setBusiness((prev) => ({
      ...prev,
      ...match,
      source: match.source || "IMPORTED",
    }));
  };

 const handleSubmit = (event) => {
  event.preventDefault();

  onComplete?.({
    ...business,

    source: "USER_SUBMITTED",

    canonicalStatus: "DRAFT",

    verificationStatus: "PENDING_VERIFICATION",

    location: {
      ...business.location,
      source: business.location.source || "USER_ENTERED",
    },

    verification: {
      emailVerified: business.emailVerified || false,
      phoneVerified: business.phoneVerified || false,
      domainVerified: business.domainVerified || false,
      ownerVerified: false,
    },

    googlePlaceId: null,
    osmId: null,

    verifiedAt: null,
    updatedAt: new Date().toISOString(),
  });
};

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
        <aside className="business-registration-source-panel">
          <h3>Source Check</h3>

          <p>
            Search existing Community One, Google, and OSM records
            before creating a new canonical business profile.
          </p>

          <div className="business-source-summary">
            <strong>{business.name || "Unnamed business"}</strong>

            <span>
              {business.location.fullAddress ||
                "Address not supplied yet"}
            </span>
          </div>

          <Button
            type="button"
            onClick={handleSearchSources}
            disabled={!business.name || searchStatus === "searching"}
          >
            {searchStatus === "searching"
              ? "Searching..."
              : "Verify / Search Sources"}
          </Button>

          {searchStatus === "no-match" && (
            <div className="business-registration-hint">
              No matching business was found. You can create a new
              Community One canonical listing.
            </div>
          )}

          {searchStatus === "error" && (
            <div className="business-registration-error">
              Source search failed. You can still continue manually.
            </div>
          )}

          {matches.length > 0 && (
            <div className="business-match-list">
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
                  <span>{match.location?.fullAddress}</span>
                  <small>{match.source}</small>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="business-registration-details">
          <section className="business-registration-section">
            <h3>Business Profile</h3>

            <div className="business-form-grid">
              <label>
                Business Name
                <input
                  value={business.name}
                  onChange={(event) =>
                    updateBusiness("name", event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Registration / ABN
                <input
                  value={business.registration}
                  onChange={(event) =>
                    updateBusiness("registration", event.target.value)
                  }
                />
              </label>

              <label>
                Website
                <input
                  value={business.website}
                  onChange={(event) =>
                    updateBusiness("website", event.target.value)
                  }
                />
              </label>

              <label className="business-form-full">
                Description
                <textarea
                  value={business.description}
                  onChange={(event) =>
                    updateBusiness("description", event.target.value)
                  }
                  rows={4}
                />
              </label>
            </div>
          </section>

          <section className="business-registration-section">
            <h3>Address</h3>

            <div className="business-form-grid">
              <label className="business-form-full">
                Full Address
                <input
                  value={business.location.fullAddress}
                  onChange={(event) =>
                    updateLocation("fullAddress", event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Latitude
                <input
                  value={business.location.lat || ""}
                  onChange={(event) =>
                    updateLocation("lat", Number(event.target.value))
                  }
                />
              </label>

              <label>
                Longitude
                <input
                  value={business.location.lng || ""}
                  onChange={(event) =>
                    updateLocation("lng", Number(event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          <section className="business-registration-section">
            <h3>Contact</h3>

            <div className="business-form-grid">
              <label>
                Business Phone
                <input
                  value={business.phone}
                  onChange={(event) =>
                    updateBusiness("phone", event.target.value)
                  }
                />
              </label>

              <label>
                Business Email
                <input
                  type="email"
                  value={business.email}
                  onChange={(event) =>
                    updateBusiness("email", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="business-registration-section">
            <h3>Verification</h3>

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
        </section>
      </div>
    </form>
  );
}