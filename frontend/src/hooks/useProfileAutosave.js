import { useEffect, useMemo, useRef, useState } from "react";

function shallowDiff(current = {}, previous = {}) {
  const patch = {};

  Object.keys(current).forEach((key) => {
    const currentValue = current[key];
    const previousValue = previous[key];

    if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
      patch[key] = currentValue;
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
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");

  const lastSavedRef = useRef(null);
  const timerRef = useRef(null);

  const profilePayload = useMemo(
    () => ({
      username: values.username,
      display_name: values.display_name,
      userType: values.userType,
      phone: values.phone,
      homeLocation,
      social: values.social,
      payment: values.payment,
    }),
    [values, homeLocation]
  );

  useEffect(() => {
    if (!enabled) return;
    if (!profilePayload) return;

    if (!lastSavedRef.current) {
      lastSavedRef.current = profilePayload;
      return;
    }

    const patch = shallowDiff(profilePayload, lastSavedRef.current);

    if (!Object.keys(patch).length) return;

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        setStatus("saving");
        setError("");

        const savedProfile = await patchProfile(patch);

        lastSavedRef.current = savedProfile || {
          ...lastSavedRef.current,
          ...patch,
        };

        setStatus("saved");
      } catch (err) {
        setStatus("error");
        setError(err?.message || "Autosave failed");
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [profilePayload, patchProfile, enabled, delay]);

  return {
    autosaveStatus: status,
    autosaveError: error,
  };
}