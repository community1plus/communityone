/* =====================================================
CONTAINER (MATCH PROFILE EXACTLY)
===================================================== */

.adtv-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;

  flex: 1; /* 🔥 THIS was missing */

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* =====================================================
HEADER
===================================================== */

.adtv-header {
  margin-bottom: 24px;
}

.adtv-live {
  font-size: 11px;
  font-weight: 700;
  color: #ff3b30;
  letter-spacing: 0.5px;
}

/* =====================================================
LAYOUT (COPY PROFILE GRID LOGIC)
===================================================== */

.adtv-layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(320px, 420px);

  gap: 24px;

  flex: 1;                 /* 🔥 CRITICAL */
  align-items: stretch;
}

.adtv-layout > * {
  min-width: 0;
}

/* =====================================================
CARD SYSTEM (IDENTICAL TO PROFILE)
===================================================== */

.adtv-left,
.adtv-right {
  background: #ffffff;
  border: 1px solid #e6dfd8;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(20, 20, 20, 0.05);

  display: flex;
  flex-direction: column;
  height: 100%;

  box-sizing: border-box;
}

/* left = main content */
.adtv-left {
  padding: 24px;
  gap: 20px;
}

/* right = guide/control */
.adtv-right {
  padding: 22px 24px;
  background: #faf7f4;
  gap: 12px;
}

/* =====================================================
TV
===================================================== */

.adtv-tv-container {
  width: 100%;
  aspect-ratio: 16 / 9;

  border-radius: 12px;
  overflow: hidden;

  display: flex;
}

.adtv-tv-container > * {
  width: 100%;
  height: 100%;
  display: flex;
}

/* =====================================================
MODE BAR
===================================================== */

.adtv-mode-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* =====================================================
SECTIONS
===================================================== */

.adtv-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* =====================================================
PREVIEW
===================================================== */

.adtv-mini-preview {
  margin-top: 6px;
  height: 110px;

  border-radius: 10px;

  background: rgba(0, 0, 0, 0.04);

  display: flex;
  align-items: center;
  justify-content: center;
}

/* =====================================================
RESPONSIVE
===================================================== */

@media (max-width: 900px) {
  .adtv-layout {
    grid-template-columns: 1fr;
  }
}