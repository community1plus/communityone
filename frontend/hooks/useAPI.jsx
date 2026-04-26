import { useMemo } from "react";
import { createAPI } from "../src/services/api";

/* =====================================================
   API FETCH (🔥 CORE)
===================================================== */
import { useAuth } from "../src/context
import { useUI } from "../src/context/UIContext";

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