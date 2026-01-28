import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "../components/App.jsx";
import outputs from "../amplify_outputs.json";
import { Amplify } from "aws-amplify";
Amplify.configure(outputs);
import "./theme/theme.css";
import "./components/Dashboard/CommunityPlusDashboard.css";
import "./components/Header/CommunityPlusHeader.css";
import "./components/Sidebar/CommunityPlusSidebar.css";
import "./components/MapToolbar/MapToolbar.css";
import "./components/GoogleStyleSearch/GoogleStyleSearch.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
