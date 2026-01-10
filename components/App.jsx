import { withAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "../src/App.css";

import CommunityPlusDashboard from "./CommunityPlusDashboard";

function App({ signOut, user }) {
  return (
    <CommunityPlusDashboard user={user} signOut={signOut} />
  );
}

export default withAuthenticator(App);
              