import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = "https://communityone-backend.onrender.com/api";

export async function apiFetch(path, options = {}) {
  let token = null;

  /* ===============================
     🔐 GET COGNITO TOKEN
  =============================== */
  try {
    const session = await fetchAuthSession();
    console.log("SESSION:", session); // 🔍 debug
    // Prefer ID token, fallback to access token
    token = session.tokens?.accessToken?.toString();

  } catch (err) {
    console.warn("⚠️ No auth session available:", err);
  }

  console.log("TOKEN:", token); // 🔍 debug

  /* ===============================
     🚀 MAKE REQUEST
  =============================== */
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // 🔥 CRITICAL
      ...(options.headers || {}),
    },
  });

  /* ===============================
     ❌ ERROR HANDLING
  =============================== */
  if (!res.ok) {
    let errorMessage = `API error: ${res.status}`;

    try {
      const errData = await res.json();
      errorMessage = errData.error || errorMessage;
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(errorMessage);
  }

  /* ===============================
     ✅ SUCCESS
  =============================== */
  return res.json();
}