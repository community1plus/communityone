import React, { useState, useMemo, useCallback } from "react";

import CommunityPlusAdTv from "../CommunityPlusAdTv/CommunityPlusAdTv";
import CommunityPlusAdSlotDial from "../CommunityPlusAdSlotDial/CommunityPlusAdSlotDial";

import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import Section from "../../components/UI/Section";
import Button from "../../components/UI/Button";

import "../../styles/system.css";

const MODES = ["live", "schedule", "upload"];

export default function CommunityPlusAdTvPage() {
  const [tvMode, setTvMode] = useState("live");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const slots = useMemo(
    () =>
      Array.from({ length: 24 }, () => ({
        count: Math.floor(Math.random() * 5),
        capacity: 5,
      })),
    []
  );

  const handleSelectSlot = useCallback((hour) => {
    setSelectedSlot(hour);
    setTvMode("schedule");
  }, []);

  const selectedLabel =
    selectedSlot !== null ? `Selected: ${selectedSlot}:00` : "Select an hour";

  return (
    <div className="page-container">

      <PageHeader
        title="Channels"
        meta="LIVE AD CHANNEL • LOCATION-AWARE • TIME-BASED"
      />

      <div className="page-layout">

        {/* LEFT */}
        <Card>

          <div className="adtv-tv-container">
            <CommunityPlusAdTv
              mode="page"
              context="page"
              tvMode={tvMode}
              selectedSlot={selectedSlot}
            />
          </div>

          <div className="adtv-mode-bar">
            {MODES.map((mode) => (
              <Button
                key={mode}
                variant="ghost"
                className={tvMode === mode ? "active" : ""}
                onClick={() => setTvMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>

          <Section title="Now Playing" meta="CURRENT AD STREAM">
            <div className="adtv-mini-preview">
              {selectedSlot !== null
                ? `Preview for ${selectedSlot}:00`
                : "Active campaign preview"}
            </div>
          </Section>

          <Section title="Upcoming Slots" meta="SCHEDULED ADS">
            <div className="adtv-slot-list">
              <div>18:00 — Restaurant Promo</div>
              <div>19:00 — Event Ad</div>
              <div>20:00 — Local Business</div>
            </div>
          </Section>

          <Section title="Upload / Preview" meta="CREATE AND TEST ADS">
            <Button onClick={() => setTvMode("upload")}>
              Upload Ad
            </Button>
          </Section>

        </Card>

        {/* RIGHT */}
        <Card variant="soft">

          <Section title="Book Slot" meta={selectedLabel} />

          <CommunityPlusAdSlotDial
            slots={slots}
            onSelectSlot={handleSelectSlot}
          />

        </Card>

      </div>
    </div>
  );
}