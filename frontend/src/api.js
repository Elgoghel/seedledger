const BASE = "";

export async function fetchStory() {
  const res = await fetch(`${BASE}/api/story`);
  return res.json();
}

export async function fetchRuns({ config, seed, period } = {}) {
  const params = new URLSearchParams();
  if (config) params.set("config", config);
  if (seed !== undefined && seed !== "") params.set("seed", seed);
  if (period) params.set("period", period);
  const res = await fetch(`${BASE}/api/runs?${params}`);
  return res.json();
}

export async function fetchFaq() {
  const res = await fetch(`${BASE}/api/faq`);
  return res.json();
}

export async function submitInquiry(data) {
  const res = await fetch(`${BASE}/api/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Failed to submit inquiry");
  }
  return res.json();
}

export async function trackInquiry(token) {
  const res = await fetch(`${BASE}/inquiry/${token}`);
  if (!res.ok) throw new Error("Inquiry not found");
  return res.json();
}

export async function fetchMyInquiriesByKey(accessKey) {
  const res = await fetch(`${BASE}/api/my-inquiries?key=${encodeURIComponent(accessKey)}`);
  if (!res.ok) throw new Error("Lookup failed");
  return res.json();
}

// --- Admin endpoints (require X-Admin-Key header) ---

function adminHeaders(key) {
  return { "Content-Type": "application/json", "X-Admin-Key": key };
}

export async function fetchAdminInquiries(adminKey) {
  const res = await fetch(`${BASE}/admin/inquiries`, {
    headers: adminHeaders(adminKey),
  });
  if (res.status === 403) throw new Error("Invalid admin key");
  if (!res.ok) throw new Error("Failed to fetch inquiries");
  return res.json();
}

export async function replyToInquiry(adminKey, id, reply) {
  const res = await fetch(`${BASE}/admin/inquiries/${id}`, {
    method: "PATCH",
    headers: adminHeaders(adminKey),
    body: JSON.stringify({ admin_reply: reply, status: "answered" }),
  });
  if (res.status === 403) throw new Error("Invalid admin key");
  if (!res.ok) throw new Error("Failed to reply");
  return res.json();
}

export async function deleteInquiry(adminKey, id) {
  const res = await fetch(`${BASE}/admin/inquiries/${id}`, {
    method: "DELETE",
    headers: adminHeaders(adminKey),
  });
  if (res.status === 403) throw new Error("Invalid admin key");
  if (!res.ok) throw new Error("Failed to delete");
}
