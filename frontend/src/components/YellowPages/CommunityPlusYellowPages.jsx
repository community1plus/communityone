import React, { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./CommunityPlusYellowPages.css";

export default function CommunityPlusYellowPages({ coords }) {

  const API = import.meta.env.VITE_API_URL;
  const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const fallback = { lat: -37.8136, lng: 144.9631 };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAP_KEY
  });

  const [businesses, setBusinesses] = useState([]);
  const [mapCenter, setMapCenter] = useState(coords || fallback);
  const [category, setCategory] = useState("restaurant");
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);

  // FETCH
  useEffect(() => {

    const lat = coords?.lat ?? fallback.lat;
    const lng = coords?.lng ?? fallback.lng;

    setMapCenter({ lat, lng });
    setLoading(true);
    setError(null);

    fetch(`${API}/api/businesses?lat=${lat}&lng=${lng}&category=${category}`)
      .then(res => res.json())
      .then(data => {

        const safeData = Array.isArray(data) ? data : [];
        setBusinesses(safeData);

        // 🔥 Fit bounds
        if (safeData.length && mapRef.current && window.google) {
          const bounds = new window.google.maps.LatLngBounds();
          safeData.forEach(biz => {
            bounds.extend({ lat: biz.lat, lng: biz.lng });
          });
          mapRef.current.fitBounds(bounds);
        }

      })
      .catch(() => setError("Failed to load businesses"))
      .finally(() => setLoading(false));

  }, [coords, category]);

  return (

    <div className="yellowpages-layout">

      {/* LEFT PANEL */}
      <div className="business-list">

        <h2 className="business-header">
          Local Businesses
          <span className="business-count">{businesses.length}</span>
        </h2>

        {loading && <div className="loading">Loading businesses...</div>}
        {error && <div className="error">{error}</div>}

        <div className="business-filters">
          <button onClick={() => setCategory("restaurant")}>Restaurants</button>
          <button onClick={() => setCategory("cafe")}>Cafes</button>
          <button onClick={() => setCategory("bar")}>Bars</button>
          <button onClick={() => setCategory("store")}>Shops</button>
        </div>

        <div className="business-cards">

          {businesses.map((biz) => (

            <div
              key={biz.id}
              className={`business-card ${selectedId === biz.id ? "active" : ""}`}
              onClick={() => {
                setSelectedId(biz.id);
                setMapCenter({ lat: biz.lat, lng: biz.lng });
              }}
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

      {/* RIGHT PANEL */}
      <div className="map-column">

        {loadError ? (
          <div className="map-loading">Map failed to load</div>
        ) : !isLoaded ? (
          <div className="map-loading">Loading map...</div>
        ) : (

          <GoogleMap
            center={mapCenter}
            zoom={14}
            onLoad={(map) => (mapRef.current = map)}
            mapContainerClassName="map-container loaded"
          >

            {businesses.map((biz) => (

              <Marker
                key={biz.id}
                position={{ lat: biz.lat, lng: biz.lng }}
                onClick={() => {
                  setSelectedId(biz.id);
                  setMapCenter({ lat: biz.lat, lng: biz.lng });
                }}
              />

            ))}

          </GoogleMap>

        )}

      </div>

    </div>
  );
}