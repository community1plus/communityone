import "./CommunityPlusAboutPage.css";
import aboutUsImage from "../../assets/images/branding/about-us.png";

export default function CommunityPlusAboutPage() {
  return (
    <main className="cp-about-page">
      <section className="cp-about-hero">
        <div className="cp-about-imageWrap">
          <img
            src={aboutUsImage}
            alt="Community One community gathering"
            className="cp-about-image"
          />
        </div>

        <div className="cp-about-content">
          <p className="cp-about-kicker">About Community One</p>

          <h1>
            Built for communities.
            <br />
            Powered by people.
          </h1>

          <p className="cp-about-lead">
            Community One is a local-first digital platform designed to bring
            people, businesses, creators, and communities together in one shared
            space.
          </p>

          <p className="cp-about-body">
            We believe the most important stories are often the ones happening
            closest to home — local news, neighbourhood events, conversations,
            businesses, creators, and everyday moments that shape community
            life.
          </p>

          <p className="cp-about-body">
            Community One combines real-time updates, local discovery, media,
            business visibility, and community engagement into a single
            experience built around people rather than algorithms.
          </p>

          <p className="cp-about-body">
            Our goal is simple: create a platform where communities can connect,
            share information, support local activity, and build stronger
            digital spaces together.
          </p>
        </div>
      </section>
    </main>
  );
}