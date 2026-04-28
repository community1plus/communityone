import { Outlet } from "react-router-dom";
import { useEffect } from "react";

import CommunityPlusHeader from "../Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../Sidebar/CommunityPlusSidebar";

import { useMap } from "../../../context/MapContext";

import "./CommunityPlusDashboardLayout.css";

export default function CommunityPlusDashboardLayout() {
const { updateUserLocation, hasResolvedLocation } = useMap();

/* ===============================
LOCATION INITIALISATION (🔥 CORE)
=============================== */

useEffect(() => {
if (hasResolvedLocation) return;

if (!navigator.geolocation) {
  console.warn("Geolocation not supported");
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
    console.error("❌ Geolocation error:", err);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
  }
);


}, [hasResolvedLocation, updateUserLocation]);

return ( <div className="dashboard-root">

  {/* ===============================
     HEADER
  =============================== */}
  <div className="dashboard-header">
    <CommunityPlusHeader />
  </div>

  {/* ===============================
     BODY
  =============================== */}
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
