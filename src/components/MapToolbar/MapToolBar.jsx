import React from "react";
import "./MapToolbar.css";


export default function MapToolbar({ onZoomIn, onZoomOut, onRecenter, onRadius, onStyle }) {
  return (
    <div className="map-toolbar">
      <button onClick={onZoomIn}>＋</button>
      <button onClick={onZoomOut}>－</button>

      <hr />

      <button onClick={onRecenter}>📍</button>

      <hr />

      <select onChange={(e) => onRadius(e.target.value)}>
        <option value="1">1 km</option>
        <option value="3">3 km</option>
        <option value="5">5 km</option>
      </select>

      <select onChange={(e) => onStyle(e.target.value)}>
        <option value="roadmap">Default</option>
        <option value="satellite">Satellite</option>
        <option value="terrain">Terrain</option>
      </select>
    </div>
  );
}
