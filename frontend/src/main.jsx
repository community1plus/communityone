import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";

import outputs from "./amplify_outputs.json";

import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import { LocationProvider } from "./context/LocationProvider.jsx";

const oauth = outputs.auth?.oauth ?? {};

const redirectSignIn = Array.isArray(oauth.redirect_sign_in_uri)
  ? oauth.redirect_sign_in_uri
  : [oauth.redirect_sign_in_uri].filter(Boolean);

const redirectSignOut = Array.isArray(oauth.redirect_sign_out_uri)
  ? oauth.redirect_sign_out_uri
  : [oauth.redirect_sign_out_uri].filter(Boolean);

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,

      loginWith: {
        email: true,
        oauth: {
          domain: oauth.domain,
          scopes: oauth.scopes ?? ["openid", "email", "profile"],
          redirectSignIn,
          redirectSignOut,
          responseType: oauth.response_type ?? "code",
          providers: oauth.identity_providers ?? [],
        },
      },
    },
  },
});

Hub.listen("auth", ({ payload }) => {
  switch (payload.event) {
    case "signInWithRedirect":
      console.log("🔄 Redirecting to Cognito...");
      break;

    case "signedIn":
      console.log("✅ Signed in via redirect");
      break;

    case "signInWithRedirect_failure":
      console.error("❌ Redirect sign-in failed:", payload.data);
      break;

    default:
      break;
  }
});

function Root() {
  return (
    <AuthProvider>
      <UIProvider>
        <LocationProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocationProvider>
      </UIProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);