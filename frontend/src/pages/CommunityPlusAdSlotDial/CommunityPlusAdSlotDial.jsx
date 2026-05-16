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
  mode = "ad",
  label = "AD.TV",
  disabled = false,
}) {
  const total = 48;
  const angle = 360 / total;

  const selectedSet = useMemo(() => new Set(selectedSlots), [selectedSlots]);

  return (
    <div className={`dial-container ${disabled ? "disabled" : ""}`}>
      <div
        className={[
          "dial",
          mode === "event" && "event-dial",
          disabled && "dial-disabled",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Array.from({ length: total }).map((_, index) => {
          const slot = slots[index] || {};
          const startAngle = index * angle;

          const isFull = slot.count >= slot.capacity;
          const isSelected = selectedSet.has(index);
          const slotLabel = formatSlotLabel(index);

          /*
            48 half-hour slots:
            0  = 00:00 top
            12 = 06:00 right
            24 = 12:00 bottom
            36 = 18:00 left
          */
          const isQuarterMarker = [0, 12, 24, 36].includes(index);

          return (
            <button
              key={index}
              type="button"
              className={[
                "dial-segment",
                isFull ? "full" : "available",
                isSelected && "selected",
                isQuarterMarker && "quarter-marker",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                transform: `rotate(${startAngle}deg) skewY(${90 - angle}deg)`,
              }}
              onClick={() => {
                if (disabled || isFull) return;

                onSelectSlot?.({
                  index,
                  time: slotLabel,
                  slot,
                });
              }}
              disabled={disabled || isFull}
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
          <span>{disabled ? "PICK DATE" : label}</span>
          <small>{disabled ? "date first" : "30 min"}</small>
        </div>
      </div>
    </div>
  );
}