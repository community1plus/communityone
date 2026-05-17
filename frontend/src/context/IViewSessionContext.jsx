// =========================================================
// IViewSessionContext.jsx
// =========================================================

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   CONTEXT
========================================================= */

const IViewSessionContext =
  createContext(null);

/* =========================================================
   PROVIDER
========================================================= */

export function IViewSessionProvider({
  children,
}) {
  /* ======================================================
     FEED CACHE
  ====================================================== */

  const [
    cachedFeed,
    setCachedFeed,
  ] = useState([]);

  /* ======================================================
     DETAIL
  ====================================================== */

  const [
    selectedPost,
    setSelectedPost,
  ] = useState(null);

  /* ======================================================
     SCROLL
  ====================================================== */

  const scrollPosition =
    useRef(0);

  /* ======================================================
     MEDIA CACHE
  ====================================================== */

  const mediaLoadedMap =
    useRef(new Map());

  /* ======================================================
     API
  ====================================================== */

  const value = useMemo(
    () => ({
      /* FEED */

      cachedFeed,
      setCachedFeed,

      /* DETAIL */

      selectedPost,
      setSelectedPost,

      /* SCROLL */

      scrollPosition,

      /* MEDIA */

      mediaLoadedMap,
    }),
    [cachedFeed, selectedPost]
  );

  return (
    <IViewSessionContext.Provider
      value={value}
    >
      {children}
    </IViewSessionContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useIViewSession() {
  const context = useContext(
    IViewSessionContext
  );

  if (!context) {
    throw new Error(
      "useIViewSession must be used inside IViewSessionProvider"
    );
  }

  return context;
}