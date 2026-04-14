// src/components/ScrollControls.jsx

import React, { useEffect, useState } from "react";
import "./ScrollControls.css";

export default function ScrollControls() {
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      // Show UP if not at top
      setShowUp(scrollTop > 200);

      // Show DOWN if not at bottom
      setShowDown(scrollTop + windowHeight < fullHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollUp = () => {
    window.scrollBy({ top: -400, behavior: "smooth" });
  };

  const scrollDown = () => {
    window.scrollBy({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="scroll-controls">
      {showUp && (
        <button className="scroll-btn up" onClick={scrollUp}>
          ↑
        </button>
      )}

      {showDown && (
        <button className="scroll-btn down" onClick={scrollDown}>
          ↓
        </button>
      )}
    </div>
  );
}