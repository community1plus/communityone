export default function FeedCard({ title, summary, image }) {
  return (
    <div className="feed-card">

      {image && (
        <div className="feed-card-media">
          <img src={image} alt="uploaded" />
        </div>
      )}

      <div className="feed-card-body">
        <div className="feed-card-header">
          <span className="feed-card-badge">POST</span>
          <span className="feed-card-time">Just now</span>
        </div>

        <h3 className="feed-card-title">{title}</h3>
        <p className="feed-card-text">{summary}</p>
      </div>

    </div>
  );
}
