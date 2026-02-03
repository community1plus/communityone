import React, { useState, useEffect } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";
import FeedCard from "../FeedCard/FeedCard";
import "./CommunityPlusDashboard.css";
import PostComposer from "../Sidebar/Post/PostComposer";

export default function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631,
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

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
            });
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
      <CommunityPlusHeader user={user} setActiveView={setActiveView} onLogout={handleLogout} />

      <main className="main">
        <CommunityPlusSidebar setActiveView={setActiveView} onLogout={handleLogout} />

        <div className="content-area">

          <div className="feed-column">
            <div className="feed-header">
              <span className="feed-title">LIVE FEED</span>
            </div>
            <div className="feed-scroll">
              <FeedCard />
            </div>
          </div>
       
          {/* POST COMPOSER MODE */}
          {activeView === "post" && (
              <PostComposer />
         )}

          {activeView === "dashboard" && (
            <div className="map-column">
              <GoogleMap
                center={coords}
                zoom={14}
                onLoad={() => setMapLoaded(true)}
                mapContainerClassName={`map-container ${mapLoaded ? "loaded" : ""}`}
              >
                <Marker position={coords} />
              </GoogleMap>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
