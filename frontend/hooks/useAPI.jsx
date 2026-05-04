import { useMemo } from "react";

import { useAuth } from "../src/context/AuthContext";
import { useUI } from "../src/context/UIContext";
import { apiFetch } from "../src/services/api";

export default function useAPI() {
  const { token, user } = useAuth();

  let startSaving;
  let stopSaving;

  try {
    const ui = useUI();
    startSaving = ui?.startSaving;
    stopSaving = ui?.stopSaving;
  } catch {
    startSaving = undefined;
    stopSaving = undefined;
  }

  const api = useMemo(() => {
    const request =
      (method) =>
      async (path, body = null, options = {}) => {
        startSaving?.();

        try {
          return await apiFetch(path, {
            method,
            token,
            body,
            ...options,
          });
        } finally {
          stopSaving?.();
        }
      };

    return {
      get: async (path, options = {}) => {
        return apiFetch(path, {
          method: "GET",
          token,
          ...options,
        });
      },

      post: request("POST"),
      patch: request("PATCH"),
      put: request("PUT"),
      delete: request("DELETE"),
    };
  }, [token, startSaving, stopSaving]);

  const version = user?.profile?.version;

  return {
    ...api,

    patchProfile: (path, body, options = {}) =>
      api.patch(path, body, {
        version,
        ...options,
      }),
  };
}