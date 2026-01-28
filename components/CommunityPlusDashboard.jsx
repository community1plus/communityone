import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

import CommunityPlusHeader from "./CommunityPlusHeader";
import CommunityPlusSideBar from "./CommunityPlusSideBar";
import CommunityPlusContentPage from "./CommunityPlusContentPage";

import "../src/CommunityPlusDashboard.css";

function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631,
  });

  const [activeView, setActiveView] = useState("dashboard");

  /* =====================================================
     GEOLOCATION — Browser → IP fallback
  ===================================================== */
  useEffect(() => {
    let cancelled = false;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) {
            setCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        },
        () => {
          fetch("https://ipapi.co/json/")
            .then((res) => res.json())
            .then((data) => {
              if (!cancelled && data.latitude && data.longitude) {
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

    return () => {
      cancelled = true;
    };
  }, []);

  /* Debug — logs whenever view changes */
  useEffect(() => {
    console.log("Active view:", activeView);
  }, [activeView]);

  /* =====================================================
     UI STRUCTURE
  ===================================================== */
  return (
    <div className="dashboard-container">

      {/* ---------- FIXED HEADER ---------- */}
      <CommunityPlusHeader
        user={user}
        signOut={signOut}
        setActiveView={setActiveView}
      />

      {/* ---------- FULL LAYOUT WRAPPER ---------- */}
      <div className="layout-wrapper">

        {/* ---------- FIXED SIDEBAR ---------- */}
        <CommunityPlusSideBar setActiveView={setActiveView} />

        {/* ---------- SCROLLABLE CONTENT ---------- */}
        <div className="content-area">

          {/* ====== DASHBOARD VIEW (MAP + FEED GRID) ====== */}
          {activeView === "dashboard" && (
            <>
              {/* Left feed column handled by layout CSS */}
              <div className="feed-column">
                <div className="feed-header">
                  <div className="feed-title">Nearby Updates</div>
                  <div className="feed-radius">5km radius</div>
                </div>

                <div className="feed-scroll">
                  {/* TODO: Insert your feed rendering here */}
                  <div className="card">No feed yet</div>
                </div>
              </div>

              {/* Right map column */}
              <div className="map-column">
                <div className="map-header">
                  <span>Local Map</span>
                  <span className="map-sub">Live around you</span>
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
            </>
          )}

          {/* ====== POSTS VIEW ====== */}
          {activeView === "posts" && (
            <div className="feed-column">
              <CommunityPlusContentPage />
            </div>
          )}

          {/* ====== Events, community, etc (future) ====== */}
          {activeView === "events" && (
            <div className="feed-column">
              <div className="feed-header">
                <div className="feed-title">Events</div>
              </div>
              <div className="feed-scroll">
                <div className="card">No events yet</div>
              </div>
            </div>
          )}

          {activeView === "community" && (
            <div className="feed-column">
              <div className="feed-header">
                <div className="feed-title">Community+</div>
              </div>
              <div className="feed-scroll">
                <div className="card">Welcome to Community+</div>
              </div>
            </div>
          )}

          {activeView === "about" && (
            <div className="feed-column">
              <div className="feed-header">
                <div className="feed-title">About</div>
              </div>
              <div className="feed-scroll">
                <div className="card">About this app...</div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CommunityPlusDashboard;
