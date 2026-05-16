import { useNavigate } from "react-router-dom";
import "./CommunityPlusEventsPage.css";

const SAMPLE_EVENTS = [
  {
    id: "ev-1",
    title: "Neighbourhood Market",
    category: "Markets",
    venue: "Melbourne Town Hall",
    date: "2026-06-12",
    time: "10:00",
    summary: "Local makers, food stalls, music and community groups.",
  },
  {
    id: "ev-2",
    title: "Community Safety Forum",
    category: "Civic",
    venue: "Library Hall",
    date: "2026-06-18",
    time: "18:30",
    summary: "A public discussion about safety, services and local response.",
  },
  {
    id: "ev-3",
    title: "Weekend Youth Sports Day",
    category: "Sport",
    venue: "Princes Park",
    date: "2026-07-05",
    time: "09:00",
    summary: "Open sports activities for young people and families.",
  },
];

export default function CommunityPlusEventsPage() {
  const navigate = useNavigate();

  return (
    <main className="events-page">
      <header className="events-hero">
        <div>
          <span>Community One Events</span>
          <h1>What’s on nearby</h1>
          <p>
            Discover local events, recurring programs, staggered dates and
            community listings up to 12 months ahead.
          </p>
        </div>

        <button
          type="button"
          className="event-primary-button"
          onClick={() => navigate("/communityplus/events/create")}
        >
          create event
        </button>
      </header>

      <section className="events-toolbar">
        <button type="button" className="active">
          Upcoming
        </button>
        <button type="button">This week</button>
        <button type="button">This month</button>
        <button type="button">Recurring</button>
        <button type="button">Free</button>
      </section>

      <section className="events-grid">
        {SAMPLE_EVENTS.map((event) => (
          <article key={event.id} className="event-card">
            <div className="event-card-date">
              <strong>{event.date}</strong>
              <span>{event.time}</span>
            </div>

            <div className="event-card-body">
              <span className="event-card-category">{event.category}</span>
              <h2>{event.title}</h2>
              <p>{event.summary}</p>

              <div className="event-card-meta">
                <span>📍 {event.venue}</span>
              </div>
            </div>

            <button type="button">view event</button>
          </article>
        ))}
      </section>
    </main>
  );
}