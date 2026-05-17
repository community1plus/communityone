// =========================================================
// SEARCH SERVICE
// Centralized API communication layer
// =========================================================

import {
  SEARCH_ENDPOINTS,
} from "../config/search";

class SearchService {
  async hybrid(query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...options,
      });

      const response = await fetch(
        `${SEARCH_ENDPOINTS.hybrid}?${params}`
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      return await response.json();
    } catch (error) {
      console.error(
        "HYBRID SEARCH ERROR:",
        error
      );

      return {
        results: [],
        suggestions: [],
        summary: "",
      };
    }
  }

  async suggestions(query) {
    try {
      const response = await fetch(
        `${SEARCH_ENDPOINTS.suggestions}?q=${query}`
      );

      return await response.json();
    } catch (error) {
      console.error(
        "SUGGESTIONS ERROR:",
        error
      );

      return [];
    }
  }

  async trending() {
    try {
      const response = await fetch(
        SEARCH_ENDPOINTS.trending
      );

      return await response.json();
    } catch (error) {
      console.error(
        "TRENDING ERROR:",
        error
      );

      return [];
    }
  }
}

export default new SearchService();