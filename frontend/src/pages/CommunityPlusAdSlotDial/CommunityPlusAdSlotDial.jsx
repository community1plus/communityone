import React from "react";
import "./AdSlotDial.css";

export default function AdSlotDial({
  slots = [],
  onSelectSlot,
}) {
  const total = 24;
  const angle = 360 / total;

  return (
    <div className="dial-container">

      <div className="dial">

        {Array.from({ length: total }).map((_, i) => {
          const slot = slots[i] || {};
          const startAngle = i * angle;

          const isFull = slot.count >= slot.capacity;

          return (
            <div
              key={i}
              className={`dial-segment ${isFull ? "full" : "available"}`}
              style={{
                transform: `rotate(${startAngle}deg) skewY(${90 - angle}deg)`
              }}
              onClick={() => onSelectSlot(i)}
            >
              <span className="dial-label">
                {i}
              </span>
            </div>
          );
        })}

        {/* CENTER LABEL */}
        <div className="dial-center">
          AD.TV
        </div>

      </div>
    </div>
  );
}