import { useEffect, useState } from "react";

export default function useMarketTicker() {
  const [ticker, setTicker] = useState([]);

  useEffect(() => {
    async function loadTicker() {
      try {
        const res = await fetch("/api/market/ticker");
        const data = await res.json();

        setTicker(data);
      } catch (err) {
        console.error("Ticker load failed:", err);
      }
    }

    loadTicker();

    const interval = setInterval(loadTicker, 60000);

    return () => clearInterval(interval);
  }, []);

  return ticker;
}