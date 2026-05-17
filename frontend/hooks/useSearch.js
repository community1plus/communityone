import { useState, useCallback } from "react";

import searchService from "../services/searchService";

import {
  SEARCH_LIMITS,
} from "../config/search";

export default function useSearch() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [suggestions, setSuggestions] =
    useState([]);

  const [summary, setSummary] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  console.log("REAL useSearch LOADED");    
  const search = useCallback(
    async (searchQuery) => {
      if (!searchQuery?.trim()) {
        setResults([]);
        console.log("SEARCH QUERY:", searchQuery);
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const data =
          await searchService.hybrid(
            searchQuery
          );

        setResults(data.results || []);

        setSuggestions(
          data.suggestions || []
        );

        setSummary(data.summary || "");
        console.log(
         "HYBRID SEARCH RESPONSE:",
          data
            );
      } catch (err) {
        console.error(err);

        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    query,
    setQuery,

    results,
    suggestions,
    summary,

    loading,
    error,

    search,
  };
}