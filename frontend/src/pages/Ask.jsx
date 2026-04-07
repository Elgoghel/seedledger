import { useState } from "react";
import { Link } from "react-router-dom";
import { submitInquiry } from "../api";

export default function Ask() {
  const [form, setForm] = useState({ name: "", email: "", category: "general", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await submitInquiry(form);
      // Auto-save to localStorage so user never loses their token
      const saved = JSON.parse(localStorage.getItem("my_inquiries") || "[]");
      saved.push({
        token: data.tracking_token,
        category: form.category,
        name: form.name,
        date: new Date().toISOString(),
      });
      localStorage.setItem("my_inquiries", JSON.stringify(saved));
      // Save access key for secure dashboard access (keyed hash of email)
      if (data.access_key) {
        localStorage.setItem("sl_access_key", data.access_key);
      }
      setResult(data);
    } catch (err) { setError(err.message || "Failed to submit. Check your inputs and try again."); }
    finally { setSubmitting(false); }
  };

  if (result) {
    return (
      <div className="page">
        <h1 className="page-title">Inquiry Submitted</h1>
        <div className="token-box">
          <p style={{ color: "var(--success)", fontSize: "1rem" }}>
            Your inquiry has been submitted successfully.
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: "0.75rem" }}>
            View all your inquiries on the{" "}
            <Link to={`/my-inquiries?key=${result.access_key}`}>My Inquiries</Link> page.
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <button className="btn" onClick={() => { setResult(null); setForm({ name: "", email: "", category: "general", message: "" }); }}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Ask a Question</h1>
      <p className="page-subtitle">Submit an inquiry and get a unique tracking link to check the response.</p>
      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="collaboration">Collaboration</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What would you like to know?" />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Inquiry"}</button>
        </form>
      </div>
    </div>
  );
}
