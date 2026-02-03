import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";
import FeedCard from "../FeedCard/FeedCard";
import "./CommunityPlusDashboard.css";

export default function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631,
  });

  const [activeView, setActiveView] = useState("dashboard");

  /* -------------------------------
     Geolocation handler
  -------------------------------- */
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

  /* -------------------------------
     LOGOUT → Return to landing
  -------------------------------- */
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
      {/* HEADER */}
      <CommunityPlusHeader
        user={user}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      {/* MAIN AREA */}
      <main className="main">
        {/* FIXED SIDEBAR */}
        <CommunityPlusSidebar
          setActiveView={setActiveView}
          onLogout={handleLogout}
        />

        {/* CONTENT (FEED | MAP) */}
        <div className="content-area">
          {/* FEED ALWAYS VISIBLE */}
          <div className="feed-column">
            <div className="feed-header">
              <span className="feed-title">
               
               { /* activeView === "dashboard" ? "Here" : activeView */} 
               
              </span>
            </div>

            <div className="feed-scroll">
              <FeedCard />
            </div>
          </div>

          {/* MAP ONLY VISIBLE IN DASHBOARD */}
          {activeView === "dashboard" && (
            <div className="map-column">
             
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
