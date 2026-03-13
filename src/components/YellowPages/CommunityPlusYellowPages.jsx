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

  useEffect(() => {

    if (!coords || !isLoaded || !mapInstance) return;

    setMapCenter(coords);
    setVisibleIndex(0);

    const service = new window.google.maps.places.PlacesService(mapInstance);

    const request = {
      location: new window.google.maps.LatLng(coords.lat, coords.lng),
      rankBy: window.google.maps.places.RankBy.DISTANCE,
      type: category
    };

    service.nearbySearch(request, (results, status) => {

      if (status === window.google.maps.places.PlacesServiceStatus.OK) {

        const places = results.slice(0, 20).map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          rating: place.rating,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }));

        setBusinesses(places);

      }

    });

  }, [coords, category, isLoaded, mapInstance]);

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


        {/* BUSINESS CARDS WITH SLIDE ANIMATION */}

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