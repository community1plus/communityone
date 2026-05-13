import "./CommunityPlusIViewPage.css";

import CommunityPlusAdTv from "../../pages/CommunityPlusAdTv/CommunityPlusAdTv";

const MOCK_FEED = [
  {
    id: 1,
    title: "Local traffic incident near Chadstone",
    uploader: "Community One",
    views: 1824,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  },

  {
    id: 2,
    title: "Storm warning issued across Melbourne east",
    uploader: "WeatherWatch",
    views: 984,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },

  {
    id: 3,
    title: "Community fundraiser this weekend",
    uploader: "Wheelers Hill",
    views: 622,
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865",
  },

  {
    id: 4,
    title: "New café opening on Ferntree Gully Rd",
    uploader: "Food Melbourne",
    views: 1444,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
  },

  {
    id: 5,
    title: "Live NOW update from Glen Waverley",
    uploader: "Community One",
    views: 3302,
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156",
  },
];

function IViewCard({ item }) {
  return (
    <div className="iview-card">
      <div className="iview-media">
        <img
          src={item.image}
          alt={item.title}
          className="iview-image"
        />
      </div>

      <div className="iview-meta">
        <div className="iview-title">
          {item.title}
        </div>

        <div className="iview-subline">
          <span>{item.uploader}</span>

          <span>•</span>

          <span>{item.views.toLocaleString()} views</span>
        </div>

        <button className="iview-track">
          Track
        </button>
      </div>
    </div>
  );
}

export default function CommunityPlusIViewPage() {
  return (
    <div className="iview-page">
      <div className="iview-grid">

        {MOCK_FEED.map((item) => (
          <IViewCard
            key={item.id}
            item={item}
          />
        ))}

        {/* AD.TV SLOT */}
        <div className="iview-ad-slot">
          <CommunityPlusAdTv
            mode="page"
            context="iview"
            tvMode="idle"
          />
        </div>

      </div>
    </div>
  );
}