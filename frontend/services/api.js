const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ Invalid JSON response:", text);
      throw new Error("Invalid JSON response");
    }

    if (!response.ok) {
      throw new Error(data?.error || `API error ${response.status}`);
    }

    return data;

  } catch (error) {
    console.error("❌ API FETCH ERROR:", error);
    throw error;
  }
}