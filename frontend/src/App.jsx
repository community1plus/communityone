import { Routes, Route } from "react-router-dom";
import CommunityPlusLandingPage from "./components/CommunityPlusLandingPage/CommunityPlusLandingPage";
import CommunityPlusYellowPages from "./components/YellowPages/CommunityPlusYellowPages";
import { Amplify } from "./aws-amplify";
import config from "./amplify_outputs.json" assert { type: "json" };

Amplify.configure(config);;
import { useAuthenticator } from "@aws-amplify/ui-react";

const { user } = useAuthenticator();

export default function App() {
  return (
    <Authenticator.Provider>
      <Routes>
        <Route path="/" element={<CommunityPlusLandingPage />} />
        <Route path="/home" element={<CommunityPlusYellowPages />} />
      </Routes>
    </Authenticator.Provider>
  );
}