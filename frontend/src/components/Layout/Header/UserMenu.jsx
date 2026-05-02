import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";

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

  const username = useMemo(() => {
    if (!user) return "Guest";
    if (user.name) return user.name;
    if (user.username && !user.username.includes("@")) return user.username;
    if (user.email) return user.email.split("@")[0];
    if (user.username) return user.username.split("@")[0];
    return "Guest";
  }, [user]);

  const initials = useMemo(() => {
    if (!username || username === "Guest") return "G";

    return username
      .split(/[\s.-]+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [username]);

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
      >
        {initials}
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