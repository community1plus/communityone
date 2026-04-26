import { useRef, useCallback } from "react";

/* =====================================================
   OPTIMISTIC UPDATE ENGINE (🔥 HARDENED)
===================================================== */

export default function useOptimisticUpdate({
  maxStackSize = 10, // 🔥 prevent unbounded growth
  debug = false,
} = {}) {
  /**
   * key → [{ id, snapshot }]
   */
  const storeRef = useRef(new Map());

  /* =========================
     UTILS
  ========================= */

  const clone = (obj) => {
    if (obj == null) return obj;

    try {
      return structuredClone(obj);
    } catch {
      return JSON.parse(JSON.stringify(obj));
    }
  };

  const generateOpId = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const getStack = (key) => {
    if (!storeRef.current.has(key)) {
      storeRef.current.set(key, []);
    }
    return storeRef.current.get(key);
  };

  const log = (...args) => {
    if (debug && process.env.NODE_ENV !== "production") {
      console.log("[optimistic]", ...args);
    }
  };

  /* =========================
     APPLY OPTIMISTIC
  ========================= */

  const applyOptimistic = useCallback((key, currentState, updater) => {
    if (!key) {
      log("⚠️ Missing key");
      return { nextState: currentState, opId: null };
    }

    const stack = getStack(key);

    const opId = generateOpId();

    const snapshot = clone(currentState);

    stack.push({ id: opId, snapshot });

    // 🔥 prevent memory growth
    if (stack.length > maxStackSize) {
      stack.shift();
    }

    const nextState =
      typeof updater === "function"
        ? updater(currentState)
        : updater;

    log("apply", key, opId);

    return { nextState, opId };
  }, [maxStackSize]);

  /* =========================
     COMMIT (SUCCESS)
  ========================= */

  const commit = useCallback((key, opId) => {
    const stack = storeRef.current.get(key);
    if (!stack) return;

    const nextStack = stack.filter((item) => item.id !== opId);

    if (nextStack.length === 0) {
      storeRef.current.delete(key);
    } else {
      storeRef.current.set(key, nextStack);
    }

    log("commit", key, opId);
  }, []);

  /* =========================
     ROLLBACK (FAILURE)
  ========================= */

  const rollback = useCallback((key, opId) => {
    const stack = storeRef.current.get(key);
    if (!stack || stack.length === 0) return null;

    const index = stack.findIndex((item) => item.id === opId);

    if (index === -1) return null;

    const snapshot = stack[index].snapshot;

    // 🔥 remove this + newer operations
    const remaining = stack.slice(0, index);

    if (remaining.length === 0) {
      storeRef.current.delete(key);
    } else {
      storeRef.current.set(key, remaining);
    }

    log("rollback", key, opId);

    return snapshot;
  }, []);

  /* =========================
     CLEAR ALL
  ========================= */

  const clearAll = useCallback(() => {
    storeRef.current.clear();
    log("clearAll");
  }, []);

  /* =========================
     DEBUG (OPTIONAL)
  ========================= */

  const getState = useCallback(() => {
    return storeRef.current;
  }, []);

  return {
    applyOptimistic,
    commit,
    rollback,
    clearAll,
    getState, // 🔥 useful for debugging
  };
}