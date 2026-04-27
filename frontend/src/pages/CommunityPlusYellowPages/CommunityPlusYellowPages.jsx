import React, { useEffect, useRef, useState, useMemo } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import "./CommunityPlusYellowPages.css";

export default function CommunityPlusYellowPages({ coords, isLoaded }) {
  const API = import.meta.env.VITE_API_URL;

  const fallback = { lat: -37.8136, lng: 144.9631 };

  const [businesses, setBusinesses] = useState([]);
  const [mapCenter, setMapCenter] = useState(fallback);
  const [category, setCategory] = useState("restaurant");

  const [selectedId, setSelectedId] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const debounceRef = useRef(null);
  const lastBoundsRef = useRef(null);
  const cardRefs = useRef({});

  /* ===============================
     📍 SYNC LOCATION (SAFE)
  =============================== */
  useEffect(() => {
    if (coords?.lat && coords?.lng) {
      setMapCenter({ lat: coords.lat, lng: coords.lng });

      if (isLoaded && mapRef.current) {
        const bounds = mapRef.current.getBounds();
        if (bounds) fetchBusinesses(bounds);
      }
    }
  }, [coords, isLoaded]);

  /* ===============================
     🔍 FETCH
  =============================== */
  const fetchBusinesses = async (bounds) => {
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API}/api/businesses?north=${ne.lat()}&south=${sw.lat()}&east=${ne.lng()}&west=${sw.lng()}&category=${category}`
      );

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error(err);
      setError("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     🧠 SMART FETCH (DEBOUNCED)
  =============================== */
  const handleMapIdle = () => {
    if (!isLoaded || !mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const newBounds = {
      north: ne.lat(),
      south: sw.lat(),
      east: ne.lng(),
      west: sw.lng()
    };

    if (lastBoundsRef.current) {
      const prev = lastBoundsRef.current;

      const moved =
        Math.abs(prev.north - newBounds.north) > 0.01 ||
        Math.abs(prev.south - newBounds.south) > 0.01 ||
        Math.abs(prev.east - newBounds.east) > 0.01 ||
        Math.abs(prev.west - newBounds.west) > 0.01;

      if (!moved) return;
    }

    lastBoundsRef.current = newBounds;

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchBusinesses(bounds);
    }, 300);
  };

  /* ===============================
     🔄 INITIAL LOAD
  =============================== */
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) fetchBusinesses(bounds);
    }
  }, [isLoaded]);

  /* ===============================
     🔄 CATEGORY CHANGE
  =============================== */
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) fetchBusinesses(bounds);
    }
  }, [category, isLoaded]);

  /* ===============================
     📌 SELECT BUSINESS
  =============================== */
  const handleSelectBusiness = (biz) => {
    setSelectedId(biz.id);
    setSelectedBusiness(biz);

    if (mapRef.current) {
      mapRef.current.panTo({ lat: biz.lat, lng: biz.lng });
      mapRef.current.setZoom(15);
    }

    setMapCenter({ lat: biz.lat, lng: biz.lng });

    cardRefs.current[biz.id]?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  };

  /* ===============================
     ⚡ MEMO MARKERS
  =============================== */
  const markers = useMemo(() => {
    return businesses.map((biz) => (
      <Marker
        key={biz.id}
        position={{ lat: biz.lat, lng: biz.lng }}
        icon={
          selectedId === biz.id
            ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
        onClick={() => handleSelectBusiness(biz)}
      />
    ));
  }, [businesses, selectedId]);

  /* ===============================
     UI
  =============================== */
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
              ref={(el) => (cardRefs.current[biz.id] = el)}
              className={`business-card ${selectedId === biz.id ? "active" : ""}`}
              onClick={() => handleSelectBusiness(biz)}
            >
              <h3>{biz.name}</h3>
              <p>📍 {biz.address}</p>
              {biz.rating && <p>⭐ {biz.rating}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div className="map-column">
        {!isLoaded ? (
          <div className="map-loading">Loading map...</div>
        ) : (
          <GoogleMap
            center={mapCenter}
            zoom={14}
            onLoad={(map) => (mapRef.current = map)}
            onIdle={handleMapIdle}
            mapContainerClassName="map-container loaded"
          >
            {markers}
          </GoogleMap>
        )}
      </div>

      {/* DETAIL PANEL */}
      {selectedBusiness && (
        <div className="business-detail">
          <div className="detail-header">
            <h2>{selectedBusiness.name}</h2>
            <button onClick={() => setSelectedBusiness(null)}>✕</button>
          </div>

          <div className="detail-body">
            <p>📍 {selectedBusiness.address}</p>
            {selectedBusiness.rating && <p>⭐ {selectedBusiness.rating}</p>}

            <div className="detail-actions">
              <button>Directions</button>
              <button>Save</button>
              <button>Share</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}