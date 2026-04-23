import { NAVIGATION } from "../../../config/navigationConfig";
import { useNavigate, useLocation } from "react-router-dom";

const nav = NAVIGATION.find((n) => n.group === "main");

const navigate = useNavigate();
const location = useLocation();

const isActive = (path) => location.pathname === path;

<nav className="header-nav">

  {nav.items.map((item) => {

    // 🔽 DROPDOWN GROUP
    if (item.children) {
      const isGroupActive = item.children.some((child) =>
        isActive(child.path)
      );

      return (
        <div
          key={item.label}
          className={`nav-group ${isGroupActive ? "active" : ""}`}
        >
          <button className="nav-item">
            {item.label}
          </button>

          <div className="nav-dropdown">
            {item.children.map((child) => (
              <div
                key={child.path}
                className={`nav-dropdown-item ${
                  isActive(child.path) ? "active" : ""
                }`}
                onClick={() => navigate(child.path)}
              >
                {child.label}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 🔹 STANDARD ITEM
    return (
      <button
        key={item.path}
        className={`nav-item ${isActive(item.path) ? "active" : ""}`}
        onClick={() => navigate(item.path)}
      >
        {item.label}
      </button>
    );
  })}

</nav>