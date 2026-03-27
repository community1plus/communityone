import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

// ✅ ADD THIS
import { AuthProvider } from "./context/AuthContext";

// ✅ Amplify config (your version is fine)
Amplify.configure({
  ...outputs,
  Auth: {
    ...outputs.auth,
    oauth: {
      ...outputs.auth?.oauth,
      redirectSignIn: outputs.auth?.oauth?.redirect_sign_in_uri,
      redirectSignOut: outputs.auth?.oauth?.redirect_sign_out_uri,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🔥 CRITICAL FIX */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);