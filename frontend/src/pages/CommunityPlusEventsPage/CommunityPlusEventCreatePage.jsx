import { useMemo, useState } from "react";

import CommunityPlusAdSlotDial from "../CommunityPlusAdSlotDial/CommunityPlusAdSlotDial";
import "./CommunityPlusEventsPage.css";

const EVENT_CATEGORIES = [
  "Community",
  "Music",
  "Sport",
  "Food & Drink",
  "Markets",
  "Business",
  "Civic",
  "Education",
  "Health",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CommunityPlusEventCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState("Community");
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [schedule, setSchedule] = useState([]);

  const selectedSlotIndexes = useMemo(() => {
    return schedule
      .filter((item) => item.date === selectedDate)
      .map((item) => item.slotIndex);
  }, [schedule, selectedDate]);

  const sortedSchedule = useMemo(() => {
    return [...schedule].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [schedule]);

  const handleSelectSlot = ({ index, time }) => {
    if (!selectedDate || !time) return;

    const exists = schedule.some(
      (item) => item.date === selectedDate && item.time === time
    );

    if (exists) return;

    setSchedule((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        date: selectedDate,
        time,
        slotIndex: index,
      },
    ]);
  };

  const removeScheduleItem = (id) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const canPublish =
    title.trim() && description.trim() && venue.trim() && schedule.length > 0;

  return (
    <main className="event-create-page">
      <section className="event-create-column event-details-panel">
        <div className="event-create-header">
          <span>Event Listing</span>

          <h1>Create an event</h1>

          <p>
            Add one-off, staggered or recurring event dates up to 12 months in
            advance.
          </p>
        </div>

        <label className="event-field">
          <span>Event title</span>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Community market, workshop, concert..."
          />
        </label>

        <label className="event-field">
          <span>Description</span>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the event, who it is for, and what people should know..."
          />
        </label>

        <label className="event-field">
          <span>Venue / location</span>

          <input
            type="text"
            value={venue}
            onChange={(event) => setVenue(event.target.value)}
            placeholder="Venue name or address"
          />
        </label>

        <label className="event-field">
          <span>Category</span>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {EVENT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="event-create-actions">
          <button type="button" className="event-secondary-button">
            save draft
          </button>

          <button
            type="button"
            className="event-primary-button"
            disabled={!canPublish}
          >
            publish event
          </button>
        </div>
      </section>

      <section className="event-create-column event-schedule-panel">
        <div className="event-schedule-header">
          <span>Schedule</span>

          <h2>Select date and time</h2>
        </div>

        <label className="event-field">
          <span>Date</span>

          <input
            type="date"
            value={selectedDate}
            min={todayISO()}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>

        <div className="event-dial-wrap">
          <CommunityPlusAdSlotDial
            mode="event"
            label="EVENT"
            selectedSlots={selectedSlotIndexes}
            onSelectSlot={handleSelectSlot}
          />
        </div>

        <div className="event-selected-list">
          <div className="event-selected-title">Selected dates & times</div>

          {!sortedSchedule.length && (
            <div className="event-empty-schedule">
              Select a date, then click the dial to add half-hour event times.
            </div>
          )}

          {sortedSchedule.map((item) => (
            <div key={item.id} className="event-schedule-item">
              <span>{item.date}</span>

              <strong>{item.time}</strong>

              <button
                type="button"
                onClick={() => removeScheduleItem(item.id)}
                aria-label={`Remove ${item.date} ${item.time}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}