import React, { useMemo, useState, useCallback, useRef } from "react";
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

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "restaurant", label: "Restaurants" },
  { id: "cafe", label: "Cafes" },
  { id: "bar", label: "Bars" },
  { id: "store", label: "Shops" },
];

const MARKET_TICKER = [
  {
    symbol: "ASX 200",
    label: "Australia",
    value: "+0.42%",
    direction: "up",
  },
  {
    symbol: "Retail",
    label: "Local sector",
    value: "+0.18%",
    direction: "up",
  },
  {
    symbol: "Hospitality",
    label: "Local sector",
    value: "-0.11%",
    direction: "down",
  },
  {
    symbol: "AUD/USD",
    label: "Currency",
    value: "+0.09%",
    direction: "up",
  },
  {
    symbol: "Local Activity",
    label: "Community One",
    value: "LIVE",
    direction: "neutral",
  },
];

function MarketTicker({ businessCount }) {
  const tickerItems = useMemo(
    () => [
      ...MARKET_TICKER,
      {
        symbol: "Businesses",
        label: "Nearby",
        value: businessCount,
        direction: "neutral",
      },
    ],
    [businessCount]
  );

  return (
    <section className="yp-stock-ticker" aria-label="Market ticker">
      <div className="yp-stock-track">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span
            className="yp-stock-item"
            key={`${item.symbol}-${item.value}-${index}`}
          >
            <strong>{item.symbol}</strong>
            <small>{item.label}</small>
            <em className={item.direction}>{item.value}</em>
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
  const [category, setCategory] = useState("all");

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

  const businesses = useMemo(() => {
    if (category === "all") return MOCK_MARKERS;

    return MOCK_MARKERS.filter((biz) => biz.type === category);
  }, [category]);

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
            <div>
              <p className="yp-kicker">Yellow Pages</p>
              <h1>Local Businesses</h1>
              <p>
                Discover businesses around{" "}
                {resolvedLocation?.suburb ||
                  resolvedLocation?.locality ||
                  "your community"}
                .
              </p>
            </div>

            <span className="yp-count">{businesses.length}</span>
          </div>

          <div className="business-filters">
            {CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={category === item.id ? "active" : ""}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
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