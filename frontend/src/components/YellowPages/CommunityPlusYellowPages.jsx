import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  useJsApiLoader
} from "@react-google-maps/api";
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
  const debounceRef = useRef(null);

  // 🔥 FETCH USING BOUNDS
  const fetchBusinesses = (bounds) => {
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const north = ne.lat();
    const south = sw.lat();
    const east = ne.lng();
    const west = sw.lng();

    setLoading(true);
    setError(null);

    fetch(`${API}/api/businesses?north=${north}&south=${south}&east=${east}&west=${west}&category=${category}`)
      .then(res => res.json())
      .then(data => {
        setBusinesses(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load businesses"))
      .finally(() => setLoading(false));
  };

  // 🔥 HANDLE MAP MOVE (debounced)
  const handleMapIdle = () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchBusinesses(bounds);
    }, 300); // debounce
  };

  // 🔥 INITIAL CENTER
  useEffect(() => {
    const lat = coords?.lat ?? fallback.lat;
    const lng = coords?.lng ?? fallback.lng;
    setMapCenter({ lat, lng });
  }, [coords]);

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
            onIdle={handleMapIdle}
            mapContainerClassName="map-container loaded"
          >

            {/* 🔥 CLUSTERING (critical for 10k scale) */}
            <MarkerClusterer>
              {(clusterer) =>
                businesses.map((biz) => (
                  <Marker
                    key={biz.id}
                    position={{ lat: biz.lat, lng: biz.lng }}
                    clusterer={clusterer}
                    onClick={() => {
                      setSelectedId(biz.id);
                      setMapCenter({ lat: biz.lat, lng: biz.lng });
                    }}
                  />
                ))
              }
            </MarkerClusterer>

          </GoogleMap>

        )}

      </div>

    </div>
  );
}