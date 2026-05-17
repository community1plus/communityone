// =========================================================
// /src/services/searchService.js
// =========================================================

import {
  SEARCH_ENDPOINTS,
} from "../config/search";

/* =========================================================
   SEARCH SERVICE
========================================================= */

class SearchService {
  /* ======================================================
     HYBRID SEARCH
  ====================================================== */

  async hybrid(query, options = {}) {
    console.log(
      "HYBRID SEARCH REQUEST:",
      query
    );

    try {
      const params =
        new URLSearchParams({
          q: query,
          ...options,
        });

      const response = await fetch(
        `${SEARCH_ENDPOINTS.hybrid}?${params}`
      );

      console.log(
        "HYBRID SEARCH STATUS:",
        response.status
      );

      if (!response.ok) {
        throw new Error(
          `Search request failed (${response.status})`
        );
      }

      const data =
        await response.json();

      console.log(
        "HYBRID SEARCH DATA:",
        data
      );

      return data;
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

  /* ======================================================
     SUGGESTIONS
  ====================================================== */

  async suggestions(query) {
    console.log(
      "SUGGESTIONS REQUEST:",
      query
    );

    try {
      const response = await fetch(
        `${SEARCH_ENDPOINTS.suggestions}?q=${query}`
      );

      if (!response.ok) {
        throw new Error(
          "Suggestions request failed"
        );
      }

      const data =
        await response.json();

      return data;
    } catch (error) {
      console.error(
        "SUGGESTIONS ERROR:",
        error
      );

      return [];
    }
  }

  /* ======================================================
     TRENDING
  ====================================================== */

  async trending() {
    console.log(
      "TRENDING REQUEST"
    );

    try {
      const response = await fetch(
        SEARCH_ENDPOINTS.trending
      );

      if (!response.ok) {
        throw new Error(
          "Trending request failed"
        );
      }

      const data =
        await response.json();

      return data;
    } catch (error) {
      console.error(
        "TRENDING ERROR:",
        error
      );

      return [];
    }
  }
}

/* =========================================================
   EXPORT
========================================================= */

const searchService =
  new SearchService();

export default searchService;