import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

import Button from "../../components/UI/Button";

import "./CommunityPlusSplash.css";

export default function CommunityPlusSplash() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/communityplus/profile");
  };

  return (
    <div className="communityplus-splash-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="communityplus-splash-header">

        <div className="communityplus-brand">

          <img
            src="/logos/communityone-red.png"
            alt="Community One"
            className="communityplus-logo"
          />

          <span className="communityplus-brand-text">
            COMMUNITY ONE
          </span>

        </div>

        <div className="communityplus-location">

          <MapPin size={16} />

          <span>Melbourne, Australia</span>

        </div>

      </header>

      {/* =========================================
          HERO
      ========================================= */}

      <main className="communityplus-splash-main">

        <div className="communityplus-splash-card">

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

          <div className="communityplus-splash-actions">

            <Button onClick={handleContinue}>
              Continue to Profile Setup
            </Button>

          </div>

        </div>

      </main>

    </div>
  );
}