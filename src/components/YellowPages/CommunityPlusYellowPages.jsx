import React, { useEffect, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import "./CommunityPlusYellowPages.css";

export default function CommunityPlusYellowPages({ coords }) {

  const [businesses, setBusinesses] = useState([]);
  const [mapCenter, setMapCenter] = useState(coords);
  const [category, setCategory] = useState("restaurant");

  const mapContainerStyle = {
    width: "100%",
    height: "100%"
  };

  useEffect(() => {

    if (!coords || !window.google) return;

    // keep map centered on user location when coords change
    setMapCenter(coords);

    const map = new window.google.maps.Map(document.createElement("div"));

    const service = new window.google.maps.places.PlacesService(map);

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

  }, [coords, category]);

  return (
    <div className="yellowpages-layout">

      {/* LEFT SIDE — BUSINESS LIST */}

      <div className="business-list">

        <h2>
          Local Businesses
          <span className="business-count">
            {businesses.length}
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

        {businesses.map(biz => (

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

      {/* RIGHT SIDE — MAP */}

      <div className="business-map">

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={14}
        >

          {businesses.map(biz => (
            <Marker
              key={biz.id}
              position={{
                lat: biz.lat,
                lng: biz.lng
              }}
            />
          ))}

        </GoogleMap>

      </div>

    </div>
  );
}