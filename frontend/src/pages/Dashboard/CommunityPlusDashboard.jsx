import React, { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { signOut } from "aws-amplify/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useLocationContext } from "../../context/LocationContext";
import { useAuth } from "../../context/AuthContext";

import CommunityPlusHeader from "../../components/Layout/Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../../components/Layout/Sidebar/CommunityPlusSidebar";
import FeedCard from "../../components/FeedCard/FeedCard";
import PostComposer from "../../components/Layout/Sidebar/Post/PostComposer";
import CommunityPlusYellowPages from "../YellowPages/CommunityPlusYellowPages";
import CommunityPlusUserProfile from "../CommunityPlusUserProfile/CommunityPlusUserProfile";
import Onboarding from "../Onboarding/CommunityPlusOnboarding";

import "./CommunityPlusDashboard.css";

/* 🔥 FIX: prevent LoadScript reload */
const LIBRARIES = ["places"];

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { viewLocation } = useLocationContext();
  const { appUser, loading } = useAuth(); // 🔥 SINGLE SOURCE OF TRUTH

  const [activeView, setActiveView] = useState(
    location.state?.view || "dashboard"
  );

  /* ===============================
     🗺 GOOGLE MAP LOADER
  =============================== */

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES, // 🔥 FIXED
  });

  /* ===============================
     🔓 LOGOUT
  =============================== */

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* ===============================
     📍 LOCATION (SINGLE SOURCE)
  =============================== */

  const mapCenter =
    viewLocation?.lat && viewLocation?.lng
      ? { lat: viewLocation.lat, lng: viewLocation.lng }
      : { lat: -37.8136, lng: 144.9631 };

  /* ===============================
     BLOCK UNTIL USER READY
  =============================== */

  if (loading || !appUser) {
    return <div style={{ padding: 20 }}>Loading user...</div>;
  }

  /* ===============================
     VIEW SWITCHER
  =============================== */

  const renderView = () => {
    switch (activeView) {

      case "onboarding":
        return <Onboarding setActiveView={setActiveView} />;

      case "profile":
        return <CommunityPlusUserProfile />; // 🔥 FIXED

      case "post":
        return (
          <div className="composer-view">
            <PostComposer setActiveView={setActiveView} />
          </div>
        );

      case "yellowpages":
        return (
          <CommunityPlusYellowPages
            coords={mapCenter}
            isLoaded={isLoaded}
          />
        );

      case "dashboard":
      default:
        return (
          <>
            {/* LEFT FEED */}
            <div className="feed-column">
              <div className="feed-header"></div>

              <div className="feed-stack">
                <FeedCard />
                <FeedCard />
              </div>
            </div>

            {/* RIGHT MAP */}
            <div className="map-column">
              {!isLoaded ? (
                <div className="map-loading">Loading map…</div>
              ) : (
                <GoogleMap
                  center={mapCenter}
                  zoom={14}
                  mapContainerClassName="map-container loaded"
                >
                  <Marker position={mapCenter} />
                </GoogleMap>
              )}
            </div>
          </>
        );
    }
  };

  /* ===============================
     MAIN RENDER
  =============================== */

  return (
    <div className="dashboard-container">

      {/* 🔥 HEADER NOW GETS CORRECT USER */}
      <CommunityPlusHeader
        user={appUser}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      <main className="main">

        <CommunityPlusSidebar
          setActiveView={setActiveView}
          onLogout={handleLogout}
        />

        <div
          className={`content-area ${
            activeView === "yellowpages" ? "full-width" : ""
          }`}
        >
          {renderView()}
        </div>

      </main>
    </div>
  );
}