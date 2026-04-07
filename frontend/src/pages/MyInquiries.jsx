import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { trackInquiry, fetchMyInquiriesByKey } from "../api";

export default function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Priority: URL ?key= param (from email link) > localStorage key > localStorage tokens
    const urlKey = searchParams.get("key");
    const storedKey = localStorage.getItem("sl_access_key");
    const accessKey = urlKey || storedKey;

    // If we got a key from the URL, save it to localStorage for future visits
    if (urlKey && urlKey !== storedKey) {
      localStorage.setItem("sl_access_key", urlKey);
    }

    if (accessKey) {
      // Fetch all inquiries via secure keyed hash
      fetchMyInquiriesByKey(accessKey)
        .then((results) => {
          setInquiries(results);
          // Sync to localStorage tokens too (for individual tracking links)
          const toSave = results.map((r) => ({
            token: r.tracking_token,
            category: r.category,
            name: r.name,
            date: r.created_at,
          }));
          localStorage.setItem("my_inquiries", JSON.stringify(toSave));
          setLoading(false);
        })
        .catch(() => {
          // Key invalid or server error -- fall back to localStorage tokens
          loadFromLocalStorage();
        });
    } else {
      // No access key -- fall back to localStorage tokens
      loadFromLocalStorage();
    }

    function loadFromLocalStorage() {
      const saved = JSON.parse(localStorage.getItem("my_inquiries") || "[]");
      if (saved.length === 0) { setLoading(false); return; }
      Promise.all(
        saved.map((item) =>
          trackInquiry(item.token)
            .then((data) => ({ ...data, localDate: item.date }))
            .catch(() => ({ token: item.token, failed: true, category: item.category, localDate: item.date }))
        )
      ).then((results) => {
        setInquiries(results);
        setLoading(false);
      });
    }
  }, [searchParams]);

  const handleClear = () => {
    if (confirm("Remove all saved inquiries from this browser? This only clears local data -- your inquiries still exist on the server.")) {
      localStorage.removeItem("my_inquiries");
      localStorage.removeItem("sl_access_key");
      setInquiries([]);
    }
  };

  if (loading) return <div className="page"><div className="loading">Loading your inquiries...</div></div>;

  return (
    <div className="page">
      <h1 className="page-title">My Inquiries</h1>
      <p className="page-subtitle">
        Your inquiries, securely loaded via your personal access key.
      </p>

      {inquiries.length === 0 ? (
        <div className="card">
          <p style={{ color: "var(--text-dim)", marginBottom: "1rem" }}>
            No inquiries found. <Link to="/ask">Submit one</Link> and it will appear here automatically.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            If you submitted from another device, check your email for the dashboard link with your access key.
          </p>
        </div>
      ) : (
        <>
          {inquiries.map((inq, i) => {
            const statusClass = inq.status === "answered" ? "status-answered"
              : inq.status === "archived" ? "status-archived" : "status-new";
            return (
              <Link to={`/inquiry/${inq.tracking_token || inq.token}`} key={i} className="card my-inquiry-card" style={{ textDecoration: "none", display: "block" }}>
                <div className="admin-inquiry-header">
                  <div>
                    <span className="admin-category">{inq.category || "general"}</span>
                    <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginLeft: "0.75rem" }}>
                      {new Date(inq.localDate || inq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {!inq.failed && <span className={`status ${statusClass}`}>{inq.status}</span>}
                  {inq.failed && <span className="status status-archived">unavailable</span>}
                </div>
                {inq.message && (
                  <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: "0.5rem", lineHeight: 1.6 }}>
                    {inq.message.length > 120 ? inq.message.slice(0, 120) + "..." : inq.message}
                  </p>
                )}
                {inq.admin_reply && (
                  <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.75rem", background: "var(--accent-dim)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--accent)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase" }}>Replied</span>
                  </div>
                )}
              </Link>
            );
          })}
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <Link to="/ask" className="btn btn-primary">New Inquiry</Link>
            <button className="btn btn-delete" onClick={handleClear}>Clear Saved</button>
          </div>
        </>
      )}
    </div>
  );
}
