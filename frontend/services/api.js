const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"; // fallback for local dev

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    // 🔥 Catch non-JSON responses (your current crash)
    const contentType = res.headers.get("content-type");

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("⚠️ Non-JSON response:", text);
      throw new Error("Invalid JSON response");
    }

    return res.json();

  } catch (err) {
    console.error("❌ API FETCH ERROR:", err);
    throw err;
  }
}