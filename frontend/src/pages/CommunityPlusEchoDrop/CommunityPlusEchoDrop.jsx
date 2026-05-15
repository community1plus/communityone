import "./CommunityPlusEchoDrop.css";

export default function CommunityPlusEchoDrop() {
  return (
    <section className="echo-drop-shell">

      {/* ========================================
          HERO
      ======================================== */}

      <div className="echo-drop-hero">

        <div className="echo-drop-brand">

          <div className="echo-drop-mark">
            COMMUNITY<span>+</span>
          </div>

          <div className="echo-drop-sub">
            signal objects by echo
          </div>

        </div>

        <div className="echo-drop-status">
          DROP 01 — OPEN
        </div>

      </div>

      {/* ========================================
          GRID
      ======================================== */}

      <div className="echo-drop-grid">

        {/* ========================================
            SIGNAL TEE
        ======================================== */}

        <article className="echo-object-card">

          <div className="echo-object-visual">

            <div className="echo-shirt">

              <div className="echo-shirt-logo">
                COMMUNITY<span>+</span>
              </div>

            </div>

          </div>

          <div className="echo-object-meta">

            <div className="echo-object-row">

              <h2>Signal Tee</h2>

              <span>01</span>

            </div>

            <p>
              heavyweight cotton • relaxed fit • limited monthly production
            </p>

            <button type="button">
              reserve
            </button>

          </div>

        </article>

        {/* ========================================
            TRANSIT TOTE
        ======================================== */}

        <article className="echo-object-card">

          <div className="echo-object-visual">

            <div className="echo-tote">

              <div className="echo-tote-logo">
                COMMUNITY<span>+</span>
              </div>

              <div className="echo-tote-tag">
                echo
              </div>

            </div>

          </div>

          <div className="echo-object-meta">

            <div className="echo-object-row">

              <h2>Transit Tote</h2>

              <span>02</span>

            </div>

            <p>
              utility canvas • everyday carry • city signal system
            </p>

            <button type="button">
              reserve
            </button>

          </div>

        </article>

        {/* ========================================
            SIGNAL DECK
        ======================================== */}

        <article className="echo-object-card">

          <div className="echo-object-visual">

            <div className="echo-board">

              <div className="echo-board-line" />

              <div className="echo-board-logo">
                +
              </div>

            </div>

          </div>

          <div className="echo-object-meta">

            <div className="echo-object-row">

              <h2>Signal Deck</h2>

              <span>03</span>

            </div>

            <p>
              maple deck • matte finish • object edition release
            </p>

            <button type="button">
              reserve
            </button>

          </div>

        </article>

      </div>

      {/* ========================================
          FOOTER
      ======================================== */}

      <div className="echo-drop-footer">

        <div className="echo-drop-note">
          echo releases are produced monthly in limited quantities.
        </div>

        <div className="echo-drop-window">
          ordering window closes in 12 days
        </div>

      </div>

    </section>
  );
}