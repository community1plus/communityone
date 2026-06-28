import { useMemo } from "react";

import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import { apiFetch } from "../services/api";

export default function useAPI() {
  const { token, user } = useAuth();
  const ui = useUI();

  const startSaving = ui?.startSaving;
  const stopSaving = ui?.stopSaving;

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
      get: async (path, options = {}) =>
        apiFetch(path, {
          method: "GET",
          token,
          ...options,
        }),

      post: request("POST"),
      patch: request("PATCH"),
      put: request("PUT"),
      delete: request("DELETE"),
    };
  }, [token, startSaving, stopSaving]);

  const version = user?.profile?.version;
  

  
  return {
    ...api,

patchProfile: (body, options = {}) =>
  api.patch(
    "/profile",
    body,
    {
      version,
      ...options,
    }
  ),
  };
}