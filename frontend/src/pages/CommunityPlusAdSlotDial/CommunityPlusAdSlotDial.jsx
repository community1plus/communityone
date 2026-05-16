import React, { useMemo } from "react";
import "./CommunityPlusAdSlotDial.css";

function formatSlotLabel(index) {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export default function CommunityPlusAdSlotDial({
  slots = [],
  selectedSlots = [],
  onSelectSlot,
  mode = "ad", // ad | event
  label = "AD.TV",
}) {
  const total = 48;
  const angle = 360 / total;

  const selectedSet = useMemo(() => {
    return new Set(selectedSlots);
  }, [selectedSlots]);

  return (
    <div className="dial-container">
      <div className={`dial ${mode === "event" ? "event-dial" : ""}`}>
        {Array.from({ length: total }).map((_, index) => {
          const slot = slots[index] || {};
          const startAngle = index * angle;

          const isFull = slot.count >= slot.capacity;
          const isSelected = selectedSet.has(index);
          const slotLabel = formatSlotLabel(index);

          return (
            <button
              key={index}
              type="button"
              className={[
                "dial-segment",
                isFull ? "full" : "available",
                isSelected && "selected",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                transform: `rotate(${startAngle}deg) skewY(${90 - angle}deg)`,
              }}
              onClick={() =>
                onSelectSlot?.({
                  index,
                  time: slotLabel,
                  slot,
                })
              }
              disabled={isFull}
              title={slotLabel}
              aria-label={`Select ${slotLabel}`}
            >
              <span className="dial-label">
                {index % 2 === 0 ? String(Math.floor(index / 2)) : ""}
              </span>
            </button>
          );
        })}

        <div className="dial-center">
          <span>{label}</span>
          <small>30 min</small>
        </div>
      </div>
    </div>
  );
}