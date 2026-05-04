import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
/* import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth"; */

import outputs from "./amplify_outputs.json";

/* =========================
   CONTEXTS
========================= */

import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext"; 
import { LocationProvider } from "./context/LocationProvider.jsx";

/* =========================
   NORMALISE CONFIG
========================= */

const oauth = outputs.auth?.oauth ?? {};

const redirectSignIn = Array.isArray(oauth.redirect_sign_in_uri)
  ? oauth.redirect_sign_in_uri
  : [oauth.redirect_sign_in_uri].filter(Boolean);

const redirectSignOut = Array.isArray(oauth.redirect_sign_out_uri)
  ? oauth.redirect_sign_out_uri
  : [oauth.redirect_sign_out_uri].filter(Boolean);

/* =========================
   AMPLIFY CONFIG
========================= */

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: outputs.auth.user_pool_id,
      userPoolClientId: outputs.auth.user_pool_client_id,
      identityPoolId: outputs.auth.identity_pool_id, // ✅ add this
      loginWith: {
        email: true,

        oauth: {
          domain: oauth.domain,
          scopes: [
            "openid",
            "email",
            "profile",
          ],
          redirectSignIn,
          redirectSignOut,
          responseType: oauth.response_type ?? "code",
          providers: oauth.identity_providers ?? [],
        },
      },
    },
  },
});

/* =========================
   🔥 HANDLE OAUTH REDIRECT
========================= */

Hub.listen("auth", async ({ payload }) => {
  switch (payload.event) {
    case "signInWithRedirect":
      console.log("🔄 Redirecting to Cognito...");
      break;

    case "signedIn":
      console.log("✅ Signed in via redirect");

      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();

       
      } catch (err) {
        console.error("❌ Post-login fetch failed:", err);
      }

      break;

    case "signInWithRedirect_failure":
      console.error("❌ Redirect sign-in failed:", payload.data);
      break;

    default:
      break;
  }
});

/* =========================
   ROOT APP WRAPPER
========================= */

function Root() {
  return (
    // ⚠️ Disable StrictMode if debugging auth loops
    // <React.StrictMode>
    <AuthProvider>
      <UIProvider>
        <LocationProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LocationProvider>
      </UIProvider>
    </AuthProvider>
    // </React.StrictMode>
  );
}

/* =========================
   RENDER
========================= */

ReactDOM.createRoot(document.getElementById("root")).render(
  <Root />
);