import { useMemo, useCallback, useEffect, useRef } from "react";
import { signOut } from "aws-amplify/auth";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { MapProvider, useMap } from "../../context/MapContext";

import useVoiceAlerts from "../../../hooks/useVoiceAlerts";
import useProfileSync from "../../hooks/useProfileSync";

import CommunityPlusHeader from "../../components/Layout/Header/CommunityPlusHeader";
import CommunityPlusSidebar from "../../components/Layout/Sidebar/CommunityPlusSidebar";

import "./CommunityPlusDashboard.css";

/* =====================================================
   INNER APP (🔥 CORE RUNTIME)
===================================================== */

function DashboardInner({ effectiveUser, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { appUser } = useAuth();

  const {
    filteredMarkers,
    userLocation,
    updateUserLocation,
  } = useMap();

  const locationFetchedRef = useRef(false);

  /* =========================
     🔥 PROFILE SYNC
  ========================= */

  useProfileSync();

  /* =========================
     🔒 ONBOARDING ENFORCEMENT
  ========================= */

  useEffect(() => {
    if (!appUser) return;

    const isOnboardingRoute = pathname.startsWith("/profile-setup");

    if (!appUser.hasProfile && !isOnboardingRoute) {
      navigate("/profile-setup", { replace: true });
    }
  }, [appUser, pathname, navigate]);

  /* =========================
     📍 LOCATION (SAFE + ONCE)
  ========================= */

  useEffect(() => {
    if (locationFetchedRef.current) return;
    locationFetchedRef.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("📍 Location denied:", err?.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
      }
    );
  }, [updateUserLocation]);

  /* =========================
     📊 COUNTS
  ========================= */

  const counts = useMemo(() => {
    const map = {};
    for (const m of filteredMarkers) {
      map[m.type] = (map[m.type] || 0) + 1;
    }
    return map;
  }, [filteredMarkers]);

  /* =========================
     🔊 VOICE ALERTS (STABLE)
  ========================= */

  useVoiceAlerts({
    counts,
    markers: filteredMarkers,
    userLocation,
  });

  /* =========================
     📐 LAYOUT CONTROL
  ========================= */

  const isFullWidthRoute = useMemo(() => {
    const FULL_WIDTH_ROUTES = [
      "/profile",
      "/profile-setup", // 🔥 include onboarding
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
     USER RESOLUTION
  ========================= */

  const effectiveUser = useMemo(
    () => appUser?.user || appUser || user,
    [appUser, user]
  );

  /* =========================
     LOGOUT (HARDENED)
  ========================= */

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ global: true });

      // 🔥 clear any local onboarding state
      localStorage.removeItem("onboarding_draft");

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [navigate]);

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        Initialising your workspace...
      </div>
    );
  }

  /* =========================
     PROVIDERS
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