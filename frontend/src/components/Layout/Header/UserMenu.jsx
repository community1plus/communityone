import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";

function cleanName(value = "") {
  return String(value)
    .replace(/^google_/, "")
    .replace(/^facebook_/, "")
    .replace(/[._]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDisplayName(user) {
  if (!user) return "Guest";

  const attrs = user?.attributes || {};

  const rawName =
    user?.name ||
    attrs.name ||
    attrs.given_name ||
    attrs.preferred_username ||
    user?.email?.split("@")[0] ||
    attrs.email?.split("@")[0] ||
    user?.signInDetails?.loginId?.split("@")[0] ||
    user?.username?.split("@")[0] ||
    "Guest";

  return cleanName(rawName);
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const username = useMemo(() => getDisplayName(user), [user]);

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="user-block" ref={ref}>
      <span className="username">{username}</span>

      <button
        type="button"
        className="avatar"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        <img src="/echo.png" alt="" aria-hidden="true" />
      </button>

      {open && (
        <div className="dropdown-menu" role="menu">
          <button
            type="button"
            className="menu-item"
            onClick={() => goTo("/communityplus/profile")}
          >
            Profile
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => goTo("/communityplus/account")}
          >
            Account
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => goTo("/communityplus/inbox")}
          >
            Inbox
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => goTo("/communityplus/help")}
          >
            Help
          </button>

          <div className="menu-divider" />

          <button
            type="button"
            className="menu-item danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}