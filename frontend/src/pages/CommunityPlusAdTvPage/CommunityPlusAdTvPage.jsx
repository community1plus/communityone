export default function CommunityPlusAdTvPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 className="h1">AD.TV</h1>

      <p className="meta">
        Live ad channel + preview + slot system
      </p>

      <div style={{ marginTop: "20px" }}>
        <div className="panel" style={{ padding: 20 }}>
          <h2 className="h2">Now Playing</h2>
          <p className="body">Current ad stream</p>
        </div>

        <div className="panel" style={{ padding: 20, marginTop: 20 }}>
          <h2 className="h2">Upcoming Slots</h2>
          <p className="body">Ad schedule</p>
        </div>

        <div className="panel" style={{ padding: 20, marginTop: 20 }}>
          <h2 className="h2">Upload / Preview</h2>
          <p className="body">Create and test ads</p>
        </div>
      </div>
    </div>
  );
}