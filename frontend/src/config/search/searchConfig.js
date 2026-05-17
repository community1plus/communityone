// =========================================================
// /src/config/search/searchConfig.js
// =========================================================

export const AI_SEARCH_CONFIG = {
  enabled: true,

  streaming: true,

  semanticSearch: true,

  hybridRetrieval: true,

  aiSuggestions: true,

  aiFollowUps: true,

  maxSuggestions: 5,

  maxFollowUps: 5,

  confidenceThreshold: 0.68,

  enableContextAwareness: true,

  enableGeoAwareness: true,

  enableQueryExpansion: true,

  enableIntentDetection: true,

  enableResultSummaries: true,
};

export const SEARCH_LIMITS = {
  maxResults: 50,

  maxRecentSearches: 10,

  maxSuggestions: 8,

  maxFollowUps: 5,

  debounceMs: 300,

  queryTimeoutMs: 12000,
};

export const SEARCH_ENDPOINTS = {
  hybrid: "/api/search/hybrid",

  suggestions: "/api/search/suggestions",

  semantic: "/api/search/semantic",

  keyword: "/api/search/keyword",

  trending: "/api/search/trending",

  aiSummary: "/api/search/summary",

  embeddings: "/api/search/embeddings",
};

export const SEARCH_BEHAVIOR = {
  autoSearchOnFocus: false,

  autoSearchOnTyping: true,

  persistRecentSearches: true,

  persistFilters: true,

  enableSearchAnalytics: true,

  enableStreamingResults: true,

  enableInfiniteScroll: true,
};