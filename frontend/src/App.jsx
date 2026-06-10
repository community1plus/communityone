import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";
import { MapProvider } from "./context/MapContext";
import { SessionProvider } from "./context/sessionContext";
import { IViewSessionProvider } from "./context/IViewSessionContext";
import CommunityOneDashboard from "./pages/CommunityOneDashboard/CommunityOneDashboard";
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
import CommunityPlusModerationPage from "./pages/CommunityPlusModerationPage/CommunityPlusModerationPage";

import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";





function Placeholder({ title, subtitle }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{subtitle || `${title} page coming soon.`}</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading, authLoading } = useAuth();

  if (loading || authLoading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          loginRequired: true,
          returnTo: location.pathname + location.search,
        }}
      />
    );
  }

  return children;
}

function AppProviders() {
  return (
    <GoogleMapsProvider>
      <MapProvider>
        <SessionProvider>        
            <Elements stripe={stripePromise}>
              <Outlet />
            </Elements>
        </SessionProvider>
      </MapProvider>
    </GoogleMapsProvider>
  );
}

/*
  Temporary shared layout.
  For now it reuses CommunityPlusDashboardLayout.
  Next step: refactor CommunityPlusDashboardLayout so it chooses sidebarGroup
  based on location.pathname.
*/
function SharedDashboardLayout() {
  return <CommunityPlusDashboardLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppProviders />}>
        <Route path="/" element={<CommunityPlusLandingPage />} />

        <Route
          path="/communityplus/welcome"
          element={<CommunityPlusSplash />}
        />

    <Route
        path="/communityplus/profile"
        element={
        <ProtectedRoute>
          <CommunityPlusUserProfile />
        </ProtectedRoute>
        }
    />

        <Route element={<SharedDashboardLayout />}>
          <Route path="/communityplus" element={<CommunityPlusDashboardHome />} />

          <Route
            path="/communityplus/iview"
            element={
              <IViewSessionProvider>
                <CommunityPlusIViewPage />
              </IViewSessionProvider>
            }
          />

          <Route path="/communityplus/news" element={<CommunityPlusNewsPage />} />
          <Route path="/communityplus/events" element={<CommunityPlusEventsPage />} />

          <Route
            path="/communityplus/events/create"
            element={
              <ProtectedRoute>
                <CommunityPlusEventCreatePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityplus/yellowpages"
            element={<CommunityPlusYellowPages />}
          />

          
          <Route
            path="/communityone"
            element={<CommunityOneDashboard />}
          />

          <Route path="/communityplus/channels" element={<CommunityPlusChannels />} />
          <Route path="/communityplus/echo" element={<CommunityPlusEchoPage />} />
          <Route path="/communityplus/echo/:dropId" element={<CommunityPlusEchoDropPage />} />
          <Route path="/communityplus/about" element={<CommunityPlusAboutPage />} />
          <Route path="/communityplus/help" element={<Placeholder title="Help" />} />
          <Route
              path="/communityplus/moderation"
              element={
              <ProtectedRoute>
                  <CommunityPlusModerationPage />
              </ProtectedRoute>
              }
          />
          <Route
            path="/communityplus/compose/:mode"
            element={
              <ProtectedRoute>
                <PostComposer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityplus/account"
            element={
              <ProtectedRoute>
                <Placeholder title="Account" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityplus/inbox"
            element={
              <ProtectedRoute>
                <Placeholder title="Inbox" />
              </ProtectedRoute>
            }
          />

          

          <Route
            path="/communityone/ses"
            element={
              <ProtectedRoute>
                <Placeholder title="SES" subtitle="Simple Employment Services" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityone/shs"
            element={
              <ProtectedRoute>
                <Placeholder title="SHS" subtitle="Simple Housing Services" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityone/xchange"
            element={
              <ProtectedRoute>
                <Placeholder title="XChange" subtitle="Broadcast Transactions" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityone/requests"
            element={
              <ProtectedRoute>
                <Placeholder title="Requests" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityone/responses"
            element={
              <ProtectedRoute>
                <Placeholder title="Responses" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityone/transactions"
            element={
              <ProtectedRoute>
                <Placeholder title="Transactions" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/communityone/feature-requests"
            element={
              <ProtectedRoute>
                <Placeholder title="Feature Requests" />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}