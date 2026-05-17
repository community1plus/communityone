// /src/hooks/useSearch.js

import { useState } from "react";
import { SEARCH_ENDPOINTS } from "../config/search";

export default function useSearch() {
  const [results, setResults] = useState([]);

  const search = async (query) => {
    const response = await fetch(
      `${SEARCH_ENDPOINTS.hybrid}?q=${query}`
    );

    const data = await response.json();

    setResults(data.results || []);
  };

  return {
    results,
    search,
  };
}