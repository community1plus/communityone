import { Authenticator } from "@aws-amplify/ui-react";
import CommunityPlusLandingPage from "./CommunityPlusLandingPage";
import CommunityPlusDashboard from "./CommunityPlusDashboard";

function App() {
  return (
    <Authenticator>
      {({ user, signOut }) => (
        <>
          {user ? (
            <CommunityPlusDashboard user={user} signOut={signOut} />
          ) : (
            <CommunityPlusLandingPage />
          )}
        </>
      )}
    </Authenticator>
  );
}

export default App;
