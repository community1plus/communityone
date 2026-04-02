import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useNavigate, useLocation } from "react-router-dom";

import CommunityPlusHeader from "../../components/Layout/Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../../components/Layout/Sidebar/CommunityPlusSidebar";
import FeedCard from "../../components/FeedCard/FeedCard";
import PostComposer from "../../components/Layout/Sidebar/Post/PostComposer";
import CommunityPlusYellowPages from "../YellowPages/CommunityPlusYellowPages";
import CommunityPlusUserProfile from "../CommunityPlusUserProfile/CommunityPlusUserProfile";
import Onboarding from "../Onboarding/CommunityPlusOnboarding"; // 🔥 NEW

import "./CommunityPlusDashboard.css";

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 NEW

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631,
  });

  // 🔥 CRITICAL: supports AuthGate view injection
  const [activeView, setActiveView] = useState(
    location.state?.view || "dashboard"
  );

  /* ===============================
     🔐 AUTH GUARD
  =============================== */

  useEffect(() => {
    console.log("USER:", user);
    console.log("LOADING:", loading);
  }, [user, loading]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
      } catch {
        navigate("/");
      }
    };

    checkAuth();
  }, []);

  /* ===============================
     📍 VIEW DEBUG (YELLOW PAGES)
  =============================== */

  
  /* ===============================
     📍 GEOLOCATION
  =============================== */

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
     VIEW SWITCHER
  =============================== */

  const renderView = () => {
    switch (activeView) {
      // 🔥 NEW — ONBOARDING INSIDE DASHBOARD
      case "onboarding":
        return <Onboarding setActiveView={setActiveView} />;

      case "profile":
        return <CommunityPlusUserProfile user={user} />;

      case "post":
        return (
          <div className="composer-view">
            <PostComposer setActiveView={setActiveView} />
          </div>
        );

      case "yellowpages":
        console.log("YELLOW PAGES VIEW ACTIVE");
        return (
          <CommunityPlusYellowPages
            coords={coords}
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
                  center={coords}
                  zoom={14}
                  mapContainerClassName="map-container loaded"
                >
                  <Marker position={coords} />
                </GoogleMap>
              )}
            </div>
          </>
        );
    }
  };

  /* ===============================
     LOADING STATE
  =============================== */

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  /* ===============================
     MAIN RENDER
  =============================== */

  return (
    <div className="dashboard-container">
      <CommunityPlusHeader
        user={user}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        coords={coords}
      />

      <main className="main">
        <CommunityPlusSidebar
          setActiveView={setActiveView}
          onLogout={handleLogout}
        />

        <div className="content-area">{renderView()}</div>
      </main>
    </div>
  );
}