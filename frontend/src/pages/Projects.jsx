import { Link } from "react-router-dom";

const PROJECTS = [
  {
    title: "Seed Ledger / ITT",
    subtitle: "Inverse Transfer Trading -- eliminating cherry-picking in financial RL",
    status: "LIVE",
    statusClass: "status-answered",
    tech: ["React", "FastAPI", "SQLAlchemy", "SHA-256 Auth", "Resend"],
    link: "/story",
    live: true,
  },
  {
    title: "Prediction Market Bot",
    subtitle: "Multi-venue prediction market trading system with Kelly sizing",
    status: "COMING SOON",
    statusClass: "status-new",
    tech: ["Python", "WebSocket", "Kelly Criterion", "Polymarket"],
    link: null,
    live: false,
  },
  {
    title: "MarketBrain",
    subtitle: "Neural market world model for systematic equity trading",
    status: "COMING SOON",
    statusClass: "status-new",
    tech: ["PyTorch", "IBKR", "Stooq", "FRED", "XGBoost"],
    link: null,
    live: false,
  },
];

export default function Projects() {
  return (
    <div className="page">
      <h1 className="page-title">Projects</h1>
      <p className="page-subtitle">Research and systems I'm building.</p>

      <div className="projects-grid">
        {PROJECTS.map((p, i) => {
          const inner = (
            <div className={`card project-card ${!p.live ? "project-card-dimmed" : ""}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h3 className="card-title" style={{ marginBottom: 0 }}>{p.title}</h3>
                <span className={`status ${p.statusClass}`}>{p.status}</span>
              </div>
              <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {p.subtitle}
              </p>
              <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {p.tech.map((t) => (
                  <span className="tech-tag" key={t}>{t}</span>
                ))}
              </div>
              {p.live && (
                <div style={{ marginTop: "1rem" }}>
                  <span className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>Explore</span>
                </div>
              )}
            </div>
          );

          return p.live ? (
            <Link to={p.link} key={i} style={{ textDecoration: "none" }}>{inner}</Link>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
