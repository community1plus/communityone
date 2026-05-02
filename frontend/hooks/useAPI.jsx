import { useMemo } from "react";
import { useAuth } from "../src/context/AuthContext";
import { useUI } from "../src/context/UIContext";
import { apiFetch } from "../src/services/api";

export default function useAPI() {
  const { token, appUser } = useAuth();

  // Safe fallback if UIContext is not fully wired yet
  let ui = {};
  try {
    ui = useUI();
  } catch {
    ui = {};
  }

  const getToken = () => token;

  const api = useMemo(() => {
    const request = (method) => async (path, body, options = {}) => {
      ui?.startSaving?.();

      try {
        return await apiFetch(path, {
          method,
          body,
          token: getToken(),
          ...options,
        });
      } finally {
        ui?.stopSaving?.();
      }
    };

    return {
      get: async (path, options = {}) => {
        return apiFetch(path, {
          method: "GET",
          token: getToken(),
          ...options,
        });
      },

      post: request("POST"),
      patch: request("PATCH"),
      put: request("PUT"),
      delete: request("DELETE"),
    };
  }, [token, ui]);

  const version = appUser?.profile?.version;

  return {
    ...api,

    patchProfile: (path, body, options = {}) =>
      api.patch(path, body, {
        version,
        ...options,
      }),
  };
}