const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "");

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

  const url = buildUrl(path);

  console.log("🌐 API REQUEST:", {
    method,
    url,
    hasToken: Boolean(token),
    body,
  });

  let response;

  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...headers,
      },
      body:
        body !== null && body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  } catch (networkError) {
    console.error("❌ NETWORK ERROR:", networkError);

    throw new Error(
      networkError?.message || "Network request failed"
    );
  }

let data = null;

try {

  data = await response.json();

} catch {

  const text = await response.text();

  console.error(
    "RAW RESPONSE:",
    text
  );

  data = {
    raw: text,
  };

}

  console.log("📥 API RESPONSE:", {
    method,
    url,
    status: response.status,
    ok: response.ok,
    data,
  });

  if (!response.ok) {
    const error = new Error(
      data?.error ||
        data?.message ||
        `API request failed: ${response.status}`
    );

    error.status = response.status;

    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return data;
}

export { buildUrl, API_BASE };