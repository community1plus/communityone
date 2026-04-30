// locationService.js

/* ===============================
   CONFIG
=============================== */

const MIN_DISTANCE = 10;        // meters (ignore jitter)
const MAX_ACCURACY = 50;       // ignore bad GPS
const RESOLVE_DISTANCE = 100;  // meters before re-geocode
const SMOOTHING = 0.3;         // movement smoothing

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 2000,
  timeout: 15000, // 🔥 increased (fix TIMEOUT issue)
};

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
    this.isRunning = false;

    this.current = null;
    this.lastResolved = null;

    this.subscribers = new Set();
    this.resolveFn = null;
  }

  /* ===============================
     START / STOP
  =============================== */

  start(resolveLocationFn) {
    if (this.isRunning) return;

    if (!navigator.geolocation) {
      console.error("❌ Geolocation not supported");
      return;
    }

    this.resolveFn = resolveLocationFn;
    this.isRunning = true;

    this.watchId = navigator.geolocation.watchPosition(
      this.handlePosition,
      this.handleError,
      GEO_OPTIONS
    );

    console.log("📡 LocationService started");
  }

  stop() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isRunning = false;
    console.log("🛑 LocationService stopped");
  }

  /* ===============================
     SUBSCRIBE
  =============================== */

  subscribe(callback) {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  emit(event) {
    this.subscribers.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Subscriber error:", err);
      }
    });
  }

  /* ===============================
     POSITION HANDLER
  =============================== */

  handlePosition = async (pos) => {
    try {
      const next = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: Date.now(),
      };

      // 🚫 ignore bad GPS
      if (next.accuracy > MAX_ACCURACY) return;

      // 🚫 ignore jitter
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
          try {
            const location = await this.resolveFn({
              lat: smoothed.lat,
              lng: smoothed.lng,
              accuracy: smoothed.accuracy,
            });

            if (location) {
              this.emit({
                type: "location",
                data: location,
              });
            }
          } catch (err) {
            console.error("❌ resolveLocation failed:", err);

            this.emit({
              type: "error",
              data: err,
            });
          }
        }
      }
    } catch (err) {
      console.error("❌ Position handler error:", err);

      this.emit({
        type: "error",
        data: err,
      });
    }
  };

  /* ===============================
     ERROR HANDLER
  =============================== */

  handleError = (err) => {
    console.error("❌ Geolocation error:", err);

    this.emit({
      type: "error",
      data: err,
    });
  };
}

/* ===============================
   SINGLETON
=============================== */

export const locationService = new LocationService();