import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { Amplify } from "aws-amplify";
import config from "./amplify-config.js";

import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(config);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>
);