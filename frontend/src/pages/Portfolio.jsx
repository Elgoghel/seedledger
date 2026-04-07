import { Link } from "react-router-dom";

export default function Portfolio() {
  return (
    <div className="page portfolio-page">
      <div className="portfolio-hero">
        <h1 className="portfolio-name">Marwan Elgoghel</h1>
        <p className="portfolio-tagline">
          I build systems that make markets more honest.
        </p>
        <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", lineHeight: 1.8, maxWidth: 700 }}>
          SWE + Math at Monmouth University. Researching algorithmic trading,
          prediction markets, and applied ML.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/projects" className="btn btn-primary">View Projects</Link>
          <a
            href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6382938"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Read My Paper
          </a>
          <a
            href="https://www.linkedin.com/in/marwan-elgoghel/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginTop: "2.5rem", marginBottom: "1rem" }}>Featured Project</h2>
      <Link to="/projects" className="card project-card-featured" style={{ textDecoration: "none", display: "block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 className="card-title" style={{ marginBottom: 0 }}>Seed Ledger / ITT</h3>
          <span className="status status-answered">LIVE</span>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: 1.7 }}>
          Inverse Transfer Trading -- an intent-to-treat protocol that eliminates cherry-picking
          in financial RL. Published on SSRN. 28 seeds, zero exclusions, honest numbers.
        </p>
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className="tech-tag">React</span>
          <span className="tech-tag">FastAPI</span>
          <span className="tech-tag">SQLAlchemy</span>
          <span className="tech-tag">SHA-256 Auth</span>
        </div>
      </Link>
    </div>
  );
}
