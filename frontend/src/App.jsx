import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { ProfileProvider } from "./context/ProfileContext";
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";
import { MapProvider } from "./context/MapContext";
import { SessionProvider } from "./context/sessionContext";

import CommunityPlusLandingPage from "./pages/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusAboutPage from "./pages/CommunityPlusAboutPage/CommunityPlusAboutPage";
import CommunityPlusDashboardLayout from "./components/Layout/Dashboard/CommunityPlusDashboardLayout";
import CommunityPlusDashboardHome from "./pages/CommunityPlusDashboardHome/CommunityPlusDashboardHome";
import CommunityPlusYellowPages from "./pages/CommunityPlusYellowPages/CommunityPlusYellowPages";
import CommunityPlusUserProfile from "./pages/CommunityPlusUserProfile/CommunityPlusUserProfile";
import PostComposer from "./components/Layout/Sidebar/Post/PostComposer";

function Placeholder({ title }) {
  return (
    <div className="dashboard-view">
      <h1>{title}</h1>
      <p>{title} page coming soon.</p>
    </div>
  );
}

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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CommunityPlusLandingPage />} />

      <Route element={<DashboardProviders />}>
        <Route path="/communityplus" element={<CommunityPlusDashboardLayout />}>
          <Route index element={<CommunityPlusDashboardHome />} />

          <Route path="about" element={<CommunityPlusAboutPage />} />

          <Route path="profile" element={<CommunityPlusUserProfile />} />

          <Route path="yellowpages" element={<CommunityPlusYellowPages />} />

          <Route path="compose">
            <Route path="/communityplus/compose/:mode" element={<PostComposer />}/>
            <Route path="news" element={<PostComposer mode="news" />} />
            <Route path="blob" element={<PostComposer mode="blob" />} />
            <Route path="event" element={<PostComposer mode="event" />} />
            <Route path="beacon" element={<PostComposer mode="beacon" />} />
          </Route>

          <Route path="channels" element={<Placeholder title="Channels" />} />
          <Route path="account" element={<Placeholder title="Account" />} />
          <Route path="inbox" element={<Placeholder title="Inbox" />} />
          <Route path="help" element={<Placeholder title="Help" />} />

          <Route path="*" element={<Navigate to="/communityplus" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}