import { useMemo, useState } from "react";
import CommunityPlusAdTv from "../../pages/CommunityPlusAdTv/CommunityPlusAdTv";
import "./CommunityPlusChannels.css";

const CHANNELS = [
  { id: "ad", label: "AD.TV" },
  { id: "local", label: "Local" },
  { id: "events", label: "Events" },
  { id: "business", label: "Business" },
  { id: "civic", label: "Civic" },
];

export default function CommunityPlusChannels() {
  const [activeChannel, setActiveChannel] = useState("ad");

  const activeLabel = useMemo(() => {
    return CHANNELS.find((channel) => channel.id === activeChannel)?.label;
  }, [activeChannel]);

  return (
    <main className="channels-page">
      <nav className="channels-nav" aria-label="Channel categories">
        {CHANNELS.map((channel) => (
          <button
            key={channel.id}
            type="button"
            className={[
              "channels-nav-item",
              activeChannel === channel.id && "active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setActiveChannel(channel.id)}
          >
            {channel.label}
          </button>
        ))}
      </nav>

      <section className="channels-content">
        {activeChannel === "ad" ? (
          <div className="ad-channel-panel">
            <CommunityPlusAdTv mode="page" context="channels" tvMode="idle" />
          </div>
        ) : (
          <div className="channel-placeholder">
            <h1>{activeLabel}</h1>
            <p>This channel is coming soon.</p>
          </div>
        )}
      </section>
    </main>
  );
}