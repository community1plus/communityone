import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext"; // ✅ NEW

// ✅ DO NOT MODIFY outputs
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,
      loginWith: {
        email: true,
        oauth: {
          domain: outputs.auth.oauth?.domain,
          scopes: outputs.auth.oauth?.scopes ?? [],
          redirectSignIn: outputs.auth.oauth?.redirect_sign_in_uri ?? [],
          redirectSignOut: outputs.auth.oauth?.redirect_sign_out_uri ?? [],
          responseType: outputs.auth.oauth?.response_type ?? "code",
          providers: outputs.auth.oauth?.identity_providers ?? [],
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LocationProvider> {/* 🔥 WRAP HERE */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  </React.StrictMode>
);