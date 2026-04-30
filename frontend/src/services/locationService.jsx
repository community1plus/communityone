// LocationService.js

/* ===============================
   CONFIG
=============================== */

const MIN_DISTANCE = 10;        // meters (ignore jitter)
const MAX_ACCURACY = 50;       // ignore bad GPS
const RESOLVE_DISTANCE = 100;  // meters before re-geocode
const SMOOTHING = 0.3;         // movement smoothing

/* ===============================
   HELPERS
=============================== */

// Haversine distance (meters)
const getDistance = (a, b) => {
  if (!a || !b) return Infinity;

  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 *
      Math.cos(lat1) *
      Math.cos(lat2);

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// smoothing
const smooth = (prev, next) => {
  if (!prev) return next;

  return {
    lat: prev.lat * (1 - SMOOTHING) + next.lat * SMOOTHING,
    lng: prev.lng * (1 - SMOOTHING) + next.lng * SMOOTHING,
    accuracy: next.accuracy,
    timestamp: next.timestamp,
  };
};

/* ===============================
   SERVICE
=============================== */

class LocationService {
  constructor() {
    this.watchId = null;

    this.current = null;
    this.lastResolved = null;

    this.subscribers = new Set();
    this.resolveFn = null;
  }

  /* ===============================
     INIT
  =============================== */

  start(resolveLocationFn) {
    if (this.watchId) return;

    this.resolveFn = resolveLocationFn;

    this.watchId = navigator.geolocation.watchPosition(
      this.handlePosition,
      this.handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );
  }

  stop() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /* ===============================
     SUBSCRIBE
  =============================== */

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  emit(data) {
    this.subscribers.forEach((cb) => cb(data));
  }

  /* ===============================
     POSITION HANDLER
  =============================== */

  handlePosition = async (pos) => {
    const next = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: Date.now(),
    };

    // 🚫 ignore poor accuracy
    if (next.accuracy > MAX_ACCURACY) return;

    // 🚫 ignore tiny movements
    if (this.current && getDistance(this.current, next) < MIN_DISTANCE) {
      return;
    }

    // 🎯 smooth movement
    const smoothed = smooth(this.current, next);
    this.current = smoothed;

    // 🚀 emit real-time position
    this.emit({
      type: "position",
      data: smoothed,
    });

    // 🧠 resolve only when needed
    if (
      !this.lastResolved ||
      getDistance(this.lastResolved, smoothed) > RESOLVE_DISTANCE
    ) {
      this.lastResolved = smoothed;

      if (this.resolveFn) {
        const location = await this.resolveFn({
          lat: smoothed.lat,
          lng: smoothed.lng,
          accuracy: smoothed.accuracy,
        });

        this.emit({
          type: "location",
          data: location,
        });
      }
    }
  };

  handleError = (err) => {
    console.error("Location error:", err);
  };
}

/* ===============================
   SINGLETON
=============================== */

export const locationService = new LocationService();