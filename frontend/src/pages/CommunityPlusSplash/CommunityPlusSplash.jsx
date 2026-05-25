import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Button from "../../components/UI/Button";

import "./CommunityPlusSplash.css";

export default function CommunityPlusSplash() {


  const navigate = useNavigate();

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {

    const timer = setTimeout(() => {

      setVisible(true);

    }, 100);

    return () => clearTimeout(timer);

  }, []);

  const handleContinue = () => {

    navigate("/communityplus/profile");

  };

  const [logoLoaded, setLogoLoaded] = useState(false);

  const logoClassName = `communityplus-hero-logo ${
    logoLoaded ? "loaded" : ""
  }`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoLoaded(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (

    <div className="communityplus-splash-page">

      {/* =====================================
          HEADER
      ===================================== */}

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

      {/* =====================================
          HERO
      ===================================== */}

      <main className="communityplus-main">

        <div
          className={`communityplus-splash-card ${
            visible ? "visible" : ""
          }`}
        >

          <div className="communityplus-hero">

            {/* ================================
                VISUAL
            ================================= */}

            <div className="communityplus-visual">

              <img
                src="/logo/echo_splash.png"
                alt="Echo"
                className="communityplus-hero-logo"
              />

            </div>

            {/* ================================
                COPY
            ================================= */}

            <div className="communityplus-splash-copy">

              <h1>
                Welcome to
                <span>Community One</span>
              </h1>

              <p>
                Build your profile, verify your identity,
                connect your participation, and access
                the Community One ecosystem.
              </p>

            </div>

            

            {/* ================================
                ACTIONS
            ================================= */}

            <div className="communityplus-splash-actions">

              <Button
                onClick={handleContinue}
                className="communityplus-cta"
              >
                Continue to Profile Setup
              </Button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );
}