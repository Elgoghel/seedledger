import { useState, useEffect } from "react";
import { fetchStory } from "../api";

export default function Story() {
  const [sections, setSections] = useState([]);
  const [mode, setMode] = useState("plain");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStory().then((d) => { setSections(d); setLoading(false); }); }, []);

  if (loading) return <div className="page"><div className="loading">Loading story...</div></div>;

  return (
    <div className="page">
      <h1 className="page-title">The Story</h1>
      <p className="page-subtitle">
        How honest AI evaluation went from a hunch to a published paper — toggle between plain English and technical detail.
      </p>

      <div className="toggle-group">
        <button className={`toggle-btn ${mode === "plain" ? "active" : ""}`} onClick={() => setMode("plain")}>Plain English</button>
        <button className={`toggle-btn ${mode === "technical" ? "active" : ""}`} onClick={() => setMode("technical")}>Technical</button>
      </div>

      {sections.length === 0 && <div className="card"><p style={{ color: "var(--text-dim)" }}>No story sections yet. Seed the database first.</p></div>}

      {sections.map((s) => (
        <div className="card story-card" key={s.id}>
          <h3 className="card-title">{s.title}</h3>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
            {mode === "plain" ? s.plain_text : s.technical_text}
          </p>
          {s.figure_url && (
            <div className="story-figure">
              <img src={s.figure_url} alt={s.figure_caption || s.title} />
              {s.figure_caption && (
                <p className="story-figure-caption">{s.figure_caption}</p>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="card" style={{ textAlign: "center", borderColor: "var(--accent)" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--text-dim)", marginBottom: "0.75rem" }}>
          Read the full paper on SSRN
        </p>
        <a
          href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6382938"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          View Paper
        </a>
      </div>
    </div>
  );
}
