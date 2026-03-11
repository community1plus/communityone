import React, { useEffect, useState, useRef } from "react";

export default function CommunityPlusYellowPages({ coords }) {

  const [businesses, setBusinesses] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {

    if (!coords || !window.google) return;

    const map = new window.google.maps.Map(document.createElement("div"));

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location: new window.google.maps.LatLng(coords.lat, coords.lng),
      radius: 2000,
      type: "restaurant"
    };

    service.nearbySearch(request, (results, status) => {

      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setBusinesses(results);
      } else {
        console.error("Places API error:", status);
      }

    });

  }, [coords]);

  return (
    <div style={{ padding: "24px" }}>

      <h2>Local Businesses</h2>

      {businesses.length === 0 && (
        <p>Loading businesses...</p>
      )}

      {businesses.map((biz) => (
        <div key={biz.place_id} style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "12px",
          border: "1px solid #eee"
        }}>

          <h3>{biz.name}</h3>

          <p>{biz.vicinity}</p>

          <p>⭐ {biz.rating ?? "No rating"}</p>

        </div>
      ))}

    </div>
  );

}