import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API_BASE from "../config/api";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const urgencyColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const statusCfg = {
    Pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    Approved: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    Rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
    "In Progress": { color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
};

export default function AdminRequestDetails({ setIsLoggedIn }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminNotes, setAdminNotes] = useState("");
    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_BASE}/requests`, { headers: authHeaders() })
            .then(r => {
                const found = r.data.find(req => req._id === id);
                if (found) {
                    setRequest(found);
                    setAdminNotes(found.adminNotes || "");
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const updateStatus = async (status) => {
        setUpdating(true);
        try {
            await axios.put(
                `${API_BASE}/requests/${id}/status`,
                { status, adminNotes },
                { headers: authHeaders() }
            );
            showToast(`Request marked as "${status}" successfully.`);
            setTimeout(() => navigate("/admin/requests"), 2000);
        } catch (err) {
            showToast(err.response?.data?.message || "Update failed.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="dashboard-wrapper">
            <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />
                <div className="dashboard-content tpd-page"><div className="tpd-empty">Loading details…</div></div>
            </div>
        </div>
    );

    if (!request) return (
        <div className="dashboard-wrapper">
            <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />
                <div className="dashboard-content tpd-page"><div className="tpd-empty">Request not found.</div></div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

                <div className="dashboard-content rf-page">
                    <button className="tpd-back-btn" onClick={() => navigate("/admin/requests")}>
                        <BackSvg /> Back to Requests
                    </button>

                    <div className="rf-card">
                        <div className="rf-header">
                            <div className={`rf-header-icon ${request.type === "Damage Report" ? "ar-icon-damage" : "ar-icon-asset"}`}>
                                {request.type === "Damage Report" ? <DamageSvg /> : <BoxSvg />}
                            </div>
                            <div>
                                <h1 className="rf-title">{request.type}</h1>
                                <p className="rf-subtitle">From: <strong>{request.technicianId?.name || "Technician"}</strong> ({request.technicianId?.techId || "T-ID"})</p>
                            </div>
                        </div>

                        <div className="rf-form">
                            <div className="ar-info-section" style={{ border: "none", padding: 0 }}>
                                <h3 className="ar-section-label">Request Details</h3>
                                <div className="ar-info-grid" style={{ gridTemplateColumns: "1fr 1fr", display: "grid", gap: "20px 40px" }}>
                                    <InfoRow label="Asset Name" value={request.assetName} />
                                    <InfoRow label="Location" value={request.location} />
                                    <InfoRow label="Asset ID" value={request.assetId || "—"} />
                                    <InfoRow label="Urgency" value={request.urgency} valueColor={urgencyColor[request.urgency]} />
                                    <InfoRow label="Status" value={request.status} valueColor={statusCfg[request.status]?.color} />
                                    <InfoRow label="Submitted" value={new Date(request.createdAt).toLocaleString("en-IN")} />
                                </div>
                                <div className="ar-desc-box" style={{ marginTop: "24px" }}>
                                    <span className="ar-desc-label">Technician's Description</span>
                                    <p className="ar-desc-text">{request.description}</p>
                                </div>
                            </div>

                            <div className="ar-notes-section" style={{ border: "none", padding: "24px 0 0" }}>
                                <h3 className="ar-section-label">Admin Response & Notes</h3>
                                <textarea
                                    className="ar-notes-input"
                                    rows="4"
                                    placeholder="Add notes for the technician…"
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                />
                            </div>

                            <div className="ar-actions" style={{ padding: "24px 0 0", borderTop: "1px solid var(--divider)" }}>
                                <button
                                    className="ar-action-btn ar-approve"
                                    disabled={updating || request.status === "Approved"}
                                    onClick={() => updateStatus("Approved")}
                                >
                                    <CheckSvg /> Approve Request
                                </button>
                                <button
                                    className="ar-action-btn ar-reject"
                                    disabled={updating || request.status === "Rejected"}
                                    onClick={() => updateStatus("Rejected")}
                                >
                                    <CrossSvg /> Reject Request
                                </button>
                                <button
                                    className="ar-action-btn ar-progress"
                                    disabled={updating || request.status === "In Progress"}
                                    onClick={() => updateStatus("In Progress")}
                                >
                                    <HoldSvg /> Mark In Progress
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <div className="ar-toast">{toast}</div>}
        </div>
    );
}

function InfoRow({ label, value, valueColor }) {
    return (
        <div className="ar-info-row" style={{ justifyContent: "flex-start", gap: "20px" }}>
            <span className="ar-info-label" style={{ width: "120px" }}>{label}:</span>
            <span className="ar-info-value" style={valueColor ? { color: valueColor, fontWeight: 700 } : {}}>{value}</span>
        </div>
    );
}

const BackSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const DamageSvg = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const BoxSvg = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
const CheckSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const CrossSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const HoldSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
