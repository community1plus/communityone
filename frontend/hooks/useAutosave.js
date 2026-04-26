import { useEffect, useRef, useCallback } from "react";

/* =====================================================
   AUTOSAVE ENGINE (🔥 HARDENED)
===================================================== */

export default function useAutosave({
  data,
  onSave,
  delay = 600,
  enabled = true,
  isEqual,
}) {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  const latestCallIdRef = useRef(0);

  /* =========================
     COMPARE (OPTIMISED)
  ========================= */

  const isSame = useCallback(
    (a, b) => {
      if (isEqual) return isEqual(a, b);
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    },
    [isEqual]
  );

  /* =========================
     EXECUTE SAVE
  ========================= */

  const runSave = useCallback(
    async (payload, callId) => {
      if (inFlightRef.current) {
        // 🔥 queue latest change instead of dropping it
        pendingRef.current = true;
        return;
      }

      inFlightRef.current = true;

      try {
        const result = await onSave(payload, { callId });

        // ignore stale responses
        if (latestCallIdRef.current !== callId) return;

        lastSavedRef.current = payload;

        return result;

      } catch (err) {
        console.error("❌ Autosave failed:", err);
      } finally {
        inFlightRef.current = false;

        // 🔥 if something changed while saving → run again
        if (pendingRef.current) {
          pendingRef.current = false;

          const newCallId = Date.now();
          latestCallIdRef.current = newCallId;

          runSave(payload, newCallId);
        }
      }
    },
    [onSave]
  );

  /* =========================
     EFFECT
  ========================= */

  useEffect(() => {
    if (!enabled) return;

    if (isSame(data, lastSavedRef.current)) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const callId = Date.now();
    latestCallIdRef.current = callId;

    timeoutRef.current = setTimeout(() => {
      runSave(data, callId);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

  }, [data, enabled, delay, isSame, runSave]);

  /* =========================
     MANUAL FLUSH (OPTIONAL)
  ========================= */

  const flush = useCallback(() => {
    if (!enabled) return;

    const callId = Date.now();
    latestCallIdRef.current = callId;

    runSave(data, callId);
  }, [data, enabled, runSave]);

  return { flush };
}