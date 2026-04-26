import { createContext, useContext, useState, useCallback } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* =========================
     LOADING CONTROL
  ========================= */

  const startLoading = useCallback(() => {
    setLoadingCount((c) => c + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((c) => Math.max(0, c - 1));
  }, []);

  /* =========================
     SAVING CONTROL
  ========================= */

  const startSaving = useCallback(() => {
    setSaving(true);
    setSaved(false);
  }, []);

  const stopSaving = useCallback(() => {
    setSaving(false);
    setSaved(true);

    // auto hide "Saved"
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }, []);

  return (
    <UIContext.Provider
      value={{
        isLoading: loadingCount > 0,
        startLoading,
        stopLoading,

        saving,
        saved,
        startSaving,
        stopSaving,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}