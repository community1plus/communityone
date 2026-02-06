import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";
import FeedCard from "../FeedCard/FeedCard";
import PostComposer from "../Sidebar/Post/PostComposer";

import "./CommunityPlusDashboard.css";

export default function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631,
  });

  const [activeView, setActiveView] = useState("dashboard");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {
          fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
              if (data.latitude && data.longitude) {
                setCoords({
                  lat: data.latitude,
                  lng: data.longitude,
                });
              }
            })
            .catch(() => {});
        }
      );
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <CommunityPlusHeader
        user={user}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      <main className="main">

        <CommunityPlusSidebar
          setActiveView={setActiveView}
          onLogout={handleLogout}
        />

        <div className="content-area">

          {/* LEFT FEED COLUMN */}
          <div className="feed-column">
            <div className="feed-header"></div>

            <div className="feed-stack">
              <FeedCard />
              <FeedCard />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          {activeView === "post" && <PostComposer />}

          {activeView === "dashboard" && (
            <div className="map-column">
              {!isLoaded ? (
                <div className="map-loading">Loading map…</div>
              ) : (
                <GoogleMap
                  center={coords}
                  zoom={14}
                  mapContainerClassName="map-container loaded"
                >
                  <Marker position={coords} />
                </GoogleMap>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
