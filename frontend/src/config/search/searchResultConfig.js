// =========================================================
// SEARCH RESULT CONFIG
// =========================================================

export const SEARCH_RESULT_CONFIG = {
  incident: {
    label: "Incident",
    icon: "🚨",
    color: "danger",
    priority: 10,
  },

  event: {
    label: "Event",
    icon: "📅",
    color: "info",
    priority: 8,
  },

  blob: {
    label: "Blob",
    icon: "🛍️",
    color: "success",
    priority: 6,
  },

  beacon: {
    label: "Beacon",
    icon: "📡",
    color: "warning",
    priority: 7,
  },

  business: {
    label: "Business",
    icon: "🏪",
    color: "success",
    priority: 5,
  },

  user: {
    label: "User",
    icon: "👤",
    color: "neutral",
    priority: 4,
  },

  place: {
    label: "Place",
    icon: "📍",
    color: "info",
    priority: 6,
  },

  alert: {
    label: "Alert",
    icon: "⚠️",
    color: "danger",
    priority: 9,
  },
};

export const SEARCH_RESULT_LAYOUT = {
  compact: "compact",

  comfortable: "comfortable",

  expanded: "expanded",
};

export const SEARCH_RESULT_GROUPING = {
  byType: true,

  byDistance: false,

  byRecency: true,

  byRelevance: true,
};