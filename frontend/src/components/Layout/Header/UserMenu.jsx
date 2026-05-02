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
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [username]);

  const menuItems = [
    { id: "profile", label: "Profile", path: "/communityplus/profile" },
    { id: "account", label: "Account", path: "/communityplus/account" },
    { id: "inbox", label: "Inbox", path: "/communityplus/inbox" },
    { id: "help", label: "Help", path: "/communityplus/help" },
  ];

  const handleNavigate = (path) => {
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
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="menu-item"
              onClick={() => handleNavigate(item.path)}
              role="menuitem"
            >
              {item.label}
            </button>
          ))}

          <div className="menu-divider" />

          <button
            type="button"
            className="menu-item danger"
            onClick={handleLogout}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}