import {
  useEffect,
  useState,
  useRef,
} from "react";
/**/ 
import {
  useNavigate,
} from "react-router-dom";

import Button from "../../components/UI/Button";

import "./CommunityPlusSplash.css";

export default function CommunityPlusSplash() {

  /* =========================================
     PERFORMANCE TIMERS
  ========================================= */

  const pageLoadStartRef =
    useRef(performance.now());

  const animationStartRef =
    useRef(null);

  const navigate = useNavigate();

  const [visible, setVisible] =
    useState(false);

  /* =========================================
     INITIAL PAGE LOAD
  ========================================= */

  useEffect(() => {

    console.log(
      "[SPLASH] Component mounted"
    );

    animationStartRef.current =
      performance.now();

    const timer = setTimeout(() => {

      setVisible(true);

      console.log(
        `[SPLASH] Initial animation triggered after ${
          (
            performance.now() -
            animationStartRef.current
          ).toFixed(2)
        }ms`
      );

    }, 100);

    return () => clearTimeout(timer);

  }, []);

  /* =========================================
     FULL PAGE READY
  ========================================= */

  useEffect(() => {

    if (!visible) return;

    requestAnimationFrame(() => {

      const total =
        performance.now() -
        pageLoadStartRef.current;

      console.log(
        `[SPLASH] Page visually ready in ${total.toFixed(2)}ms`
      );

    });

  }, [visible]);

  /* =========================================
     NAVIGATION TIMER
  ========================================= */

  const handleContinue = () => {

    const navStart =
      performance.now();

    console.log(
      "[SPLASH] Navigating to profile setup..."
    );

    navigate("/communityplus/profile");

    requestAnimationFrame(() => {

      console.log(
        `[SPLASH] Navigation dispatched in ${
          (
            performance.now() -
            navStart
          ).toFixed(2)
        }ms`
      );

    });
  };

  return (

    <div className="communityplus-splash-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="communityplus-splash-header">

        <div className="communityplus-brand">

          <img
            src="/logo/echo_splash.png"
            alt="Community One"
            className="communityplus-logo"
          />

          <span className="communityplus-brand-text">
            COMMUNITY ONE
          </span>

        </div>

        <div className="communityplus-location">

          <span>📍</span>

          <span>Melbourne, Australia</span>

        </div>

      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="communityplus-main">

        <div
          className={`communityplus-splash-card ${
            visible ? "visible" : ""
          }`}
        >

          {/* =====================================
              HERO
          ===================================== */}

          <div className="communityplus-hero">

            {/* =====================================
                VISUAL
            ===================================== */}

            <div className="communityplus-visual">

              <img
                src="/logo/echo_splash.png"
                alt="Echo"
                className="communityplus-hero-logo"
              />

            </div>

            {/* =====================================
                COPY
            ===================================== */}

            <div className="communityplus-splash-copy">

              <div className="communityplus-pill">
                COMMUNITY+
              </div>

              <h1>
                Welcome to Community One
              </h1>

              <p>
                Build your profile, verify your identity,
                connect your participation, and unlock the
                Community+ ecosystem.
              </p>

            </div>

            {/* =====================================
                ACTIONS
            ===================================== */}

            <div className="communityplus-splash-actions">

              <Button onClick={handleContinue}>
                Continue to Profile Setup
              </Button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}