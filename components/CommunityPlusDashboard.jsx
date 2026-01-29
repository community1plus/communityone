import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CommunityPlusHeader from "./CommunityPlusHeader";
import CommunityPlusSidebar from "./CommunityPlusSideBar";
import CommunityPlusContentPage from "./CommunityPlusContentPage";
import "../src/components/Dashboard/CommunityPlusDashboard.css";

export default function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({
    lat: -37.8136,
    lng: 144.9631,
  });

  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
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
  }, []);

  return (
    <div className="dashboard-container">

      <CommunityPlusHeader setActiveView={setActiveView} />

      <main className="main">
        <CommunityPlusSidebar setActiveView={setActiveView} />

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
        </div>
      </main>
    </div>
  );
}
