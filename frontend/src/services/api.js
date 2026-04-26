const API_BASE = "https://communityone-backend.onrender.com/api";

/* ===============================
   CORE FETCH
=============================== */

export async function apiFetch(path, { method = "GET", body, token, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  /* ===============================
     ERROR HANDLING
  =============================== */

  if (!res.ok) {
    let errorMessage = `API error: ${res.status}`;

    try {
      const errData = await res.json();
      errorMessage = errData.error || errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  return res.json();
}

/* ===============================
   HELPERS (🔥 CLEAN DX)
=============================== */

export const api = {
  get: (path, token) =>
    apiFetch(path, { method: "GET", token }),

  post: (path, body, token) =>
    apiFetch(path, { method: "POST", body, token }),

  put: (path, body, token) =>
    apiFetch(path, { method: "PUT", body, token }),

  del: (path, token) =>
    apiFetch(path, { method: "DELETE", token }),
};