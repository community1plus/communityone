import "./CommunityPlusAboutPage.css";
import aboutUsImage from "../../assets/images/branding/about_us.png";

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
            Community One is a local-first, global-second digital platform designed to bring
            people, businesses, creators, and communities together in one shared space.
          </p>

          <p className="cp-about-body">
            The most important stories are often the ones happening
            closest to home and shaping the global narrative - news, 
            neighbourhood events, conversations, businesses, creators.
            and everyday moments that shape our positions.
            life.
          </p>

          <p className="cp-about-body">
            Community One combines real-time updates, local discovery, media,
            business visibility, and community engagement into a single
            experience built around people. 
          </p>

          <p className="cp-about-body">
            The goal is simple: create a platform where communities can connect,
            share information, support local activity, and build stronger
            digital spaces.
          </p>
        </div>
      </section>
    </main>
  );
}