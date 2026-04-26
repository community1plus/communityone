const API_BASE = "https://communityone-backend.onrender.com/api";

/* ===============================
   REQUEST TRACKING
=============================== */

const inFlightMap = new Map(); // key → AbortController

/* ===============================
   CORE FETCH (🔥 FINAL)
=============================== */

export async function apiFetch(
  path,
  {
    method = "GET",
    body,
    headers = {},
    token,
    ui,

    // 🔥 CONTROL FLAGS
    silent = false,
    dedupeKey = null,
    version = null, // 🔥 NEW (conflict system)
  } = {}
) {
  const url = `${API_BASE}${path}`;

  let controller;

  /* ===============================
     🔥 DEDUPE (LATEST WINS)
  =============================== */

  if (dedupeKey) {
    const existing = inFlightMap.get(dedupeKey);
    if (existing) {
      existing.abort();
    }

    controller = new AbortController();
    inFlightMap.set(dedupeKey, controller);
  }

  try {
    if (!silent) ui?.startLoading();

    const res = await fetch(url, {
      method,
      signal: controller?.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(version != null && { "x-version": version }), // 🔥 VERSION HEADER
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    /* ===============================
       SAFE PARSE
    =============================== */

    let data = null;
    try {
      data = await res.json();
    } catch {}

    /* ===============================
       ERROR HANDLING (STRUCTURED)
    =============================== */

    if (!res.ok) {
      const error = {
        status: res.status,
        message:
          data?.error ||
          data?.message ||
          `Request failed (${res.status})`,
        data,
      };

      throw error;
    }

    return data;

  } catch (err) {
    /* ===============================
       ABORT (EXPECTED)
    =============================== */

    if (err?.name === "AbortError") {
      if (dedupeKey) {
        console.log("⚡ Cancelled:", dedupeKey);
      }
      return;
    }

    /* ===============================
       NORMALISE ERROR
    =============================== */

    const normalised = {
      status: err?.status || 500,
      message: err?.message || "Network error",
      data: err?.data || null,
    };

    console.error("🔥 API ERROR:", normalised);

    throw normalised;

  } finally {
    if (!silent) ui?.stopLoading();

    /* ===============================
       CLEANUP (SAFE)
    =============================== */

    if (dedupeKey) {
      const current = inFlightMap.get(dedupeKey);

      // 🔥 only delete if it's the same controller
      if (current === controller) {
        inFlightMap.delete(dedupeKey);
      }
    }
  }
}

/* ===============================
   FACTORY (🔥 FINAL DX)
=============================== */

export function createAPI({ getToken, ui }) {
  const base = (method) => async (path, body, options = {}) =>
    apiFetch(path, {
      method,
      body,
      token: getToken?.(),
      ui,
      ...options,
    });

  /* ===============================
     AUTOSAVE (SILENT + DEDUPED)
  =============================== */

  const autosave = (path, body, key = path, options = {}) =>
    apiFetch(path, {
      method: "PATCH",
      body,
      token: getToken?.(),
      ui,
      silent: true,
      dedupeKey: key,
      ...options,
    });

  /* ===============================
     VERSIONED PATCH (🔥 CONFLICT SAFE)
  =============================== */

  const patchWithVersion = (path, body, version, options = {}) =>
    apiFetch(path, {
      method: "PATCH",
      body,
      token: getToken?.(),
      ui,
      version,
      ...options,
    });

  return {
    get: base("GET"),
    post: base("POST"),
    put: base("PUT"),
    patch: base("PATCH"),
    del: base("DELETE"),

    autosave,
    patchWithVersion, // 🔥 NEW
  };
}