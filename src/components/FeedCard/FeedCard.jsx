export default function FeedCard({ items = [] }) {
  return (
    <div className="feed-column">

      <div className="feed-header">LIVE FEED</div>

      {items.map((item, idx) => (
        <div className="feed-card" key={idx}>
          <div className="feed-card-title">{item.title}</div>

          <div className="feed-card-meta">
            <span className="meta-dot-teal"></span>
            {item.distance}m • {item.location}
          </div>

          <div className="feed-card-meta">
            <span className="meta-dot-red"></span>
            {item.timeAgo}
          </div>
        </div>
      ))}

    </div>
  );
}
