const API_BASE =
  import.meta.env.VITE_API_BASE ||
  `${import.meta.env.VITE_API_URL}/api`;

function buildUrl(path) {
  if (!API_BASE) {
    throw new Error("Missing VITE_API_BASE or VITE_API_URL");
  }

  const cleanBase = API_BASE.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

export async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    token,
    body,
    headers = {},
  } = options;

  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody = null;

    try {
      errorBody = await response.json();
    } catch {
      errorBody = null;
    }

    const error = new Error(
      errorBody?.error || `API request failed: ${response.status}`
    );

    error.status = response.status;
    error.response = {
      status: response.status,
      data: errorBody,
    };

    throw error;
  }

  return response.json();
}