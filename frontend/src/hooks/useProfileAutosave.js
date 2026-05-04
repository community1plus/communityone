import { useEffect, useMemo, useRef, useState } from "react";

function stableStringify(value) {
  return JSON.stringify(value ?? null);
}

function shallowDiff(current = {}, previous = {}) {
  const patch = {};

  Object.keys(current).forEach((key) => {
    if (stableStringify(current[key]) !== stableStringify(previous[key])) {
      patch[key] = current[key];
    }
  });

  return patch;
}

export default function useProfileAutosave({
  values,
  homeLocation,
  patchProfile,
  enabled = true,
  delay = 900,
}) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const lastSavedRef = useRef(null);
  const timerRef = useRef(null);
  const savingRef = useRef(false);

  const profilePayload = useMemo(
    () => ({
      username: values.username || "",
      display_name: values.display_name || "",
      userType: values.userType || "PERSONAL",
      phone: values.phone || "",
      homeLocation: values.homeLocation || homeLocation || null,
      social: values.social || {},
      payment: values.payment || {},
    }),
    [
      values.username,
      values.display_name,
      values.userType,
      values.phone,
      values.homeLocation,
      values.social,
      values.payment,
      homeLocation,
    ]
  );

  useEffect(() => {
    if (!enabled) return;
    if (!profilePayload) return;
    if (savingRef.current) return;

    if (!lastSavedRef.current) {
      lastSavedRef.current = profilePayload;
      return;
    }

    const patch = shallowDiff(profilePayload, lastSavedRef.current);

    if (!Object.keys(patch).length) return;

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      savingRef.current = true;

      try {
        setStatus("saving");
        setError("");

        await patchProfile(patch);

        // Important: store only the frontend payload shape
        lastSavedRef.current = {
          ...lastSavedRef.current,
          ...patch,
        };

        setStatus("saved");
      } catch (err) {
        setStatus("error");
        setError(err?.message || "Autosave failed");
      } finally {
        savingRef.current = false;
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [profilePayload, patchProfile, enabled, delay]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return {
    autosaveStatus: status,
    autosaveError: error,
  };
}