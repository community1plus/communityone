// =========================================================
// /src/hooks/useSearch.js
// =========================================================

import {
  useState,
  useCallback,
  useRef,
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

  /* ======================================================
     METRICS
  ====================================================== */

  const lastSearchRef =
    useRef(null);

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

      /* EMPTY SEARCH */

      if (!query?.trim()) {
        console.log(
          "EMPTY SEARCH"
        );

        setResults([]);

        setSuggestions([]);

        setSummary("");

        return;
      }

      /* SEARCH START */

      const searchStart =
        performance.now();

      lastSearchRef.current =
        query;

      console.log(
        "HYBRID SEARCH REQUEST:",
        query
      );

      try {
        setLoading(true);

        setError(null);

        /* API */

        const data =
          await searchService.hybrid(
            query
          );

        /* SEARCH METRICS */

        const searchTime =
          (
            performance.now() -
            searchStart
          ).toFixed(2);

        console.log(
          "SEARCH TIME:",
          `${searchTime} ms`
        );

        console.log(
          "HYBRID SEARCH RESPONSE:",
          data
        );

        /* RESULTS */

        const safeResults =
          data?.results || [];

        const safeSuggestions =
          data?.suggestions ||
          [];

        const safeSummary =
          data?.summary || "";

        setResults(
          safeResults
        );

        setSuggestions(
          safeSuggestions
        );

        setSummary(
          safeSummary
        );

        /* EMPTY STATE TRACKING */

        if (
          !safeResults.length
        ) {
          console.log(
            "EMPTY SEARCH RESULTS:",
            query
          );
        }

        /* SEARCH SUCCESS */

        console.log(
          "SEARCH SUCCESS:",
          {
            query,
            results:
              safeResults.length,
            suggestions:
              safeSuggestions.length,
          }
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

  const clearSearch =
    useCallback(() => {
      console.log(
        "CLEAR SEARCH"
      );

      /* ABANDONED SEARCH */

      if (
        searchQuery?.trim() &&
        !results?.length
      ) {
        console.log(
          "SEARCH ABANDONED:",
          searchQuery
        );
      }

      setSearchQuery("");

      setResults([]);

      setSuggestions([]);

      setSummary("");

      setError(null);
    }, [
      searchQuery,
      results,
    ]);

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