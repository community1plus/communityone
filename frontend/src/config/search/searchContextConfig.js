// =========================================================
// /src/config/search/searchContextConfig.js
// =========================================================

export const SEARCH_CONTEXT_CONFIG = {
  includeUserLocation: true,

  includeMapBounds: true,

  includeActiveFilters: true,

  includeSearchHistory: true,

  includeTrendingTopics: true,

  includeNearbySignals: true,

  maxContextItems: 15,
};

export const SEARCH_CONTEXT_PRIORITIES = {
  location: 1.0,

  filters: 0.8,

  history: 0.6,

  trends: 0.5,
};