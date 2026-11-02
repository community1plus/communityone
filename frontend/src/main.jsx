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

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ProfileProvider } from "./context/ProfileContext";

import { fetchAuthSession } from "aws-amplify/auth";
import { apiFetch } from "./services/api";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

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

console.log("[AUTH HUB] main.jsx listener registered");

Hub.listen("auth", ({ payload }) => {
  console.log("[AUTH HUB] event received:", payload.event);
});

Hub.listen("auth", ({ payload }) => {
  switch (payload.event) {
    case "signInWithRedirect":
      console.log("🔄 Redirecting to Cognito...");
      break;

    case "signedIn":
  console.log("Signed in");

  void (async () => {
    try {
      const session = await fetchAuthSession();

      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        throw new Error("Cognito ID token unavailable");
      }

      await apiFetch("/auth/session-established", {
        method: "POST",
        token: idToken,
      });

      console.log("Backend session established");
    } catch (error) {
      console.error(
        "Failed to establish backend session:",
        error
      );
    }
  })();

  break;
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
    <Elements stripe={stripePromise}>
      <AuthProvider>
        <UIProvider>
          <ProfileProvider>
            <LocationProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </LocationProvider>
          </ProfileProvider>
        </UIProvider>
      </AuthProvider>
    </Elements>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);