// HeaderNav.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { NAVIGATION } from "../../../config/navigation/navigationConfig";

export default function HeaderNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const nav =
    NAVIGATION.find((n) => n.group === "main")?.items || [];

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  return (
    <nav className="header-nav">
      {nav.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${isActive(item.path) ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}