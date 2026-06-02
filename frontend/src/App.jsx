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
import { IViewSessionProvider } from "./context/IViewSessionContext";

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
import CommunityPlusEchoPage from "./pages/CommunityPlusEchoPage/CommunityPlusEchoPage";
import CommunityPlusEchoDropPage from "./pages/CommunityPlusEchoPage/CommunityPlusEchoDropPage";
import CommunityPlusSplash from "./pages/CommunityPlusSplash/CommunityPlusSplash";

import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";

/* =========================================
   COMMUNITY ONE EDGE
========================================= */

import CommunityOneLayout from "./communityone/CommunityOneLayout";
import CommunityOneDashboard from "./communityone/CommunityOneDashboard";
import CommunityOneSES from "./communityone/ses/CommunityOneSES";
import CommunityOneSHS from "./communityone/shs/CommunityOneSHS";
import CommunityOneXChange from "./communityone/xchange/CommunityOneXChange";

/* =========================================
   STRIPE
========================================= */

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

/* =========================================
   PLACEHOLDER
========================================= */

function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>

      <p>{title} page coming soon.</p>
    </div>
  );
}

/* =========================================
   PROTECTED ROUTE
========================================= */

function ProtectedRoute({ children }) {
  const location = useLocation();

  const {
    isAuthenticated,
    loading,
    authLoading,
  } = useAuth();

  const isAuthChecking =
    loading || authLoading;

  if (isAuthChecking) {
    return (
      <div style={{ padding: 40 }}>
        Loading...
      </div>
    );
  }

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

  return children;
}

/* =========================================
   APP PROVIDERS
========================================= */

function AppProviders() {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <SessionProvider>
          <ProfileProvider>
            <Elements stripe={stripePromise}>
              <Outlet />
            </Elements>
          </ProfileProvider>
        </SessionProvider>
      </MapProvider>
    </GoogleMapsProvider>
  );
}

/* =========================================
   APP
========================================= */

export default function App() {
  return (
    <Routes>
      <Route element={<AppProviders />}>
        {/* =========================================
            PUBLIC LANDING
        ========================================== */}

        <Route
          path="/"
          element={<CommunityPlusLandingPage />}
        />

        {/* =========================================
            FIRST LOGIN / PROFILE SETUP
        ========================================== */}

        <Route
          path="/communityplus/welcome"
          element={<CommunityPlusSplash />}
        />

        <Route
          path="/communityplus/profile"
          element={<CommunityPlusUserProfile />}
        />

        {/* =========================================
            COMMUNITY+ CORE
        ========================================== */}

        <Route
          path="/communityplus"
          element={<CommunityPlusDashboardLayout />}
        >
          <Route
            index
            element={<CommunityPlusDashboardHome />}
          />

          <Route
            path="iview"
            element={
              <IViewSessionProvider>
                <CommunityPlusIViewPage />
              </IViewSessionProvider>
            }
          />

          <Route
            path="news"
            element={<CommunityPlusNewsPage />}
          />

          <Route
            path="events"
            element={<CommunityPlusEventsPage />}
          />

          <Route
            path="events/create"
            element={
              <ProtectedRoute>
                <CommunityPlusEventCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="yellowpages"
            element={<CommunityPlusYellowPages />}
          />

          <Route
            path="channels"
            element={<CommunityPlusChannels />}
          />

          <Route
            path="echo"
            element={<CommunityPlusEchoPage />}
          />

          <Route
            path="echo/:dropId"
            element={<CommunityPlusEchoDropPage />}
          />

          <Route
            path="about"
            element={<CommunityPlusAboutPage />}
          />

          <Route
            path="help"
            element={<Placeholder title="Help" />}
          />

          <Route
            path="compose/:mode"
            element={
              <ProtectedRoute>
                <PostComposer />
              </ProtectedRoute>
            }
          />

          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Placeholder title="Account" />
              </ProtectedRoute>
            }
          />

          <Route
            path="inbox"
            element={
              <ProtectedRoute>
                <Placeholder title="Inbox" />
              </ProtectedRoute>
            }
          />

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

        {/* =========================================
            COMMUNITY ONE EDGE SERVICES
        ========================================== */}

        <Route
          path="/communityone"
          element={
            <ProtectedRoute>
              <CommunityOneLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<CommunityOneDashboard />}
          />

          <Route
            path="ses"
            element={<CommunityOneSES />}
          />

          <Route
            path="shs"
            element={<CommunityOneSHS />}
          />

          <Route
            path="xchange"
            element={<CommunityOneXChange />}
          />

          <Route
            path="requests"
            element={<Placeholder title="My Requests" />}
          />

          <Route
            path="responses"
            element={<Placeholder title="My Responses" />}
          />

          <Route
            path="transactions"
            element={<Placeholder title="My Transactions" />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/communityone"
                replace
              />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          ROOT FALLBACK
      ========================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}