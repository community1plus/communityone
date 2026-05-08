import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";

import { useMap } from "../../context/MapContext";
import "./CommunityPlusYellowPages.css";

const FALLBACK_CENTER = { lat: -37.9063, lng: 145.1806 };

const MOCK_MARKERS = [
  {
    id: "1",
    name: "Local Cafe",
    address: "Wheelers Hill, Victoria",
    lat: -37.9063,
    lng: 145.1806,
    rating: 4.6,
    type: "cafe",
  },
  {
    id: "2",
    name: "Community Grocer",
    address: "Ferntree Gully Road",
    lat: -37.9049,
    lng: 145.1818,
    rating: 4.3,
    type: "store",
  },
];

const DEFAULT_MARKET_TICKER = [
  {
    symbol: "ASX 200",
    label: "Australia",
    price: "—",
    change: "+0.42%",
    direction: "up",
  },
  {
    symbol: "CBA.AX",
    label: "CBA",
    price: "—",
    change: "+0.31%",
    direction: "up",
  },
  {
    symbol: "BHP.AX",
    label: "BHP",
    price: "—",
    change: "-0.22%",
    direction: "down",
  },
  {
    symbol: "AUD/USD",
    label: "AUD/USD",
    price: "—",
    change: "+0.09%",
    direction: "up",
  },
  {
    symbol: "BTC/USD",
    label: "Bitcoin",
    price: "—",
    change: "LIVE",
    direction: "neutral",
  },
];

const TWELVE_DATA_SYMBOLS = ["AAPL", "MSFT", "AUD/USD", "BTC/USD"];

function formatTickerItem(item) {
  const percentChange = Number(item?.percent_change ?? 0);

  const direction =
    percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral";

  return {
    symbol: item?.symbol || "UNKNOWN",
    label: item?.name || item?.symbol || "Market",
    price: item?.close || item?.price || "—",
    change:
      Number.isFinite(percentChange) && item?.percent_change !== undefined
        ? `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(2)}%`
        : "—",
    direction,
  };
}

async function fetchLiveTicker() {
  const apiKey = import.meta.env.VITE_TWELVEDATA_API_KEY;

  if (!apiKey) return [];

  const requests = TWELVE_DATA_SYMBOLS.map(async (symbol) => {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
      symbol
    )}&apikey=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Ticker request failed for ${symbol}`);
    }

    return res.json();
  });

  const results = await Promise.all(requests);

  return results
    .filter((item) => !item?.code && !item?.message)
    .map(formatTickerItem);
}

function MarketTicker({ businessCount }) {
  const [liveTicker, setLiveTicker] = useState([]);
  const [tickerError, setTickerError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTicker() {
      try {
        const data = await fetchLiveTicker();

        if (!cancelled && data.length) {
          setLiveTicker(data);
          setTickerError(false);
        }
      } catch (err) {
        console.warn("Market ticker fallback:", err?.message || err);

        if (!cancelled) {
          setTickerError(true);
        }
      }
    }

    loadTicker();

    const intervalId = window.setInterval(loadTicker, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const tickerItems = useMemo(() => {
    const source = liveTicker.length ? liveTicker : DEFAULT_MARKET_TICKER;

    return [
      ...source,
      {
        symbol: "Businesses",
        label: "Nearby",
        price: businessCount,
        change: tickerError ? "DELAYED" : "LIVE",
        direction: "neutral",
      },
    ];
  }, [businessCount, liveTicker, tickerError]);

  return (
    <section className="yp-stock-ticker" aria-label="Market ticker">
      <div className="yp-stock-track">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span
            className="yp-stock-item"
            key={`${item.symbol}-${item.change}-${index}`}
          >
            <strong>{item.label}</strong>
            <small>{item.price}</small>
            <em className={item.direction}>{item.change}</em>
          </span>
        ))}
      </div>
    </section>
  );
}

export default function CommunityPlusYellowPages() {
  const mapRef = useRef(null);

  const { userLocation, resolvedLocation, setBounds, setSelectedMarkerId } =
    useMap();

  const [selectedId, setSelectedId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoaded = Boolean(window.google?.maps);

  const mapCenter = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return {
        lat: userLocation.lat,
        lng: userLocation.lng,
      };
    }

    return FALLBACK_CENTER;
  }, [userLocation]);

  const businesses = MOCK_MARKERS;

  const handleSelectBusiness = useCallback(
    (biz) => {
      setSelectedId(biz.id);
      setSelectedMarkerId?.(biz.id);

      if (mapRef.current) {
        mapRef.current.panTo({
          lat: biz.lat,
          lng: biz.lng,
        });

        mapRef.current.setZoom(16);
      }
    },
    [setSelectedMarkerId]
  );

  const handleMapIdle = useCallback(() => {
    if (!mapRef.current) return;

    const nextBounds = mapRef.current.getBounds();

    if (nextBounds) {
      setBounds?.(nextBounds);
    }
  }, [setBounds]);

  const markers = useMemo(() => {
    return businesses.map((biz) => (
      <Marker
        key={biz.id}
        position={{ lat: biz.lat, lng: biz.lng }}
        onClick={() => handleSelectBusiness(biz)}
        icon={
          selectedId === biz.id
            ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
      />
    ));
  }, [businesses, selectedId, handleSelectBusiness]);

  return (
    <main className="yellowpages-page">
      <MarketTicker businessCount={businesses.length} />

      <section className="yellowpages-grid">
        <aside className="yellowpages-feed">
          <div className="yp-feed-header">
            <p>
              Discover businesses around{" "}
              {resolvedLocation?.suburb ||
                resolvedLocation?.locality ||
                "your community"}
              .
            </p>

            <div className="yp-feed-actions">
              <span className="yp-count">{businesses.length}</span>

              <button
                type="button"
                className="yp-menuButton"
                aria-label="Business actions"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="yp-dropdownMenu">
                  <button type="button">Add Business</button>
                  <button type="button">Claim Business</button>
                  <button type="button">Release Business</button>
                  <button type="button">Search</button>
                </div>
              )}
            </div>
          </div>

          <div className="business-feed">
            {businesses.map((biz) => (
              <article
                key={biz.id}
                className={`business-card ${
                  selectedId === biz.id ? "active" : ""
                }`}
                onClick={() => handleSelectBusiness(biz)}
              >
                <h3>{biz.name}</h3>
                <p>{biz.address}</p>
                <strong>⭐ {biz.rating}</strong>
              </article>
            ))}
          </div>
        </aside>

        <section className="yellowpages-map">
          {!isLoaded ? (
            <div className="map-loading">Loading map...</div>
          ) : (
            <GoogleMap
              center={mapCenter}
              zoom={15}
              mapContainerClassName="map-container"
              onLoad={(map) => {
                mapRef.current = map;
              }}
              onIdle={handleMapIdle}
            >
              {markers}

              {userLocation?.lat && userLocation?.lng && (
                <Marker
                  position={{
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                  }}
                  icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                />
              )}
            </GoogleMap>
          )}
        </section>
      </section>
    </main>
  );
}