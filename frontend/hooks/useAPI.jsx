import { useMemo } from "react";
import { createAPI } from "../../services/api";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

/* =====================================================
   API HOOK (🔥 CENTRALIZED)
===================================================== */

export default function useAPI() {
  const { token, appUser } = useAuth();
  const ui = useUI();

  /* =========================
     TOKEN GETTER
  ========================= */

  const getToken = () => token;

  /* =========================
     API INSTANCE
  ========================= */

  const api = useMemo(() => {
    return createAPI({
      getToken,
      ui,
    });
  }, [token, ui]);

  /* =========================
     HELPERS (OPTIONAL)
  ========================= */

  const version = appUser?.profile?.version;

  return {
    ...api,

    // 🔥 version-aware patch helper
    patchProfile: (path, body, options = {}) =>
      api.patch(path, body, {
        version,
        ...options,
      }),
  };
}