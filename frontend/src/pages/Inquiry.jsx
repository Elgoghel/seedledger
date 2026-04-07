import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { trackInquiry } from "../api";

export default function Inquiry() {
  const { token } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    trackInquiry(token).then((d) => { setInquiry(d); setLoading(false); }).catch(() => { setError("Inquiry not found."); setLoading(false); });
  }, [token]);

  if (loading) return <div className="page"><div className="loading">Loading inquiry...</div></div>;
  if (error) return (
    <div className="page">
      <h1 className="page-title">Inquiry Not Found</h1>
      <div className="card"><p style={{ color: "var(--danger)" }}>{error}</p><Link to="/ask" style={{ display: "inline-block", marginTop: "1rem" }}>Submit a new inquiry</Link></div>
    </div>
  );

  const statusClass = inquiry.status === "answered" ? "status-answered" : inquiry.status === "archived" ? "status-archived" : "status-new";

  return (
    <div className="page">
      <h1 className="page-title">Inquiry Status</h1>
      <p className="page-subtitle">Tracking: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent)" }}>{token}</span></p>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 className="card-title">{inquiry.name}</h3>
          <span className={`status ${statusClass}`}>{inquiry.status}</span>
        </div>
        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
          Category: {inquiry.category} | Submitted: {new Date(inquiry.created_at).toLocaleDateString()}
        </p>
        <p style={{ fontSize: "0.95rem", lineHeight: 1.8, marginTop: "1rem" }}>{inquiry.message}</p>
        {inquiry.admin_reply && (
          <div className="reply-box">
            <div className="reply-label">Admin Reply</div>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>{inquiry.admin_reply}</p>
          </div>
        )}
        {!inquiry.admin_reply && inquiry.status === "new" && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--accent-blue-dim)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ color: "var(--accent-blue)", fontSize: "0.9rem" }}>Your inquiry is being reviewed. Check back later.</p>
          </div>
        )}
      </div>
      <div style={{ marginTop: "1.5rem" }}><button className="btn" onClick={() => window.location.reload()}>Refresh Status</button></div>
    </div>
  );
}
