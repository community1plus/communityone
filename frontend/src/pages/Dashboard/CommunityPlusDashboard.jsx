import { useMemo, useCallback, useEffect } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { MapProvider, useMap } from "../../context/MapContext";
import useVoiceAlerts from "../../../hooks
import CommunityPlusHeader from "../../components/Layout/Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../../components/Layout/Sidebar/CommunityPlusSidebar";
import "./CommunityPlusDashboard.css";

/* =====================================================
   INNER APP (uses MapContext)
===================================================== */

function DashboardInner({ effectiveUser, onLogout }) {
  const { pathname } = useLocation();

  const {
    filteredMarkers,
    userLocation,
    updateUserLocation,
  } = useMap();

  /* =========================
     GET USER LOCATION (🔥 ONCE)
  ========================= */

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        console.warn("Location access denied");
      }
    );
  }, [updateUserLocation]);

  /* =========================
     COUNTS (for voice + UI)
  ========================= */

  const counts = useMemo(() => {
    const map = {};
    for (const m of filteredMarkers) {
      map[m.type] = (map[m.type] || 0) + 1;
    }
    return map;
  }, [filteredMarkers]);

  /* =========================
     VOICE ALERTS (🔥 PROXIMITY AWARE)
  ========================= */

  useVoiceAlerts({
    counts,
    markers: filteredMarkers,
    userLocation,
  });

  /* =========================
     LAYOUT CONTROL
  ========================= */

  const isFullWidthRoute = useMemo(() => {
    const FULL_WIDTH_ROUTES = [
      "/profile",
      "/yellowpages",
      "/communityplus",
      "/post",
      "/event",
      "/incident",
      "/beacon",
      "/channels",
      "/helpdesk",
    ];

    return FULL_WIDTH_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
  }, [pathname]);

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="app-shell">
      <CommunityPlusHeader
        user={effectiveUser}
        onLogout={onLogout}
      />

      <div className="layout-main">
        <CommunityPlusSidebar />

        <div
          className={`layout-content ${
            isFullWidthRoute ? "full-width" : ""
          }`}
        >
          <div className="layout-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ROOT DASHBOARD
===================================================== */

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const { appUser, user, loading } = useAuth();

  /* =========================
     USER
  ========================= */

  const effectiveUser = useMemo(
    () => appUser?.user || appUser || user,
    [appUser, user]
  );

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [navigate]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  /* =========================
     PROVIDER WRAP
  ========================= */

  return (
    <MapProvider>
      <DashboardInner
        effectiveUser={effectiveUser}
        onLogout={handleLogout}
      />
    </MapProvider>
  );
}