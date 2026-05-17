// =========================================================
// /src/config/search/searchRankingConfig.js
// =========================================================

export const SEARCH_RANKING = {
  semanticWeight: 0.45,

  keywordWeight: 0.25,

  proximityWeight: 0.15,

  recencyWeight: 0.1,

  engagementWeight: 0.05,
};

export const SEARCH_RANKING_THRESHOLDS = {
  highConfidence: 0.85,

  mediumConfidence: 0.65,

  lowConfidence: 0.45,
};

export const SEARCH_RECENCY_DECAY = {
  enabled: true,

  halfLifeHours: 48,
};