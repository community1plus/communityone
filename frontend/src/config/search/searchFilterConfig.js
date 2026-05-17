// =========================================================
// SEARCH FILTER CONFIG
// =========================================================

export const SEARCH_FILTERS = {
  categories: [
    "incident",
    "event",
    "business",
    "alert",
    "place",
    "beacon",
    "blob",
  ],

  distance: {
    enabled: true,

    minKm: 1,

    maxKm: 100,
  },

  recency: {
    enabled: true,

    options: [
      "1h",
      "24h",
      "7d",
      "30d",
    ],
  },

  sort: {
    options: [
      "relevance",
      "distance",
      "recent",
      "engagement",
    ],
  },
};