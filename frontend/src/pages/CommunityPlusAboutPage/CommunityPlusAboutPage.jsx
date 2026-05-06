import "./communityplus-about.css";

export default function CommunityPlusAboutPage() {
  return (
    <main className="cp-about-page">
      <section className="cp-about-hero">
        <p className="cp-about-kicker">About Community+</p>

        <h1>Local stories. Local people. Local impact.</h1>

        <p className="cp-about-lead">
          Community+ is a local-first platform built to help communities share
          news, events, updates, and real stories from the people who live there.
        </p>
      </section>

      <section className="cp-about-grid">
        <div className="cp-about-card">
          <h2>Our Mission</h2>
          <p>
            To make local information easier to discover, easier to trust, and
            easier to share.
          </p>
        </div>

        <div className="cp-about-card">
          <h2>What We’re Building</h2>
          <p>
            A community media platform where people can post local news, events,
            updates, alerts, and stories in one shared place.
          </p>
        </div>

        <div className="cp-about-card">
          <h2>Why It Matters</h2>
          <p>
            Local communities need better tools than scattered group chats,
            social feeds, and outdated noticeboards.
          </p>
        </div>
      </section>
    </main>
  );
}