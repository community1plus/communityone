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

const STOCK_TICKER = [
  "ASX 200 ▲ 0.42%",
  "Retail ▲ 0.18%",
  "Hospitality ▼ 0.11%",
  "AUD/USD ▲ 0.09%",
  "Local business activity LIVE",
];

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
      <section className="yp-stock-ticker" aria-label="Market ticker">
        <div className="yp-stock-track">
          {[...STOCK_TICKER, ...STOCK_TICKER].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

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