import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

/* =========================
   CONTEXTS
========================= */

import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";          // 🔥 NEW
import { LocationProvider } from "./context/LocationProvider.jsx";

/* =========================
   AMPLIFY CONFIG (ISOLATED)
========================= */

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,
      loginWith: {
        email: true,
        oauth: {
          domain: outputs.auth.oauth?.domain,
          scopes: [
            "openid",
            "email",
            "profile",
            "aws.cognito.signin.user.admin",
          ],
          redirectSignIn:
            outputs.auth.oauth?.redirect_sign_in_uri ?? [],
          redirectSignOut:
            outputs.auth.oauth?.redirect_sign_out_uri ?? [],
          responseType:
            outputs.auth.oauth?.response_type ?? "code",
          providers:
            outputs.auth.oauth?.identity_providers ?? [],
        },
      },
    },
  },
});

/* =========================
   ROOT APP WRAPPER
========================= */

function Root() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <UIProvider> {/* 🔥 GLOBAL UX LAYER */}
          <LocationProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LocationProvider>
        </UIProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

/* =========================
   RENDER
========================= */

ReactDOM.createRoot(document.getElementById("root")).render(
  <Root />
);