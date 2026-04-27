import { Routes, Route } from "react-router-dom";
import CommunityPlusUserProfile from "../CommunityPlusUserProfile/CommunityPlusUserProfile";

export default function CommunityPlusDashboard() {
  return (
    <div>
      {/* your layout / header / map etc */}

      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/profile" element={<CommunityPlusUserProfile />} />
      </Routes>
    </div>
  );
}