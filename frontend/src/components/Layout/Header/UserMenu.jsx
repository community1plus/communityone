import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* ===============================
     CLOSE ON OUTSIDE CLICK
  =============================== */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ===============================
     USERNAME (cleaned)
  =============================== */

  const username = useMemo(() => {
    if (!user) return "Guest";

    // Priority order
    if (user.name) return user.name;

    if (user.username && !user.username.includes("@")) {
      return user.username;
    }

    if (user.email) {
      return user.email.split("@")[0]; // 🔥 key change
    }

    if (user.username) {
      return user.username.split("@")[0];
    }

    return "Guest";
  }, [user]);

  /* ===============================
     INITIALS
  =============================== */

  const initials = useMemo(() => {
    if (!username || username === "Guest") return "G";

    return username
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [username]);

  return (
    <div className="user-block" ref={ref}>
      <span className="username">{username}</span>

      <div className="avatar" onClick={() => setOpen((p) => !p)}>
        {initials}
      </div>

      {open && (
        <div className="dropdown-menu">
          <div
            className="menu-item"
            onClick={() => {
              setOpen(false);
              navigate("/communityplus/profile");
            }}
          >
            Profile
          </div>

          <div
            className="menu-item danger"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Logout
          </div>
        </div>
      )}
    </div>
  );
}