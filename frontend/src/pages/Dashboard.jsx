import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../App.css";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API_BASE from "../config/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// SVG Icons
const Icons = {
  Total: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
  ),
  Available: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
  ),
  InUse: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  Maintenance: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
  ),
  Damaged: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  ),
  Role: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
  ),
  // Category Icons
  Infrastructure: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" /></svg>
  ),
  IT: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
  ),
  Lab: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31" /><path d="M14 2v7.31" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.52 16h12.96" /></svg>
  ),
  Furniture: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M6 20V10" /><path d="M18 14H6" /><path d="M18 10V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6" /></svg>
  ),
  Library: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  ),
  Vehicles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.3C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
  ),
  General: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  )
};

const getCategoryIcon = (catName) => {
  const name = (catName || "").toLowerCase();

  // Specific checks first to avoid overlaps (e.g., 'furniture' containing 'it')
  if (name.includes("lab")) return <Icons.Lab />;
  if (name.includes("furnit")) return <Icons.Furniture />;
  if (name.includes("vehic")) return <Icons.Vehicles />;
  if (name.includes("infra")) return <Icons.Infrastructure />;
  if (name.includes("librar")) return <Icons.Library />;

  // IT check - uses regex boundary to avoid matching words containing 'it'
  if (name.match(/\bit\b/) || name.includes("computer") || name.includes("equip")) return <Icons.IT />;

  return <Icons.General />;
};

export default function Dashboard({ setIsLoggedIn }) {
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0, damaged: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [byCategory, setByCategory] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get(`${API_BASE}/assets/stats`, { headers: authHeaders() })
      .then((res) => setStats(res.data))
      .catch(() => setStats({ total: 0, available: 0, inUse: 0, maintenance: 0, damaged: 0 }))
      .finally(() => setStatsLoading(false));

    axios.get(`${API_BASE}/assets/by-category`, { headers: authHeaders() })
      .then((res) => setByCategory(res.data))
      .catch(() => setByCategory([]))
      .finally(() => setCategoryLoading(false));

    axios.get(`${API_BASE}/assets/activity/log?limit=10`, { headers: authHeaders() })
      .then((res) => setActivityLog(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActivityLog([]));
  }, []);

  const statusItems = useMemo(() => [
    { key: "available", label: "Available", value: stats.available, color: "var(--accent-blue)" },
    { key: "inUse", label: "In Use", value: stats.inUse, color: "var(--accent-cyan)" },
    { key: "maintenance", label: "Maintenance", value: stats.maintenance, color: "#f59e0b" },
    { key: "damaged", label: "Damaged", value: stats.damaged, color: "#ef4444" },
  ], [stats]);

  return (
    <div className="dashboard-wrapper">
      <Topbar title="Campus Asset Management System" setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="dashboard-layout">
        <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

        <div className="dashboard-content">
          <h2 className="page-title">Dashboard Overview</h2>



          <div className="dashboard-two-col-main">
            <div className="dashboard-section bar-chart-section">
              <h3 className="section-title">Asset Distribution</h3>

              {/* Total Assets summary row */}
              <div className="chart-total-row">
                <div className="chart-total-icon"><Icons.Total /></div>
                <span className="chart-total-label">Total Assets</span>
                <span className="chart-total-value">{statsLoading ? "…" : stats.total}</span>
              </div>

              {/* Stats legend strip */}
              <div className="chart-legend-strip">
                {[
                  { label: "Available", value: stats.available, color: "var(--accent-green)", Icon: Icons.Available },
                  { label: "In Use", value: stats.inUse, color: "var(--accent-cyan)", Icon: Icons.InUse },
                  { label: "Maintenance", value: stats.maintenance, color: "#f59e0b", Icon: Icons.Maintenance },
                  { label: "Damaged", value: stats.damaged, color: "#ef4444", Icon: Icons.Damaged },
                ].map(({ label, value, color, Icon }) => (
                  <div key={label} className="legend-chip">
                    <span className="legend-chip-icon" style={{ color }}><Icon /></span>
                    <span className="legend-chip-label">{label}</span>
                    <span className="legend-chip-val" style={{ color }}>{statsLoading ? "…" : value}</span>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="chart-outer">
                <div className="chart-y-axis">
                  <span className="y-axis-title">No. of Assets</span>
                </div>
                <div className="chart-body">
                  <div className="bar-graph-container-high">
                    {statusItems.map(({ key, label, value, color }) => {
                      const maxVal = Math.max(...statusItems.map((s) => s.value), 1);
                      const barHeight = (value / maxVal) * 100;
                      return (
                        <div key={key} className="high-bar-item">
                          <span className="bar-value-top" style={{ color }}>{value}</span>
                          <div className="high-bar-wrapper">
                            <div className="high-bar-main" style={{ height: `${barHeight}%`, backgroundColor: color }}>
                              <div className="high-bar-tip" />
                            </div>
                          </div>
                          <span className="high-bar-label">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="x-axis-title">Status</div>
                </div>
              </div>
            </div>

            <div className="dashboard-section recent-activity-section">
              <h3 className="section-title">Recent Activity</h3>
              <div className="activity-list-modern">
                {activityLog.slice(0, 6).map((log) => {
                  const actionKey = (log.action || "").toLowerCase();
                  const actionConfig = {
                    created: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
                    updated: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> },
                    deleted: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg> },
                  };
                  const cfg = actionConfig[actionKey] || { color: "#a855f7", bg: "rgba(168,85,247,0.12)", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> };
                  return (
                    <div key={log._id} className="activity-row-modern">
                      <div className="activity-icon-badge" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.icon}
                      </div>
                      <div className="activity-info">
                        <span className="activity-msg-modern">
                          <strong style={{ color: cfg.color, textTransform: "capitalize" }}>{log.action}</strong>{" "}{log.assetName || log.assetId}
                        </span>
                        <span className="activity-meta-modern">by {log.userName} • {new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assets by Category */}
          <div className="dashboard-section">
            <h3 className="section-title">Assets by Category</h3>
            {categoryLoading ? (
              <p className="loading-text">Loading categories…</p>
            ) : byCategory.length === 0 ? (
              <p className="loading-text">No categories found.</p>
            ) : (
              <div className="cat-list">
                {byCategory.map((cat, i) => (
                  <div key={cat.category || i} className="cat-row">
                    <div className="cat-icon-modern">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <div className="cat-info">
                      <span className="cat-name">{cat.category || "Uncategorized"}</span>
                      <span className="cat-count-sub">{cat.count} total items</span>
                    </div>
                    <span className="cat-badge">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
