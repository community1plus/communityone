import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./CommunityPlusYellowPages.css";

export default function CommunityPlusYellowPages({ coords }) {

  const API = import.meta.env.VITE_API_URL;
  const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fallback = { lat: -37.8136, lng: 144.9631 };

  // ✅ LOAD GOOGLE MAPS HERE (fixes Amplify issue)
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAP_KEY
  });

  const [businesses, setBusinesses] = useState([]);
  const [mapCenter, setMapCenter] = useState(coords || fallback);
  const [category, setCategory] = useState("restaurant");
  const [visibleIndex, setVisibleIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollDown = () => {
    if (visibleIndex + 2 < businesses.length) {
      setVisibleIndex((prev) => prev + 2);
    }
  };

  const scrollUp = () => {
    if (visibleIndex - 2 >= 0) {
      setVisibleIndex((prev) => prev - 2);
    }
  };

  // ✅ FETCH BUSINESSES (resilient)
  useEffect(() => {

    const lat = coords?.lat ?? fallback.lat;
    const lng = coords?.lng ?? fallback.lng;

    console.log("✅ Fetching with:", lat, lng, category);
    console.log("🗺 MAP KEY:", MAP_KEY);

    setMapCenter({ lat, lng });
    setVisibleIndex(0);
    setLoading(true);
    setError(null);

    fetch(`${API}/api/businesses?lat=${lat}&lng=${lng}&category=${category}`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 BACKEND DATA:", data);
        setBusinesses(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("❌ API error:", err);
        setError("Failed to load businesses");
      })
      .finally(() => setLoading(false));

  }, [coords, category]);

  return (

    <div className="yellowpages-layout">

      {/* ================= LEFT PANEL ================= */}

      <div className="business-list">

        <h2 className="business-header">
          Local Businesses
          <span className="business-count">
            {businesses.length}
          </span>

          <span className="business-arrows">

            <button
              className="arrow-up"
              onClick={scrollUp}
              disabled={visibleIndex === 0}
            >
              ▲
            </button>

            <button
              className="arrow-down"
              onClick={scrollDown}
              disabled={visibleIndex + 2 >= businesses.length}
            >
              ▼
            </button>

          </span>
        </h2>

        {loading && <div className="loading">Loading businesses...</div>}
        {error && <div className="error">{error}</div>}

        <div className="business-filters">

          <button onClick={() => setCategory("restaurant")}>
            Restaurants
          </button>

          <button onClick={() => setCategory("cafe")}>
            Cafes
          </button>

          <button onClick={() => setCategory("bar")}>
            Bars
          </button>

          <button onClick={() => setCategory("store")}>
            Shops
          </button>

        </div>

        <div className="business-cards">

          <div
            className="business-cards-track"
            style={{
              transform: `translateY(-${visibleIndex * 50}%)`
            }}
          >

            {businesses.map((biz) => (

              <div
                key={biz.id}
                className="business-card"
                onClick={() =>
                  setMapCenter({ lat: biz.lat, lng: biz.lng })
                }
              >

                <h3>{biz.name}</h3>

                <p className="business-address">
                  📍 {biz.address}
                </p>

                {biz.rating && (
                  <p className="business-rating">
                    ⭐ {biz.rating}
                  </p>
                )}

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* ================= RIGHT PANEL ================= */}

      <div className="map-column">

        {loadError ? (
          <div className="map-loading">
            ❌ Map failed to load
          </div>
        ) : !isLoaded ? (
          <div className="map-loading">
            Loading map...
          </div>
        ) : mapCenter ? (

          <GoogleMap
            center={mapCenter}
            zoom={14}
            mapContainerClassName="map-container loaded"
          >

            {businesses.map((biz) => (

              <Marker
                key={biz.id}
                position={{
                  lat: biz.lat,
                  lng: biz.lng
                }}
              />

            ))}

          </GoogleMap>

        ) : (
          <div className="map-loading">No location available</div>
        )}

      </div>

    </div>
  );
}