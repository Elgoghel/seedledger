import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchFaq } from "../api";

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => { fetchFaq().then((d) => { setFaqs(d); setLoading(false); }); }, []);

  if (loading) return <div className="page"><div className="loading">Loading FAQs...</div></div>;

  return (
    <div className="page">
      <h1 className="page-title">FAQ</h1>
      <p className="page-subtitle">Frequently asked questions about the project.</p>
      {faqs.length === 0 && <div className="card"><p style={{ color: "var(--text-dim)" }}>No FAQs yet. Seed the database first.</p></div>}
      {faqs.map((f) => (
        <div className="card" key={f.id} onClick={() => setOpen(open === f.id ? null : f.id)} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="card-title" style={{ marginBottom: 0 }}>{f.question}</h3>
            <span style={{ color: "var(--accent)", fontSize: "1.2rem", fontWeight: 700 }}>{open === f.id ? "-" : "+"}</span>
          </div>
          {open === f.id && <p style={{ marginTop: "0.75rem", color: "var(--text-dim)", lineHeight: 1.8 }}>{f.answer}</p>}
        </div>
      ))}

      <div className="card" style={{ marginTop: "2rem", textAlign: "center", borderColor: "var(--accent)" }}>
        <p style={{ color: "var(--text-dim)", marginBottom: "1rem", fontSize: "1rem" }}>
          Don't see your question here?
        </p>
        <Link to="/ask" className="btn btn-primary">Submit an Inquiry</Link>
      </div>
    </div>
  );
}
