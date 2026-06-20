import { useEffect, useRef } from "react";
import { getDistanceMeters } from "../src/utils/distance";

export default function useVoiceAlerts({
  counts,
  markers,
  userLocation,
}) {
  const prevCounts = useRef({});
  const lastSpoken = useRef(0);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const now = Date.now();

    /* =========================
       COOLDOWN (🔥 prevent spam)
    ========================= */

    if (now - lastSpoken.current < 4000) return;

    for (const [type, count] of Object.entries(counts)) {
      const prev = prevCounts.current[type] || 0;

      if (count <= prev) continue;

      const diff = count - prev;

      /* =========================
         FIND CLOSEST MARKER
      ========================= */

      let closest = null;

      if (userLocation && markers?.length) {
        closest = markers
          .filter((m) => m.type === type && m.lat && m.lng)
          .map((m) => ({
            ...m,
            distance: getDistanceMeters(userLocation, {
              lat: m.lat,
              lng: m.lng,
            }),
          }))
          .filter((m) => m.distance != null)
          .sort((a, b) => a.distance - b.distance)[0];
      }

      /* =========================
         BUILD MESSAGE (🔥 SMART)
      ========================= */

      const message = buildMessage(type, diff, closest);

      if (!message) continue;

      speak(message, synth);
      lastSpoken.current = now;

      break; // 🔥 speak ONE message per cycle
    }

    prevCounts.current = counts;
  }, [counts, markers, userLocation]);
}

/* =====================================================
   MESSAGE BUILDER
===================================================== */

function buildMessage(type, diff, closest) {
  const label = getLabel(type);

  /* 🔥 PROXIMITY FIRST */

  if (closest && closest.distance != null) {
    const d = closest.distance;

    if (d < 300) {
      return `${label} reported ${Math.round(d)} meters away`;
    }

    if (d < 1500) {
      return `${label} within ${Math.round(d / 1000)} kilometer`;
    }
  }

  /* 🔥 FALLBACK */

  return `${diff} new ${label}${diff > 1 ? "s" : ""} nearby`;
}

/* =====================================================
   LABELS
===================================================== */

function getLabel(type) {
  switch (type) {
    case "incident":
      return "incident";
    case "alert":
      return "alert";
    case "request":
      return "service request";
    default:
      return type;
  }
}

/* =====================================================
   SPEAK
===================================================== */

function speak(text, synth) {
  if (!synth) return;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  // 🔥 DO NOT cancel aggressively (feels more natural)
  synth.speak(utterance);
}