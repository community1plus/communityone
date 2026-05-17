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

export default function useSearch() {
  /* ======================================================
     STATE
  ====================================================== */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState([]);

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  console.log(
    "REAL useSearch.js LOADED"
  );

  /* ======================================================
     SEARCH
  ====================================================== */

  const search = useCallback(
    async (query) => {
      console.log(
        "SEARCH QUERY:",
        query
      );

      if (!query?.trim()) {
        setResults([]);

        setSuggestions([]);

        setSummary("");

        return;
      }

      try {
        setLoading(true);

        setError(null);

        const data =
          await searchService.hybrid(
            query
          );

        console.log(
          "HYBRID SEARCH RESPONSE:",
          data
        );

        setResults(
          data.results || []
        );

        setSuggestions(
          data.suggestions || []
        );

        setSummary(
          data.summary || ""
        );
      } catch (err) {
        console.error(
          "SEARCH ERROR:",
          err
        );

        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ======================================================
     CLEAR SEARCH
  ====================================================== */

  const clearSearch =
    useCallback(() => {
      setSearchQuery("");

      setResults([]);

      setSuggestions([]);

      setSummary("");

      setError(null);
    }, []);

  /* ======================================================
     RETURN
  ====================================================== */

  return {
    /* QUERY */

    searchQuery,
    setSearchQuery,

    /* RESULTS */

    results,
    setResults,

    /* SUGGESTIONS */

    suggestions,
    setSuggestions,

    /* SUMMARY */

    summary,
    setSummary,

    /* STATE */

    loading,
    error,

    /* ACTIONS */

    search,
    clearSearch,
  };
}