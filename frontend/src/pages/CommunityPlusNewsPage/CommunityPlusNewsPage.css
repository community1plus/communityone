import { useMemo, useState } from "react";
import "./CommunityPlusNewsPage.css";

const SECTIONS = [
  "Front Page",
  "Local",
  "Politics",
  "Business",
  "Sport",
  "Culture",
  "Opinion",
  "Events",
];

const SAMPLE_ARTICLES = [
  {
    id: 1,
    section: "Front Page",
    headline: "Community One enters local beta testing",
    author: "Community Desk",
    summary:
      "A new locality-aware platform is preparing for early community testing across selected suburbs.",
  },
  {
    id: 2,
    section: "Local",
    headline: "Residents gather for weekend clean-up",
    author: "Local Reporter",
    summary:
      "Volunteers are expected to meet on Saturday morning for a neighbourhood clean-up and barbecue.",
  },
  {
    id: 3,
    section: "Business",
    headline: "Small traders push for stronger local discovery",
    author: "Business Desk",
    summary:
      "Local businesses say visibility and trust remain key challenges in digital discovery.",
  },
];

export default function CommunityPlusNewsPage() {
  const [activeSection, setActiveSection] = useState("Front Page");

  const visibleArticles = useMemo(() => {
    if (activeSection === "Front Page") return SAMPLE_ARTICLES;

    return SAMPLE_ARTICLES.filter(
      (article) => article.section === activeSection
    );
  }, [activeSection]);

  return (
    <main className="news-page">
      <header className="newspaper-masthead">
        <div className="newspaper-date">COMMUNITY ONE DAILY</div>
        <h1>THE LOCAL SIGNAL</h1>
        <div className="newspaper-subtitle">
          News, events, organisations and public life near you
        </div>
      </header>

      <nav className="newspaper-sections" aria-label="News sections">
        {SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            className={activeSection === section ? "active" : ""}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      <section className="newspaper-edition">
        <div className="newspaper-page-label">{activeSection}</div>

        <div className="newspaper-grid">
          {visibleArticles.map((article, index) => (
            <article
              key={article.id}
              className={`news-article ${index === 0 ? "lead" : ""}`}
            >
              <div className="article-section">{article.section}</div>
              <h2>{article.headline}</h2>
              <div className="article-byline">By {article.author}</div>
              <p>{article.summary}</p>
              <button type="button">read article</button>
            </article>
          ))}

          <article className="news-drop-card">
            <h2>Drop an article</h2>
            <p>
              Submit a local article, opinion, event report or public-interest
              story for review.
            </p>
            <button type="button">submit news</button>
          </article>
        </div>
      </section>
    </main>
  );
}