import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./CommunityPlusDashboard.css";

const SIDEBAR_SECTIONS = [
  {
    id: "iview",
    title: "iVIEW",
    items: [
      {
        id: "now",
        label: "NOW",
        icon: "⚡",
        path: "/communityplus/compose/now",
      },
      {
        id: "blob",
        label: "BLOB",
        icon: "🧠",
        path: "/communityplus/compose/blob",
      },
      {
        id: "news",
        label: "News",
        icon: "📰",
        path: "/communityplus/compose/news",
      },
      {
        id: "events",
        label: "Events",
        icon: "📅",
        path: "/communityplus/events/create",
      },
      {
        id: "beacon",
        label: "Beacon",
        icon: "📡",
        path: "/communityplus/compose/beacon",
      },
    ],
  },
  {
    id: "platform",
    title: "PLATFORM",
    items: [
      {
        id: "yellowpages",
        label: "Yellow Pages",
        icon: "📒",
        path: "/communityplus/yellowpages",
      },
      {
        id: "channels",
        label: "Channels",
        icon: "📺",
        path: "/communityplus/channels",
      },
      {
        id: "helpdesk",
        label: "Helpdesk",
        icon: "🛠️",
        path: "/communityplus/help",
      },
    ],
  },
];

export default function CommunityPlusDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (!path) return false;

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigate = (path) => {
    if (!path || location.pathname === path) return;
    navigate(path);
  };

  return (
    <div className="app-shell">
      <header className="cp-header">
        <button
          type="button"
          className="cp-logo-button"
          onClick={() => handleNavigate("/communityplus")}
        >
          COMMUNITY+
        </button>

        <nav className="cp-header-nav" aria-label="Main navigation">
          <button
            type="button"
            className={isActive("/communityplus") ? "active" : ""}
            onClick={() => handleNavigate("/communityplus")}
          >
            Home
          </button>

          <button
            type="button"
            className={isActive("/communityplus/profile") ? "active" : ""}
            onClick={() => handleNavigate("/communityplus/profile")}
          >
            Profile
          </button>
        </nav>
      </header>

      <div className="layout-main">
        <aside className="layout-sidebar" aria-label="Community navigation">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.id} className="sidebar-section">
              <div className="sidebar-title">{section.title}</div>

              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-link ${
                    isActive(item.path) ? "active" : ""
                  }`}
                  onClick={() => handleNavigate(item.path)}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  <span>{item.icon}</span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="layout-content">
          <div className="layout-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}