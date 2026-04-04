import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API_BASE from "../config/api";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const urgencyColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const statusConfig = {
    Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    Approved: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    Rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    "In Progress": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

export default function TechnicianDashboard({ setIsLoggedIn }) {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === "Pending").length,
        approved: requests.filter(r => r.status === "Approved").length,
        rejected: requests.filter(r => r.status === "Rejected").length,
    };

    useEffect(() => {
        axios.get(`${API_BASE}/requests`, { headers: authHeaders() })
            .then(r => setRequests(Array.isArray(r.data) ? r.data : []))
            .catch(() => setRequests([]))
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { label: "Total Requests", value: stats.total, color: "#6a11cb", bg: "rgba(106,17,203,0.12)", icon: <RequestsIcon /> },
        { label: "Pending Review", value: stats.pending, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <PendingIcon /> },
        { label: "Approved", value: stats.approved, color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: <CheckIcon /> },
        { label: "Rejected", value: stats.rejected, color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: <RejectIcon /> },
    ];

    return (
        <div className="dashboard-wrapper">
            <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

                <div className="dashboard-content tpd-page">

                    {/* ── Header ── */}
                    <div className="tpd-header">
                        <div>
                            <h1 className="tpd-welcome">
                                Welcome back, <span className="tpd-name">{user.fullName || user.name || "Technician"}</span> 🛠️
                            </h1>
                            <p className="tpd-sub">
                                Department: <strong>{user.dept || "Campus"}</strong> &nbsp;•&nbsp; {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        <div className="tpd-actions">
                            <button className="tpd-btn tpd-btn-primary" onClick={() => navigate("/technician/request", { state: { type: "Damage Report" } })}>
                                <AlertSvg /> Report Damage
                            </button>
                            <button className="tpd-btn tpd-btn-secondary" onClick={() => navigate("/technician/request", { state: { type: "New Asset" } })}>
                                <PlusSvg /> Request Asset
                            </button>
                        </div>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="tpd-stats-row">
                        {statCards.map(({ label, value, color, bg, icon }) => (
                            <div className="tpd-stat-card" key={label}>
                                <div className="tpd-stat-icon" style={{ background: bg, color }}>{icon}</div>
                                <div className="tpd-stat-body">
                                    <span className="tpd-stat-num" style={{ color }}>{loading ? "…" : value}</span>
                                    <span className="tpd-stat-lbl">{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Request History ── */}
                    <div className="tpd-card">
                        <div className="tpd-card-head">
                            <span className="tpd-card-title"><InboxSvg /> My Request History</span>
                            <button
                                className="tpd-btn tpd-btn-sm"
                                onClick={() => navigate("/technician/request")}
                            >+ New Request</button>
                        </div>

                        {loading ? (
                            <div className="tpd-empty">Loading requests…</div>
                        ) : requests.length === 0 ? (
                            <div className="tpd-empty">
                                <EmptyIllustrationSvg />
                                <p>No requests yet. Use the buttons above to get started!</p>
                            </div>
                        ) : (
                            <div className="tpd-table-wrapper">
                                <table className="tpd-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Asset Name</th>
                                            <th>Location</th>
                                            <th>Asset ID</th>
                                            <th>Urgency</th>
                                            <th>Status</th>
                                            <th>Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.map(req => {
                                            const sc = statusConfig[req.status] || { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
                                            const uc = urgencyColor[req.urgency] || "#94a3b8";
                                            return (
                                                <tr key={req._id}>
                                                    <td>
                                                        <span className="tpd-type-badge">
                                                            {req.type === "Damage Report" ? <AlertSvg /> : <BoxSvg />}
                                                            {req.type}
                                                        </span>
                                                    </td>
                                                    <td className="tpd-asset-name">{req.assetName}</td>
                                                    <td>{req.location}</td>
                                                    <td className="tpd-muted">{req.assetId || "—"}</td>
                                                    <td>
                                                        <span className="tpd-urgency-dot" style={{ background: uc }} />
                                                        <span style={{ color: uc, fontWeight: 600 }}>{req.urgency}</span>
                                                    </td>
                                                    <td>
                                                        <span className="tpd-status-pill" style={{ color: sc.color, background: sc.bg }}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="tpd-muted">
                                                        {new Date(req.createdAt).toLocaleDateString("en-IN")}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

/* ── Inline SVGs ── */
const AlertSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const PlusSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const CheckIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const RejectIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const PendingIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const RequestsIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const InboxSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a11cb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 7 }}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
const BoxSvg = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
const EmptyIllustrationSvg = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        <line x1="6" y1="12" x2="6.01" y2="12" /><line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);
