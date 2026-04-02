import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext"; // ✅ NEW

// ✅ DO NOT MODIFY outputs
Amplify.configure(outputs);

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