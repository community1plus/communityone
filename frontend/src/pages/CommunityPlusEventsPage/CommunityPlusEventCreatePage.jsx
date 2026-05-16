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
  const [activeTab, setActiveTab] = useState("details");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState("Community");

  const [selectedDate, setSelectedDate] = useState(todayISO());

  const [schedule, setSchedule] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState([]);

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

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (name) => {
    setUploadedFiles((prev) =>
      prev.filter((file) => file.name !== name)
    );
  };

  const canPublish =
    title.trim() &&
    description.trim() &&
    venue.trim() &&
    schedule.length > 0;

  return (
    <main className="event-create-page">
      {/* =========================================
          LEFT COLUMN
      ========================================= */}

      <section className="event-create-column event-details-panel">
        <div className="event-create-header">
          <span>Event Listing</span>

          <h1>Create an event</h1>

          <p>
            Add one-off, staggered or recurring event dates up to
            12 months in advance.
          </p>
        </div>

        {/* =========================================
            TABS
        ========================================= */}

        <div className="event-tabs">
          <button
            type="button"
            className={activeTab === "details" ? "active" : ""}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>

          <button
            type="button"
            className={activeTab === "dates" ? "active" : ""}
            onClick={() => setActiveTab("dates")}
          >
            Dates
          </button>

          <button
            type="button"
            className={activeTab === "media" ? "active" : ""}
            onClick={() => setActiveTab("media")}
          >
            Media
          </button>
        </div>

        {/* =========================================
            DETAILS TAB
        ========================================= */}

        {activeTab === "details" && (
          <div className="event-tab-panel">
            <label className="event-field">
              <span>Event title</span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Community market, workshop, concert..."
              />
            </label>

            <label className="event-field">
              <span>Description</span>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the event, who it is for, and what people should know..."
              />
            </label>

            <label className="event-field">
              <span>Venue / location</span>

              <input
                type="text"
                value={venue}
                onChange={(event) =>
                  setVenue(event.target.value)
                }
                placeholder="Venue name or address"
              />
            </label>

            <label className="event-field">
              <span>Category</span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
              >
                {EVENT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* =========================================
            DATES TAB
        ========================================= */}

        {activeTab === "dates" && (
          <div className="event-tab-panel">
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
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
              />
            </label>

            <div className="event-dial-wrap">
              <CommunityPlusAdSlotDial
                mode="event"
                label={selectedDate ? "EVENT" : "PICK DATE"}
                disabled={!selectedDate}
                selectedSlots={selectedSlotIndexes}
                onSelectSlot={handleSelectSlot}
              />
            </div>

            <div className="event-selected-list">
              <div className="event-selected-title">
                Selected dates & times
              </div>

              {!sortedSchedule.length && (
                <div className="event-empty-schedule">
                  Select a date, then click the dial to
                  add half-hour event times.
                </div>
              )}

              {sortedSchedule.map((item) => (
                <div
                  key={item.id}
                  className="event-schedule-item"
                >
                  <span>{item.date}</span>

                  <strong>{item.time}</strong>

                  <button
                    type="button"
                    onClick={() =>
                      removeScheduleItem(item.id)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            MEDIA TAB
        ========================================= */}

        {activeTab === "media" && (
          <div className="event-tab-panel">
            <div className="event-upload-box">
              <input
                type="file"
                multiple
                onChange={handleFiles}
              />

              <div className="event-upload-content">
                <h3>Upload media</h3>

                <p>
                  Add flyers, posters, videos,
                  PDFs or supporting documents.
                </p>
              </div>
            </div>

            <div className="event-upload-list">
              {!uploadedFiles.length && (
                <div className="event-empty-upload">
                  No files uploaded yet.
                </div>
              )}

              {uploadedFiles.map((file) => (
                <div
                  key={file.name}
                  className="event-upload-item"
                >
                  <div>
                    <strong>{file.name}</strong>

                    <span>
                      {Math.round(file.size / 1024)} KB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeFile(file.name)
                    }
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            ACTIONS
        ========================================= */}

        <div className="event-create-actions">
          <button
            type="button"
            className="event-secondary-button"
          >
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
    </main>
  );
}