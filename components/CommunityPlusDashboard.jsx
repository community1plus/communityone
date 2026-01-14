import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CommunityPlusContentPage from "./CommunityPlusContentPage";
import CommunityPlusHeader from "./CommunityPlusHeader";
import CommunityPlusSideBar from "./CommunityPlusSideBar";
import "../src/CommunityPlusDashboard.css";

function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({ lat: -37.8136, lng: 144.9631 }); // Melbourne fallback
  const [activeView, setActiveView] = useState("dashboard");

  /* -------------------------------
     Geolocation (browser → IP fallback)
  -------------------------------- */
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
            .catch(() => {
              /* silent fallback */
            });
        }
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------------
     Debug logging (safe)
  -------------------------------- */
  useEffect(() => {
    console.log("Active view:", activeView);
  }, [activeView]);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <CommunityPlusHeader
        user={user}
        signOut={signOut}          // ← this now redirects to landing
        setActiveView={setActiveView}
      />

      {/* BODY */}
      <main className="main">
        {/* SIDEBAR */}
        <CommunityPlusSideBar setActiveView={setActiveView} />

        {/* MAIN CONTENT */}
        <div className="content-area">
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

          {activeView === "posts" && <CommunityPlusContentPage />}

          {/* Future views */}
          {/* {activeView === "events" && <Events />} */}
        </div>
      </main>
    </div>
  );
}

export default CommunityPlusDashboard;
