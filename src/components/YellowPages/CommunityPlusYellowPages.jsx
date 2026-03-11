import React, { useState, useEffect } from "react";

export default function CommunityPlusYellowPages({ coords }) {

  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {

    if (!coords) return;

    const fetchBusinesses = async () => {

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json
      ?location=${coords.lat},${coords.lng}
      &radius=2000
      &type=restaurant
      &key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        setBusinesses(data.results || []);

      } catch (err) {
        console.error("Places API error:", err);
      }

    };

    fetchBusinesses();

  }, [coords]);

  return (
    <div className="yellowpages">

      <h2>Local Businesses</h2>

      {businesses.map((biz) => (
        <div key={biz.place_id} className="business-card">

          <h3>{biz.name}</h3>

          <p>{biz.vicinity}</p>

          <p>⭐ {biz.rating ?? "No rating"}</p>

        </div>
      ))}

    </div>
  );
}