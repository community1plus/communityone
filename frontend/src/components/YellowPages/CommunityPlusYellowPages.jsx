import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import "./CommunityPlusYellowPages.css";

export default function CommunityPlusYellowPages({ coords, isLoaded }) {

  const [businesses, setBusinesses] = useState([]);
  const [mapCenter, setMapCenter] = useState(coords);
  const [category, setCategory] = useState("restaurant");
  const [mapInstance, setMapInstance] = useState(null);
  const [visibleIndex, setVisibleIndex] = useState(0);

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

  // ✅ UPDATED: Fetch from YOUR backend instead of Google Places
  useEffect(() => {

    if (!coords) return;

    setMapCenter(coords);
    setVisibleIndex(0);

    fetch(`http://localhost:5000/api/businesses?lat=${coords.lat}&lng=${coords.lng}&category=${category}`)
      .then(res => res.json())
      .then(data => {
        setBusinesses(data);
      })
      .catch(err => console.error("API error:", err));

  }, [coords, category]);

  return (
    <>
      {/* LEFT PANEL — BUSINESS LIST */}

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

        {/* CATEGORY FILTERS */}

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

        {/* BUSINESS CARDS */}

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

      {/* RIGHT PANEL — MAP */}

      <div className="map-column">

        {!isLoaded ? (
          <div className="map-loading">
            Loading map...
          </div>
        ) : (

          <GoogleMap
            onLoad={(map) => setMapInstance(map)}
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

        )}

      </div>
    </>
  );
}