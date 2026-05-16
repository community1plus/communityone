import { useMemo, useState } from "react";
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
    date: new Date().toISOString().slice(0, 10),
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

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const calendarStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return {
      date,
      iso: toISO(date),
      inMonth: date.getMonth() === month,
      isToday: toISO(date) === toISO(new Date()),
    };
  });
}

export default function CommunityPlusEventCreatePage() {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(toISO(today));

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth]
  );

  const eventsByDate = useMemo(() => {
    return SAMPLE_EVENTS.reduce((acc, event) => {
      if (!acc[event.date]) acc[event.date] = [];
      acc[event.date].push(event);
      return acc;
    }, {});
  }, []);

  const selectedEvents = eventsByDate[selectedDate] || [];

  const moveMonth = (direction) => {
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
  };

  const resetToToday = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toISO(today));
  };

  return (
    <main className="events-page calendar-view">
      <section className="events-calendar-panel">
        <header className="events-calendar-header">
          <div>
            <span>Community Events</span>
            <h1>{monthLabel(visibleMonth)}</h1>
          </div>

          <div className="events-calendar-controls">
            <button type="button" onClick={() => moveMonth(-1)}>
              ←
            </button>

            <button type="button" onClick={resetToToday}>
              today
            </button>

            <button type="button" onClick={() => moveMonth(1)}>
              →
            </button>
          </div>
        </header>

        <div className="events-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="events-calendar-grid">
          {calendarDays.map((day) => {
            const eventCount = eventsByDate[day.iso]?.length || 0;
            const selected = selectedDate === day.iso;

            return (
              <button
                key={day.iso}
                type="button"
                className={[
                  "calendar-day",
                  !day.inMonth && "muted",
                  day.isToday && "today",
                  selected && "selected",
                  eventCount > 0 && "has-events",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDate(day.iso)}
              >
                <span>{day.date.getDate()}</span>

                {eventCount > 0 && <i>{eventCount}</i>}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="events-list-panel">
        <header className="events-list-header">
          <div>
            <span>Listings</span>
            <h2>{selectedDate}</h2>
          </div>

          <button
            type="button"
            className="event-primary-button"
            onClick={() => navigate("/communityplus/events/create")}
          >
            create event
          </button>
        </header>

        <div className="events-list">
          {!selectedEvents.length && (
            <div className="events-empty-state">
              <h3>No events listed</h3>
              <p>There are no listings for this date yet.</p>
            </div>
          )}

          {selectedEvents.map((event) => (
            <article key={event.id} className="event-card compact">
              <div className="event-card-date">
                <strong>{event.time}</strong>
                <span>{event.category}</span>
              </div>

              <div className="event-card-body">
                <h2>{event.title}</h2>
                <p>{event.summary}</p>

                <div className="event-card-meta">
                  <span>📍 {event.venue}</span>
                </div>
              </div>

              <button type="button">view event</button>
            </article>
          ))}
        </div>
      </aside>
    </main>
  );
}