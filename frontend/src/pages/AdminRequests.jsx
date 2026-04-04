import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const FILTERS = ["All", "Pending", "Approved", "Rejected", "In Progress"];

const statusCfg = {
    Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    Approved: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    Rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    "In Progress": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

export default function AdminRequests({ setIsLoggedIn }) {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");


    const fetchRequests = useCallback(() => {
        setLoading(true);
        axios.get(`${API_BASE}/requests`, { headers: authHeaders() })
            .then(r => setRequests(Array.isArray(r.data) ? r.data : []))
            .catch(() => setRequests([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const filtered = filter === "All"
        ? requests
        : requests.filter(r => r.status === filter);

    const counts = {
        All: requests.length,
        Pending: requests.filter(r => r.status === "Pending").length,
        Approved: requests.filter(r => r.status === "Approved").length,
        Rejected: requests.filter(r => r.status === "Rejected").length,
        "In Progress": requests.filter(r => r.status === "In Progress").length,
    };

    return (
        <div className="dashboard-wrapper">
            <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

                <div className="dashboard-content tpd-page">

                    {/* ── Page Header ── */}
                    <div className="ar-page-header">
                        <div>
                            <h1 className="ar-title">Technician Requests</h1>
                            <p className="ar-subtitle">Review and respond to asset requests submitted by technicians.</p>
                        </div>
                        <button className="tpd-btn tpd-btn-sm" onClick={fetchRequests}>↻ Refresh</button>
                    </div>

                    {/* ── Filter Tabs ── */}
                    <div className="ar-filter-row">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                className={`ar-filter-tab ${filter === f ? "ar-filter-active" : ""}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                                <span className="ar-filter-count">{counts[f]}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Request List + Detail Panel ── */}
                    <div className="ar-layout">

                        {/* List */}
                        <div className="ar-list-col">
                            {loading ? (
                                <div className="tpd-empty">Loading requests…</div>
                            ) : filtered.length === 0 ? (
                                <div className="tpd-empty">
                                    <EmptyInboxSvg />
                                    <p>No {filter !== "All" ? filter.toLowerCase() : ""} requests found.</p>
                                </div>
                            ) : (
                                filtered.map(req => {
                                    const sc = statusCfg[req.status] || { color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
                                    return (
                                        <div
                                            key={req._id}
                                            className="ar-item"
                                            onClick={() => navigate(`/admin/requests/${req._id}`)}
                                        >
                                            <div className={`ar-item-icon ${req.type === "Damage Report" ? "ar-icon-damage" : "ar-icon-asset"}`}>
                                                {req.type === "Damage Report" ? <DamageSvg /> : <BoxSvg />}
                                            </div>
                                            <div className="ar-item-body">
                                                <span className="ar-item-type">{req.type}</span>
                                                <span className="ar-item-name">{req.assetName}</span>
                                                <span className="ar-item-tech">
                                                    {req.technicianId?.name || "Technician"} · {new Date(req.createdAt).toLocaleDateString("en-IN")}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span className="ar-item-status" style={{ color: sc.color, background: sc.bg }}>
                                                    {req.status}
                                                </span>
                                                <span className="tpd-muted" style={{ fontSize: "18px" }}>›</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}

/* ── Helpers ── */
const DamageSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const BoxSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
const EmptyInboxSvg = () => <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
