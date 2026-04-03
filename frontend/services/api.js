const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000";

import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = "https://communityone-backend.onrender.com/api";

export async function apiFetch(path, options = {}) {
  let token = null;

  try {
    const session = await fetchAuthSession();
    token = session.tokens?.idToken?.toString();
  } catch (err) {
    console.warn("No auth session", err);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // 🔥 THIS FIXES 401
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}