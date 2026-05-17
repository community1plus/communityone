// =========================================================
// /src/hooks/useSearch.js
// =========================================================

import {
  useState,
  useCallback,
} from "react";

import searchService from "../services/searchService";

import {
  SEARCH_LIMITS,
} from "../config/search";

/* =========================================================
   SEARCH HOOK
========================================================= */

export default function useSearch() {
  console.log(
    "REAL useSearch.js LOADED"
  );

  /* ======================================================
     STATE
  ====================================================== */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [results, setResults] =
    useState([]);

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const [summary, setSummary] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* ======================================================
     SEARCH
  ====================================================== */

  const search = useCallback(
    async (query) => {
      console.log(
        "SEARCH QUERY:",
        query
      );

      /* EMPTY QUERY */

      if (!query?.trim()) {
        setResults([]);

        setSuggestions([]);

        setSummary("");

        return;
      }

      try {
        setLoading(true);

        setError(null);

        /* API REQUEST */

        const data =
          await searchService.hybrid(
            query
          );

        console.log(
          "HYBRID SEARCH RESPONSE:",
          data
        );

        /* RESULTS */

        setResults(
          data?.results || []
        );

        /* SUGGESTIONS */

        setSuggestions(
          data?.suggestions || []
        );

        /* SUMMARY */

        setSummary(
          data?.summary || ""
        );
      } catch (err) {
        console.error(
          "SEARCH ERROR:",
          err
        );

        setError(
          err?.message ||
            "Search failed"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ======================================================
     CLEAR SEARCH
  ====================================================== */

  const clearSearch = () => {
    console.log(
      "CLEAR SEARCH"
    );

    setSearchQuery("");

    setResults([]);

    setSuggestions([]);

    setSummary("");

    setError(null);
  };

  /* ======================================================
     RETURN
  ====================================================== */

  return {
    /* QUERY */

    searchQuery,
    setSearchQuery,

    /* RESULTS */

    results,

    /* AI */

    suggestions,
    summary,

    /* STATE */

    loading,
    error,

    /* ACTIONS */

    search,
    clearSearch,
  };
}