import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../App.css";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API_BASE from "../config/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Tiny SVG icons ── */
const TotalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);
const InUseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const AvailableIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const CatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* Status pill colours */
const statusColor = {
  Available: "#22c55e",
  "In Use": "#3b82f6",
  Maintenance: "#f59e0b",
  Damaged: "#ef4444",
};

/* Category dot palette */
const dotPalette = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#06b6d4", "#ef4444", "#ec4899"];

export default function Dashboard({ setIsLoggedIn }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0, damaged: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [byCategory, setByCategory] = useState([]);
  const [recentAssets, setRecentAssets] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get(`${API_BASE}/api/assets/stats`, { headers: authHeaders() })
      .then((r) => setStats(r.data))
      .catch(() => { })
      .finally(() => setStatsLoading(false));

    axios.get(`${API_BASE}/api/assets/by-category`, { headers: authHeaders() })
      .then((r) => setByCategory(Array.isArray(r.data) ? r.data : []))
      .catch(() => setByCategory([]));

    axios.get(`${API_BASE}/api/assets`, { headers: authHeaders() })
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.assets || []);
        setRecentAssets(list.slice(0, 5));
      })
      .catch(() => setRecentAssets([]));

    axios.get(`${API_BASE}/api/assets/activity/log?limit=6`, { headers: authHeaders() })
      .then((r) => setActivityLog(Array.isArray(r.data) ? r.data : []))
      .catch(() => setActivityLog([]));
  }, []);

  /* Bar chart data */
  const statusItems = useMemo(() => [
    { key: "available", label: "Available", value: stats.available, color: "#22c55e", Icon: AvailableIcon },
    { key: "inUse", label: "In Use", value: stats.inUse, color: "#3b82f6", Icon: InUseIcon },
    { key: "maintenance", label: "Maintenance", value: stats.maintenance, color: "#f59e0b", Icon: InUseIcon }, // Can use specialized maintenance icon if available, reusing InUse as fallback
    { key: "damaged", label: "Damaged", value: stats.damaged, color: "#ef4444", Icon: TotalIcon }, // Reusing TotalIcon or similar
  ], [stats]);

  const maxBarVal = Math.max(...statusItems.map((s) => s.value), 1);

  /* Activity icon colours */
  const actCfg = {
    created: { color: "#22c55e", label: "Created" },
    updated: { color: "#3b82f6", label: "Updated" },
    deleted: { color: "#ef4444", label: "Deleted" },
  };

  const statCards = [
    { label: "Total Assets", value: stats.total, Icon: TotalIcon, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
    { label: "In Use", value: stats.inUse, Icon: InUseIcon, color: "#06b6d4", bg: "rgba(6,182,212,0.12)" },
    { label: "Available", value: stats.available, Icon: AvailableIcon, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { label: "Categories", value: byCategory.length, Icon: CatIcon, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  ];

  return (
    <div className="dashboard-wrapper">
      <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="dashboard-layout">
        <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

        <div className="dashboard-content">

          {/* ── Page header ── */}
          <div className="dash-header">
            <div>
              <h2 className="page-title">Dashboard</h2>
              <p className="dash-subtitle">Overview of campus asset management system.</p>
            </div>
            <a href="/assets/add" className="btn-add-asset">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Asset
            </a>
          </div>

          {/* ── Stat cards ── */}
          <div className="stat-cards-row">
            {statCards.map(({ label, value, Icon, color, bg }) => (
              <div className="stat-card-new" key={label}>
                <div className="stat-card-icon" style={{ background: bg, color }}>
                  <Icon />
                </div>
                <div className="stat-card-info">
                  <span className="stat-card-num">{statsLoading ? "…" : value}</span>
                  <span className="stat-card-lbl">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Two-col: Recent Assets | By Category ── */}
          <div className="dash-two-col">

            {/* Recent Assets */}
            <div className="dash-panel">
              <div className="dash-panel-head">
                <span className="dash-panel-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 7 }}>
                    <polyline points="13 2 13 9 20 9" /><path d="M20 14v7H4V3h9" />
                  </svg>
                  Recent Assets
                </span>
                <a href="/assets/list" className="dash-view-all">View All →</a>
              </div>
              <div className="recent-asset-list">
                {recentAssets.length === 0 ? (
                  <p className="dash-empty">No assets found.</p>
                ) : recentAssets.map((a) => (
                  <div className="recent-asset-row" key={a._id}>
                    <div className="ra-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <div className="ra-info">
                      <span className="ra-name">{a.assetId ? `${a.assetId} – ` : ""}{a.name}</span>
                      <span className="ra-meta">{a.category} {a.location ? `• ${a.location}` : ""}</span>
                    </div>
                    <span
                      className="ra-status"
                      style={{
                        background: `${statusColor[a.status] || "#94a3b8"}20`,
                        color: statusColor[a.status] || "#94a3b8",
                        border: `1px solid ${statusColor[a.status] || "#94a3b8"}40`,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Category */}
            <div className="dash-panel">
              <div className="dash-panel-head">
                <span className="dash-panel-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" style={{ marginRight: 7 }}>
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  By Category
                </span>
              </div>
              <div className="cat-dot-list">
                {byCategory.length === 0 ? (
                  <p className="dash-empty">No categories yet.</p>
                ) : byCategory.map((cat, i) => (
                  <div className="cat-dot-row" key={cat.category || i}>
                    <span className="cat-dot" style={{ background: dotPalette[i % dotPalette.length] }} />
                    <span className="cat-dot-name">{cat.category || "Uncategorized"}</span>
                    <span className="cat-dot-count">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bar Chart (kept) ── */}
          <div className="dash-panel bar-chart-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-title">Asset Distribution Status</span>
              <div className="chart-legend-strip">
                {statusItems.map(({ label, value, color, Icon }) => (
                  <div key={label} className="legend-chip">
                    <div className="legend-chip-icon" style={{ color }}><Icon /></div>
                    <div className="legend-chip-text">
                      <span className="legend-chip-label">{label}</span>
                      <span className="legend-chip-val" style={{ color }}>{statsLoading ? "…" : value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-main-structure">
              <div className="y-axis-label">Count</div>
              <div className="bar-graph-container-high">
                {statusItems.map(({ key, label, value, color }) => (
                  <div key={key} className="high-bar-item">
                    <span className="bar-value-top" style={{ color }}>{value}</span>
                    <div className="high-bar-wrapper">
                      <div
                        className="high-bar-main"
                        style={{ height: `${(value / maxBarVal) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}88)` }}
                      />
                    </div>
                    <span className="high-bar-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="x-axis-label">Status</div>
          </div>

          {/* ── Recent Activity ── */}
          <div className="dash-panel">
            <div className="dash-panel-head">
              <span className="dash-panel-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" style={{ marginRight: 7 }}>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Recent Activity
              </span>
            </div>
            <div className="activity-list-new">
              {activityLog.length === 0 ? (
                <p className="dash-empty">No activity yet.</p>
              ) : activityLog.map((log) => {
                const cfg = actCfg[(log.action || "").toLowerCase()] || { color: "#a855f7", label: log.action };
                const d = new Date(log.createdAt);
                return (
                  <div className="activity-row-new" key={log._id}>
                    <span className="activity-action-badge" style={{ color: cfg.color, background: `${cfg.color}18` }}>
                      {cfg.label}
                    </span>
                    <span className="activity-asset-name">{log.assetName || log.assetId || "—"}</span>
                    <div className="activity-time-pills">
                      <span className="time-pill date-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="time-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
