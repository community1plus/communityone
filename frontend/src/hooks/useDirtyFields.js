import { useRef, useMemo } from "react";

/* =====================================================
   DIRTY FIELD TRACKER
===================================================== */

export default function useDirtyFields(values) {
  const initialRef = useRef(values);

  const dirtyFields = useMemo(() => {
    const dirty = {};

    const compare = (current, initial, path = "") => {
      Object.keys(current || {}).forEach((key) => {
        const fullPath = path ? `${path}.${key}` : key;

        const currVal = current[key];
        const initVal = initial?.[key];

        if (
          typeof currVal === "object" &&
          currVal !== null &&
          !Array.isArray(currVal)
        ) {
          compare(currVal, initVal, fullPath);
        } else {
          if (JSON.stringify(currVal) !== JSON.stringify(initVal)) {
            dirty[fullPath] = currVal;
          }
        }
      });
    };

    compare(values, initialRef.current);

    return dirty;
  }, [values]);

  const resetDirty = () => {
    initialRef.current = values;
  };

  return { dirtyFields, resetDirty };
}