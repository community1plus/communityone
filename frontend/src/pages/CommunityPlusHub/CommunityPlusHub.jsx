import "./CommunityPlusHub.css";

const categories = [
  {
    title: "Local News",
    description: "Real-time updates from your neighbourhood",
    image: "local news city street community"
  },
  {
    title: "Public Safety",
    description: "Incidents, alerts and emergency signals",
    image: "emergency lights police response city night"
  },
  {
    title: "Events",
    description: "What’s happening around you",
    image: "community festival crowd outdoor event"
  },
  {
    title: "Business & Services",
    description: "Discover and support local businesses",
    image: "small business shop front street"
  },
  {
    title: "Government & Civic",
    description: "Council updates and public services",
    image: "city council building civic government"
  },
  {
    title: "Community",
    description: "People, groups and local conversations",
    image: "community meeting diverse group discussion"
  },
  {
    title: "Transport",
    description: "Traffic, transit and mobility",
    image: "city traffic tram urban transport"
  },
  {
    title: "Environment",
    description: "Weather, climate and local conditions",
    image: "park nature urban green environment"
  }
];

export default function CommunityPlusHub() {
  return (
    <div className="communityplus-container">
      <h2>Community+</h2>

      <div className="cp-grid">
        {categories.map((cat, i) => (
          <div key={i} className="cp-card">

            <div
              className="cp-image"
              style={{
                backgroundImage: `url(https://source.unsplash.com/600x400/?${cat.image})`
              }}
            />

            <div className="cp-content">
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}