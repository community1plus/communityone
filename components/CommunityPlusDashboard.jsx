import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import CommunityPlusContentPage from "./CommunityPlusContentPage";
import CommunityPlusHeader from "./CommunityPlusHeader";
import CommunityPlusSideBar from "./CommunityPlusSideBar";
import CommunityPlusFetchfbPosts from "./CommunityPlusFetchfbPosts";

import "../src/CommunityPlusDashboard.css";

function CommunityPlusDashboard({ user, signOut }) {
  const [coords, setCoords] = useState({ lat: -37.8136, lng: 144.9631 });
  const [activeView, setActiveView] = useState("dashboard"); // default

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
                setCoords({ lat: data.latitude, lng: data.longitude });
              }
            });
        }
      );
    }
  }, []);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <CommunityPlusHeader
        user={user}
        signOut={signOut}
        setActiveView={setActiveView}
      />
      {console.log("Active view:", activeView)}

      {/* BODY */}
      <main className="main">
        {/* SIDEBAR */}
        <CommunityPlusSideBar setActiveView={setActiveView} />

        {/* MAIN CONTENT */}
        <div className="content-area">
          {activeView === "dashboard" && (
            <div className="map-column">
              <LoadScript
                googleMapsApiKey="AIzaSyCPG5QI1XTpFjgcTaDoY_rN5qxR3susJrc"
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

          {activeView === "posts" && (
            <CommunityPlusContentPage />
          )}

          {/* Add more views later */}
          {/* {activeView === "events" && <Events />} */}
        </div>
      </main>
    </div>
  );
}

export default CommunityPlusDashboard;
