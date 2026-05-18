// =========================================================
// CommunityPlusEchoDrop.jsx
// =========================================================

import { useNavigate } from "react-router-dom";

import "./CommunityPlusEchoDrop.css";

/* =========================================================
   DROP DATA
========================================================= */

const DROPS = [
  {
    id: "E-01",

    title: "Signal Tee",

    location: "WHEELERS HILL",

    state: "LIVE",

    description:
      "heavyweight cotton • relaxed fit • limited monthly production",

    cta: "enter drop",

    type: "shirt",
  },

  {
    id: "E-02",

    title: "Transit Tote",

    location: "CLAYTON",

    state: "LIMITED",

    description:
      "utility canvas • everyday carry • city signal system",

    cta: "enter drop",

    type: "tote",
  },

  {
    id: "E-03",

    title: "Signal Deck",

    location: "MELBOURNE",

    state: "ARCHIVED",

    description:
      "maple deck • matte finish • object edition release",

    cta: "view archive",

    type: "deck",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function CommunityPlusEchoDrop() {
  const navigate = useNavigate();

  /* =====================================================
     DROP CLICK
  ===================================================== */

  const handleDropClick = (
    drop
  ) => {
    console.log(
      "ECHO DROP CLICK:",
      drop
    );

    navigate(
      `/communityplus/echo/${drop.id.toLowerCase()}`
    );
  };

  /* =====================================================
     FEATURED
  ===================================================== */

  const featuredDrop =
    DROPS[0];

  const secondaryDrops =
    DROPS.slice(1);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="echo-drop-shell">
      <div className="echo-drop-frame">

        {/* =================================================
            HERO
        ================================================= */}

        <div className="echo-drop-hero">

          <div className="echo-drop-copy">

            <div className="echo-drop-brand">

              <div className="echo-drop-mark">
                ECHO<span>.</span>
              </div>

              <div className="echo-drop-sub">
                signal objects by community.one
              </div>

            </div>

            <div className="echo-drop-intro">

              <h1>
                Objects extracted from the signal.
              </h1>

              <p>
                Limited releases connected
                to geography, movement,
                and local transmission
                culture.
              </p>

            </div>

          </div>

          <div className="echo-drop-status">
            SIGNAL DROP — LIVE
          </div>

        </div>

        {/* =================================================
            GRID
        ================================================= */}

        <div className="echo-drop-grid">

          {/* =============================================
              FEATURED DROP
          ============================================= */}

          <article
            className="
              echo-object-card
              echo-object-featured
            "
            onClick={() =>
              handleDropClick(
                featuredDrop
              )
            }
            role="button"
            tabIndex={0}
          >

            {/* =========================================
                VISUAL
            ========================================= */}

            <div className="echo-object-visual">

              {featuredDrop.type ===
                "shirt" && (
                <div className="echo-shirt">

                  <div className="echo-shirt-logo">
                    E/01
                  </div>

                  <div className="echo-object-overlay">
                    SIGNAL UNIT
                  </div>

                </div>
              )}

            </div>

            {/* =========================================
                META
            ========================================= */}

            <div className="echo-object-meta">

              <div className="echo-object-row">

                <h2>
                  {featuredDrop.title}
                </h2>

                <span>
                  {featuredDrop.id}
                </span>

              </div>

              <div className="echo-object-spec">
                {featuredDrop.location}
                {" / "}
                {featuredDrop.state}
              </div>

              <p>
                {
                  featuredDrop.description
                }
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  handleDropClick(
                    featuredDrop
                  );
                }}
              >
                {featuredDrop.cta}
              </button>

            </div>

          </article>

          {/* =============================================
              SIDE STACK
          ============================================= */}

          <div className="echo-drop-side-stack">

            {secondaryDrops.map(
              (drop) => (
                <article
                  key={drop.id}
                  className="
                    echo-object-card
                    echo-object-secondary
                  "
                  onClick={() =>
                    handleDropClick(
                      drop
                    )
                  }
                  role="button"
                  tabIndex={0}
                >

                  {/* =====================================
                      VISUAL
                  ===================================== */}

                  <div className="echo-object-visual">

                    {/* ===============================
                        TOTE
                    =============================== */}

                    {drop.type ===
                      "tote" && (
                      <div className="echo-tote">

                        <div className="echo-tote-logo">
                          echo
                        </div>

                        <div className="echo-tote-tag">
                          signal unit
                        </div>

                      </div>
                    )}

                    {/* ===============================
                        DECK
                    =============================== */}

                    {drop.type ===
                      "deck" && (
                      <div className="echo-board">

                        <div className="echo-board-line" />

                        <div className="echo-board-logo">
                          +
                        </div>

                        <div className="echo-object-overlay">
                          OBJECT RELEASE
                        </div>

                      </div>
                    )}

                  </div>

                  {/* =====================================
                      META
                  ===================================== */}

                  <div className="echo-object-meta">

                    <div className="echo-object-row">

                      <h2>
                        {drop.title}
                      </h2>

                      <span>
                        {drop.id}
                      </span>

                    </div>

                    <div className="echo-object-spec">
                      {drop.location}
                      {" / "}
                      {drop.state}
                    </div>

                    <p>
                      {drop.description}
                    </p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        handleDropClick(
                          drop
                        );
                      }}
                    >
                      {drop.cta}
                    </button>

                  </div>

                </article>
              )
            )}

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="echo-drop-footer">

          <div className="echo-drop-note">
            echo releases are produced
            in limited quantities and
            broadcast through signal
            windows.
          </div>

          <div className="echo-drop-window">
            transmission closes in 12 days
          </div>

        </div>

      </div>
    </section>
  );
}