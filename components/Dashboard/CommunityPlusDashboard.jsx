import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";
import CommunityPlusContentPage from "../Feed/CommunityPlusContentPage";
import "../src/components/Dashboard/CommunityPlusDashboard.css";

export default function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631
  });

  const [activeView, setActiveView] = useState("dashboard");

  /* -------------------------------
     Geolocation handler
  -------------------------------- */
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
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

  /* -------------------------------
     LOGOUT → Return to landing
  -------------------------------- */
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/"; // go back to landing
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <CommunityPlusHeader
        user={user}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      {/* BODY */}
      <main className="main">
        {/* SIDEBAR */}
        <CommunityPlusSidebar setActiveView={setActiveView} onLogout={handleLogout} />

        {/* CONTENT AREA */}
        <div className="content-area">

          {/* FEED VIEW */}
          {activeView !== "dashboard" && (
            <div className="feed-column">
              <div className="feed-header">
                <span className="feed-title">{activeView}</span>
              </div>

              <div className="feed-scroll">
                <CommunityPlusContentPage />
              </div>
            </div>
          )}

          {/* MAP VIEW */}
          {activeView === "dashboard" && (
            <div className="map-column">
              <div className="map-header">
                <span><b>Live around you</b></span>
                <span className="map-sub">Location-based updates</span>
              </div>

              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                libraries={["places"]}
              >
                <GoogleMap
                  center={coords}
                  zoom={14}
                  mapContainerClassName="map-container"
                >
                  <Marker position={coords} />
                </GoogleMap>
              </LoadScript>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
