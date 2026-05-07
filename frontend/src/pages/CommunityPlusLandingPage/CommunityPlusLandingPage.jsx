import "./CommunityPlusAboutPage.css";
import echoImage from "../../assets/images/branding/echo.png";

export default function CommunityPlusAboutPage() {
  return (
    <main className="cp-about-page">
      <section className="cp-about-hero">
        <img
          src={echoImage}
          alt="Community+ Echo"
          className="cp-about-echo"
        />

        <p className="cp-about-kicker">About Community+</p>

        <h1>Local stories. Local people. Local impact.</h1>

        <p className="cp-about-lead">
          Community+ is a local-first platform built to help communities share
          news, events, updates, and real stories from the people who live there.
        </p>
      </section>
    </main>
  );
}