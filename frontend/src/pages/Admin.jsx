import { useState, useEffect } from "react";
import { fetchAdminInquiries, replyToInquiry, deleteInquiry } from "../api";

export default function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await fetchAdminInquiries(adminKey);
      setInquiries(data);
      setLoggedIn(true);
    } catch {
      setError("Invalid admin key. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminInquiries(adminKey);
      setInquiries(data);
    } catch {
      setError("Failed to refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!reply.trim()) return;
    setReplying(true);
    try {
      await replyToInquiry(adminKey, id, reply);
      setReply("");
      setSelected(null);
      await refresh();
    } catch {
      setError("Failed to send reply.");
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inquiry?")) return;
    try {
      await deleteInquiry(adminKey, id);
      await refresh();
    } catch {
      setError("Failed to delete.");
    }
  };

  const statusClass = (s) => {
    if (s === "new") return "status status-new";
    if (s === "answered") return "status status-answered";
    return "status status-archived";
  };

  // --- Login screen ---
  if (!loggedIn) {
    return (
      <div className="page">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Enter the admin key to manage inquiries.</p>
        <div className="card" style={{ maxWidth: 400 }}>
          <form onSubmit={login}>
            <div className="form-group">
              <label>Admin Key</label>
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
              />
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Admin dashboard ---
  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h1 className="page-title">Admin Panel</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn" onClick={refresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn" onClick={() => { setLoggedIn(false); setAdminKey(""); setInquiries([]); }}>
            Logout
          </button>
        </div>
      </div>
      <p className="page-subtitle">{inquiries.length} total inquiries</p>

      {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

      {inquiries.length === 0 ? (
        <div className="card"><p style={{ color: "var(--text-dim)" }}>No inquiries yet.</p></div>
      ) : (
        inquiries.map((inq) => (
          <div className="card admin-inquiry" key={inq.id}>
            <div className="admin-inquiry-header">
              <div>
                <span style={{ fontWeight: 600 }}>{inq.name}</span>
                <span style={{ color: "var(--text-dim)", marginLeft: "0.75rem", fontSize: "0.85rem" }}>{inq.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={statusClass(inq.status)}>{inq.status}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  {new Date(inq.created_at).toLocaleDateString()}
                </span>
                <button className="btn-delete" onClick={() => handleDelete(inq.id)}>Delete</button>
              </div>
            </div>

            <div style={{ margin: "0.75rem 0" }}>
              <span className="admin-category">{inq.category}</span>
              <p style={{ marginTop: "0.5rem", color: "var(--text-dim)", lineHeight: 1.7 }}>{inq.message}</p>
            </div>

            {inq.admin_reply && (
              <div className="reply-box">
                <p className="reply-label">Admin Reply</p>
                <p style={{ color: "var(--text)", lineHeight: 1.7 }}>{inq.admin_reply}</p>
              </div>
            )}

            {inq.status !== "answered" && (
              selected === inq.id ? (
                <div className="admin-reply-form">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                  />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button className="btn btn-primary" onClick={() => handleReply(inq.id)} disabled={replying}>
                      {replying ? "Sending..." : "Send Reply"}
                    </button>
                    <button className="btn" onClick={() => { setSelected(null); setReply(""); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn"
                  style={{ marginTop: "0.75rem" }}
                  onClick={() => { setSelected(inq.id); setReply(""); }}
                >
                  Reply
                </button>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
}
