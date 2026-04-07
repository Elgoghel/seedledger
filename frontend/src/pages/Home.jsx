import { Link } from "react-router-dom";

const HIGHLIGHTS = [
  { label: "1.73", desc: "Median Sharpe (OOS)", cls: "metric-good" },
  { label: "36.8%", desc: "Median CAGR", cls: "metric-good" },
  { label: "28", desc: "Pre-registered Seeds", cls: "metric-good" },
  { label: "0", desc: "Exclusions", cls: "metric-good" },
];

export default function Home() {
  return (
    <div className="page">
      <h1 className="page-title">Seed Ledger</h1>
      <p className="page-subtitle">
        Research hub for <em>Every Seed, Every Result</em> — an intent-to-treat evaluation
        protocol for financial reinforcement learning.
      </p>

      <div className="highlights-grid">
        {HIGHLIGHTS.map((h, i) => (
          <div className="highlight-card" key={i}>
            <span className={`highlight-value ${h.cls}`}>{h.label}</span>
            <span className="highlight-desc">{h.desc}</span>
          </div>
        ))}
      </div>

      <div className="speedrun-panel">
        <h2 className="speedrun-title">The One-Liner</h2>
        <p style={{ color: "var(--text)", fontSize: "1.05rem", lineHeight: 1.8 }}>
          RL training pipelines are randomized — identical code produces different results under
          different seeds. We show that picking the best seed inflates Sharpe by 15% and nearly
          doubles CAGR. Our intent-to-treat protocol fixes this: pre-register every seed, run
          all of them, report all of them. 28 seeds, zero exclusions, honest numbers.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <a
            href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6382938"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ marginRight: "0.75rem" }}
          >
            Read the Paper
          </a>
          <Link to="/story" className="btn">The Full Story</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
        <Link to="/story" className="card" style={{ textDecoration: "none" }}>
          <h3 className="card-title">The Story</h3>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>From a hunch about cherry-picked results to a published protocol. Plain English + technical toggle.</p>
        </Link>
        <Link to="/results" className="card" style={{ textDecoration: "none" }}>
          <h3 className="card-title">Experiment Results</h3>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>All 28 pre-registered seed runs. Filter by seed, config, or period.</p>
        </Link>
        <Link to="/ask" className="card" style={{ textDecoration: "none" }}>
          <h3 className="card-title">Ask a Question</h3>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Submit an inquiry about the research. Auto-saved, email notifications.</p>
        </Link>
      </div>
    </div>
  );
}
