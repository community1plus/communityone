import { Outlet } from "react-router-dom";
import { useEffect, useRef } from "react";

import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import { useMap } from "../../../context/MapContext";

import "./CommunityPlusDashboardLayout.css";

/* ===============================
CONFIG
=============================== */

const DEFAULT_LOCATION = {
lat: -37.8136, // Melbourne fallback
lng: 144.9631,
accuracy: 1000,
};

export default function CommunityPlusDashboardLayout() {
const { updateUserLocation, hasResolvedLocation } = useMap();

const hasRequestedLocation = useRef(false); // 🔥 prevents double calls

/* ===============================
LOCATION INITIALISATION
=============================== */

useEffect(() => {
if (hasResolvedLocation) return;
if (hasRequestedLocation.current) return;

hasRequestedLocation.current = true;

if (!navigator.geolocation) {
  console.warn("Geolocation not supported → using fallback");
  updateUserLocation(DEFAULT_LOCATION);
  return;
}

navigator.geolocation.getCurrentPosition(
  (pos) => {
    updateUserLocation({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
  },
  (err) => {
    console.warn("⚠️ Geolocation denied → using fallback", err);
    updateUserLocation(DEFAULT_LOCATION);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
  }
);

}, [hasResolvedLocation, updateUserLocation]);

/* ===============================
RENDER
=============================== */

return ( <div className="dashboard-root">

  {/* HEADER */}
  <div className="dashboard-header">
    <CommunityPlusHeader />
  </div>

  {/* BODY */}
  <div className="dashboard-body">

    {/* SIDEBAR */}
    <aside className="dashboard-sidebar">
      <CommunityPlusSidebar />
    </aside>

    {/* CONTENT */}
    <main className="dashboard-content">
      <Outlet />
    </main>

  </div>
</div>


);
}
