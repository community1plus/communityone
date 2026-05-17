import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import "./CommunityPlusEventsPage.css";

const SAMPLE_EVENTS = [
  {
    id: "ev-1",

    title:
      "Neighbourhood Market",

    category: "Markets",

    venue:
      "Melbourne Town Hall",

    date: "2026-06-12",

    time: "10:00",

    summary:
      "Local makers, food stalls, music and community groups.",
  },

  {
    id: "ev-2",

    title:
      "Community Safety Forum",

    category: "Civic",

    venue: "Library Hall",

    date: new Date()
      .toISOString()
      .slice(0, 10),

    time: "18:30",

    summary:
      "A public discussion about safety, services and local response.",
  },

  {
    id: "ev-3",

    title:
      "Weekend Youth Sports Day",

    category: "Sport",

    venue: "Princes Park",

    date: "2026-07-05",

    time: "09:00",

    summary:
      "Open sports activities for young people and families.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function toISO(date) {
  return date
    .toISOString()
    .slice(0, 10);
}

function monthLabel(date) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "long",

      year: "numeric",
    }
  ).format(date);
}

function buildCalendarDays(
  monthDate
) {
  const year =
    monthDate.getFullYear();

  const month =
    monthDate.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const startOffset =
    firstDay.getDay();

  const calendarStart =
    new Date(
      year,
      month,
      1 - startOffset
    );

  return Array.from(
    { length: 42 },
    (_, index) => {
      const date =
        new Date(
          calendarStart
        );

      date.setDate(
        calendarStart.getDate() +
          index
      );

      return {
        date,

        iso: toISO(date),

        inMonth:
          date.getMonth() ===
          month,

        isToday:
          toISO(date) ===
          toISO(new Date()),
      };
    }
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CommunityPlusEventsPage() {
  const navigate =
    useNavigate();

  const { isGuest } =
    useAuth();

  /* ======================================================
     DATE STATE
  ====================================================== */

  const today = useMemo(
    () => new Date(),
    []
  );

  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    toISO(today)
  );

  /* ======================================================
     CALENDAR
  ====================================================== */

  const calendarDays =
    useMemo(
      () =>
        buildCalendarDays(
          visibleMonth
        ),
      [visibleMonth]
    );

  /* ======================================================
     EVENTS BY DATE
  ====================================================== */

  const eventsByDate =
    useMemo(() => {
      return SAMPLE_EVENTS.reduce(
        (acc, event) => {
          acc[event.date] =
            acc[event.date] ||
            [];

          acc[event.date].push(
            event
          );

          return acc;
        },
        {}
      );
    }, []);

  /* ======================================================
     SELECTED EVENTS
  ====================================================== */

  const selectedEvents =
    eventsByDate[
      selectedDate
    ] || [];

  /* ======================================================
     MONTH NAVIGATION
  ====================================================== */

  const moveMonth = (
    direction
  ) => {
    setVisibleMonth(
      (current) => {
        const next =
          new Date(
            current
          );

        next.setMonth(
          current.getMonth() +
            direction
        );

        return next;
      }
    );
  };

  /* ======================================================
     CREATE EVENT
  ====================================================== */

  const handleCreateEvent =
    () => {
      if (isGuest) {
        console.log(
          "Guest users cannot create events"
        );

        return;
      }

      navigate(
        "/communityplus/events/create"
      );
    };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <main className="events-page calendar-view">
      {/* ============================================
          CALENDAR PANEL
      ============================================ */}

      <section className="events-calendar-panel">
        {/* HEADER */}

        <header className="events-calendar-header">
          <div>
            <span>
              Community Events
            </span>

            <h1>
              {monthLabel(
                visibleMonth
              )}
            </h1>
          </div>

          {/* CONTROLS */}

          <div className="events-calendar-controls">
            <button
              type="button"
              onClick={() =>
                moveMonth(-1)
              }
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => {
                setVisibleMonth(
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  )
                );

                setSelectedDate(
                  toISO(today)
                );
              }}
            >
              today
            </button>

            <button
              type="button"
              onClick={() =>
                moveMonth(1)
              }
            >
              →

            </button>
          </div>
        </header>

        {/* WEEKDAYS */}

        <div className="events-weekdays">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <span key={day}>
              {day}
            </span>
          ))}
        </div>

        {/* GRID */}

        <div className="events-calendar-grid">
          {calendarDays.map(
            (day) => {
              const hasEvents =
                Boolean(
                  eventsByDate[
                    day.iso
                  ]?.length
                );

              const selected =
                selectedDate ===
                day.iso;

              return (
                <button
                  key={day.iso}
                  type="button"
                  className={[
                    "calendar-day",

                    !day.inMonth &&
                      "muted",

                    day.isToday &&
                      "today",

                    selected &&
                      "selected",

                    hasEvents &&
                      "has-events",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setSelectedDate(
                      day.iso
                    )
                  }
                >
                  <span>
                    {day.date.getDate()}
                  </span>

                  {hasEvents && (
                    <i>
                      {
                        eventsByDate[
                          day.iso
                        ].length
                      }
                    </i>
                  )}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* ============================================
          LIST PANEL
      ============================================ */}

      <aside className="events-list-panel">
        {/* HEADER */}

        <header className="events-list-header">
          <div>
            <span>
              Listings
            </span>

            <h2>
              {selectedDate}
            </h2>
          </div>

          {/* CREATE BUTTON */}

          <button
            type="button"
            className={`event-primary-button ${
              isGuest
                ? "disabled-action"
                : ""
            }`}
            disabled={isGuest}
            onClick={
              handleCreateEvent
            }
            title={
              isGuest
                ? "Sign in to create events"
                : "Create event"
            }
          >
            {isGuest
              ? "guest mode"
              : "create event"}
          </button>
        </header>

        {/* GUEST NOTICE */}

        {isGuest && (
          <div className="guest-action-banner">
            You are browsing
            as a guest.
            Sign in to create
            and manage
            events.
          </div>
        )}

        {/* EVENTS */}

        <div className="events-list">
          {/* EMPTY */}

          {!selectedEvents.length && (
            <div className="events-empty-state">
              <h3>
                No events listed
              </h3>

              <p>
                There are no
                listings for this
                date yet.
              </p>
            </div>
          )}

          {/* LIST */}

          {selectedEvents.map(
            (event) => (
              <article
                key={event.id}
                className="event-card compact"
              >
                {/* DATE */}

                <div className="event-card-date">
                  <strong>
                    {event.time}
                  </strong>

                  <span>
                    {
                      event.category
                    }
                  </span>
                </div>

                {/* BODY */}

                <div className="event-card-body">
                  <h2>
                    {event.title}
                  </h2>

                  <p>
                    {
                      event.summary
                    }
                  </p>

                  <div className="event-card-meta">
                    <span>
                      📍{" "}
                      {event.venue}
                    </span>
                  </div>
                </div>

                {/* VIEW */}

                <button type="button">
                  view event
                </button>
              </article>
            )
          )}
        </div>
      </aside>
    </main>
  );
}