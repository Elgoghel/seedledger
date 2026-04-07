import { useState, useEffect } from "react";
import { fetchRuns } from "../api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

function MetricBadge({ value, good, warn, pct }) {
  let cls = "metric";
  if (good !== undefined) {
    cls += value >= good ? " metric-good" : value >= (warn || 0) ? " metric-warn" : " metric-bad";
  } else { cls += " metric-good"; }
  const display = pct ? `${value}%` : typeof value === "number" ? value.toFixed(3) : value;
  return <span className={cls}>{display}</span>;
}

export default function Results() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ config: "", seed: "", period: "" });

  const load = () => { setLoading(true); fetchRuns(filters).then((d) => { setRuns(d); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const periods = [...new Set(runs.map((r) => r.period))];

  // Chart: Sharpe by seed
  const chartData = runs
    .filter((r) => r.metrics?.sharpe != null)
    .map((r) => ({ seed: `S${r.seed}`, sharpe: r.metrics.sharpe }))
    .sort((a, b) => a.sharpe - b.sharpe);

  // Summary stats
  const sharpes = runs.map((r) => r.metrics?.sharpe).filter(Boolean).sort((a, b) => a - b);
  const median = sharpes.length ? sharpes[Math.floor(sharpes.length / 2)] : null;
  const best = sharpes.length ? sharpes[sharpes.length - 1] : null;
  const worst = sharpes.length ? sharpes[0] : null;

  return (
    <div className="page">
      <h1 className="page-title">Experiment Results</h1>
      <p className="page-subtitle">All 28 pre-registered seed runs. ITT protocol: zero exclusions.</p>

      {median !== null && (
        <div className="highlights-grid" style={{ marginBottom: "1.5rem" }}>
          <div className="highlight-card"><span className="highlight-value metric-good">{median.toFixed(2)}</span><span className="highlight-desc">Median Sharpe</span></div>
          <div className="highlight-card"><span className="highlight-value metric-good">{best.toFixed(2)}</span><span className="highlight-desc">Best Seed</span></div>
          <div className="highlight-card"><span className="highlight-value metric-bad">{worst.toFixed(2)}</span><span className="highlight-desc">Worst Seed</span></div>
          <div className="highlight-card"><span className="highlight-value metric-good">{runs.length}</span><span className="highlight-desc">Total Seeds</span></div>
        </div>
      )}

      <div className="filters">
        <input type="number" placeholder="Seed" value={filters.seed} onChange={(e) => setFilters({ ...filters, seed: e.target.value })} style={{ width: 120 }} />
        <select value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>
          <option value="">All Periods</option>
          {periods.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn" onClick={load}>Apply</button>
      </div>

      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 className="card-title" style={{ marginBottom: "1rem" }}>Sharpe Ratio by Seed (sorted)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="seed" stroke="#8888aa" fontSize={11} angle={-45} textAnchor="end" height={50} />
              <YAxis stroke="#8888aa" fontSize={12} />
              <Tooltip contentStyle={{ background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e8e8ee" }} />
              <Bar dataKey="sharpe" radius={[4, 4, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.sharpe >= 2 ? "#69f0ae" : e.sharpe >= 1.5 ? "#ffe66d" : "#ff6b6b"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : runs.length === 0 ? (
        <div className="card"><p style={{ color: "var(--text-dim)" }}>No runs found. Seed the database first.</p></div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="results-table">
            <thead><tr><th>Seed</th><th>Period</th><th>Sharpe</th><th>CAGR</th><th>Max DD</th><th>Win Rate</th><th>Trades</th><th>Notes</th></tr></thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{r.seed}</td>
                  <td>{r.period}</td>
                  <td>{r.metrics?.sharpe != null && <MetricBadge value={r.metrics.sharpe} good={2.0} warn={1.5} />}</td>
                  <td>{r.metrics?.cagr_pct != null && <MetricBadge value={r.metrics.cagr_pct} good={30} warn={20} pct />}</td>
                  <td>{r.metrics?.max_dd != null && <MetricBadge value={r.metrics.max_dd} good={0} warn={0.15} />}</td>
                  <td>{r.metrics?.win_rate != null && <MetricBadge value={r.metrics.win_rate} good={0.55} warn={0.5} />}</td>
                  <td>{r.metrics?.n_trades}</td>
                  <td style={{ color: "var(--text-dim)", fontSize: "0.85rem", maxWidth: 200 }}>{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
