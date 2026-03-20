import { Routes, Route } from "react-router-dom";
import CommunityPlusLandingPage from "./components/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusYellowPages from "./components/CommunityPlusYellowPages/CommunityPlusYellowPages";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CommunityPlusLandingPage />} />
      <Route path="/home" element={<CommunityPlusYellowPages />} />
    </Routes>
  );
}