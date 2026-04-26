/* =====================================================
   BUILD NESTED PATCH FROM DIRTY FIELDS
===================================================== */

export function buildPatch(dirtyFields) {
  const patch = {};

  Object.entries(dirtyFields).forEach(([path, value]) => {
    const keys = path.split(".");
    let current = patch;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    });
  });

  return patch;
}