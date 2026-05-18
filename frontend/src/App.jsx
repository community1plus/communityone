import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import { ProfileProvider } from "./context/ProfileContext";

import { GoogleMapsProvider } from "./context/GoogleMapsProvider";

import { MapProvider } from "./context/MapContext";

import { SessionProvider } from "./context/sessionContext";

import {
  IViewSessionProvider,
} from "./context/IViewSessionContext";

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";

import CommunityPlusAboutPage from "./pages/CommunityPlusAboutPage/CommunityPlusAboutPage";

import CommunityPlusDashboardLayout from "./components/Layout/Dashboard/CommunityPlusDashboardLayout";

import CommunityPlusDashboardHome from "./pages/CommunityPlusDashboardHome/CommunityPlusDashboardHome";

import CommunityPlusYellowPages from "./pages/CommunityPlusYellowPages/CommunityPlusYellowPages";

import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";

import CommunityPlusIViewPage from "./pages/CommunityPlusIViewPage/CommunityPlusIViewPage";

import CommunityPlusChannels from "./pages/CommunityPlusChannels/CommunityPlusChannels";

import CommunityPlusNewsPage from "./pages/CommunityPlusNewsPage/CommunityPlusNewsPage";

import CommunityPlusEventsPage from "./pages/CommunityPlusEventsPage/CommunityPlusEventsPage";

import CommunityPlusEventCreatePage from "./pages/CommunityPlusEventsPage/CommunityPlusEventCreatePage";

import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";
import CommunityPlusEchoPage from "./pages/CommunityPlusEchoPage/CommunityPlusEchoPage";

import CommunityPlusEchoDropPage from "./pages/CommunityPlusEchoDropPage/CommunityPlusEchoDropPage";

/* =========================================================
   PLACEHOLDER
========================================================= */

function Placeholder({
  title,
}) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>

      <p>
        {title} page coming
        soon.
      </p>
    </div>
  );
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({
  children,
}) {
  const location =
    useLocation();

  const {
    isAuthenticated,
    loading,
    authLoading,
  } = useAuth();

  const isAuthChecking =
    loading || authLoading;

  /* LOADING */

  if (isAuthChecking) {
    return (
      <div
        style={{
          padding: 40,
        }}
      >
        Loading...
      </div>
    );
  }

  /* BLOCK */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          loginRequired: true,

          returnTo:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  /* ALLOW */

  return children;
}

/* =========================================================
   DASHBOARD PROVIDERS
========================================================= */

function DashboardProviders() {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <SessionProvider>
          <ProfileProvider>
            <Outlet />
          </ProfileProvider>
        </SessionProvider>
      </MapProvider>
    </GoogleMapsProvider>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <Routes>
      {/* LANDING */}

      <Route
        path="/"
        element={
          <CommunityPlusLandingPage />
        }
      />

      {/* DASHBOARD */}

      <Route
        element={
          <DashboardProviders />
        }
      >
        <Route
          path="/communityplus"
          element={
            <CommunityPlusDashboardLayout />
          }
        >
          {/* HOME */}

          <Route
            index
            element={
              <CommunityPlusDashboardHome />
            }
          />

          {/* iVIEW */}

          <Route
            path="iview"
            element={
              <IViewSessionProvider>
                <CommunityPlusIViewPage />
              </IViewSessionProvider>
            }
          />

          {/* NEWS */}

          <Route
            path="news"
            element={
              <CommunityPlusNewsPage />
            }
          />

          {/* EVENTS */}

          <Route
            path="events/create"
            element={
              <ProtectedRoute>
                <CommunityPlusEventCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="events"
            element={
              <CommunityPlusEventsPage />
            }
          />

          {/* ABOUT */}

          <Route
            path="about"
            element={
              <CommunityPlusAboutPage />
            }
          />

          {/* YELLOW PAGES */}

          <Route
            path="yellowpages"
            element={
              <CommunityPlusYellowPages />
            }
          />

          {/* CHANNELS */}

          <Route
            path="channels"
            element={
              <CommunityPlusChannels />
            }
          />

          {/* ECHO */}

          <Route
            path="echo"
            element={
              <CommunityPlusEchoPage />
          }
          />

<Route
  path="echo/:dropId"
  element={
    <CommunityPlusEchoDropPage />
  }
/>

          {/* HELP */}

          <Route
            path="help"
            element={
              <Placeholder title="Help" />
            }
          />

          {/* PROFILE */}

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <CommunityPlusUserProfile />
              </ProtectedRoute>
            }
          />

          {/* COMPOSE */}

          <Route
            path="compose/:mode"
            element={
              <ProtectedRoute>
                <PostComposer />
              </ProtectedRoute>
            }
          />

          {/* ACCOUNT */}

          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Placeholder title="Account" />
              </ProtectedRoute>
            }
          />

          {/* INBOX */}

          <Route
            path="inbox"
            element={
              <ProtectedRoute>
                <Placeholder title="Inbox" />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}

          <Route
            path="*"
            element={
              <Navigate
                to="/communityplus"
                replace
              />
            }
          />
        </Route>
      </Route>

      {/* ROOT FALLBACK */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}