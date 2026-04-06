import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API_BASE from "../config/api";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function RequestForm({ setIsLoggedIn }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        type: location.state?.type || "Damage Report",
        assetName: "",
        assetId: "",
        location: "",
        description: "",
        urgency: "Medium",
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await axios.post(`${API_BASE}/api/requests`, form, { headers: authHeaders() });
            setSuccess("Request submitted successfully! Redirecting to dashboard…");
            setTimeout(() => navigate("/technician/dashboard"), 2200);
        } catch (err) {
            setError(err.response?.data?.message || "Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Topbar setIsLoggedIn={setIsLoggedIn} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

                <div className="dashboard-content rf-page">

                    {/* ── Back button ── */}
                    <button className="tpd-back-btn" onClick={() => navigate(-1)}>
                        <BackSvg /> Back to Dashboard
                    </button>

                    <div className="rf-card">

                        {/* ── Card header ── */}
                        <div className="rf-header">
                            <div className="rf-header-icon">
                                {form.type === "Damage Report" ? <DamageSvgLg /> : <AssetSvgLg />}
                            </div>
                            <div>
                                <h1 className="rf-title">Submit Service Request</h1>
                                <p className="rf-subtitle">Use this form to report damaged assets or request new equipment for your lab.</p>
                            </div>
                        </div>

                        {/* ── Feedback banners ── */}
                        {success && <div className="rf-banner rf-banner-success"><SuccessSvg />{success}</div>}
                        {error && <div className="rf-banner rf-banner-error"><ErrorSvg />{error}</div>}

                        <form onSubmit={handleSubmit} className="rf-form">

                            {/* Request Type */}
                            <div className="rf-field">
                                <label className="rf-label">Request Type</label>
                                <div className="rf-type-grid">
                                    <button
                                        type="button"
                                        className={`rf-type-card ${form.type === "Damage Report" ? "rf-type-active" : ""}`}
                                        onClick={() => setForm(p => ({ ...p, type: "Damage Report" }))}
                                    >
                                        <span className="rf-type-icon"><DamageSvg /></span>
                                        <span className="rf-type-name">Damage Report</span>
                                        <span className="rf-type-desc">Asset is damaged or broken</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`rf-type-card ${form.type === "New Asset" ? "rf-type-active" : ""}`}
                                        onClick={() => setForm(p => ({ ...p, type: "New Asset" }))}
                                    >
                                        <span className="rf-type-icon"><NewAssetSvg /></span>
                                        <span className="rf-type-name">New Asset Request</span>
                                        <span className="rf-type-desc">Request new equipment for lab</span>
                                    </button>
                                </div>
                            </div>

                            {/* Asset Row */}
                            <div className="rf-row">
                                <div className="rf-field">
                                    <label className="rf-label">Asset Name <span className="rf-required">*</span></label>
                                    <input className="rf-input" name="assetName" placeholder='e.g. Dell Monitor 24"' value={form.assetName} onChange={handleChange} required />
                                </div>
                                <div className="rf-field">
                                    <label className="rf-label">Asset ID <span className="rf-optional">(optional)</span></label>
                                    <input className="rf-input" name="assetId" placeholder="e.g. AST-405" value={form.assetId} onChange={handleChange} />
                                </div>
                            </div>

                            {/* Location Row */}
                            <div className="rf-field">
                                <label className="rf-label">Target Location / Lab <span className="rf-required">*</span></label>
                                <input
                                    className="rf-input"
                                    name="location"
                                    placeholder="e.g. Computer Lab 1, Block B - 2nd Floor"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Urgency */}
                            <div className="rf-field">
                                <label className="rf-label">Urgency Level</label>
                                <div className="rf-urgency-row">
                                    {["Low", "Medium", "High"].map(lvl => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            className={`rf-urgency-btn rf-urgency-${lvl.toLowerCase()} ${form.urgency === lvl ? "rf-urgency-active" : ""}`}
                                            onClick={() => setForm(p => ({ ...p, urgency: lvl }))}
                                        >
                                            <UrgencyDot level={lvl} /> {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="rf-field">
                                <label className="rf-label">Description &amp; Details <span className="rf-required">*</span></label>
                                <textarea
                                    className="rf-textarea"
                                    name="description"
                                    rows="4"
                                    placeholder="Describe the issue in detail: what happened, when it was noticed, and any relevant asset information…"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                                <span className="rf-char-hint">{form.description.length} / 500 characters</span>
                            </div>

                            {/* Submit */}
                            <div className="rf-actions">
                                <button type="button" className="rf-cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                                <button type="submit" className="rf-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <><SpinnerSvg /> Submitting…</>
                                    ) : (
                                        <><SendSvg /> Submit Request</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── inline SVGs ── */
const BackSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const DamageSvg = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const NewAssetSvg = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const DamageSvgLg = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const AssetSvgLg = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const SendSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const SuccessSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const ErrorSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const SpinnerSvg = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" style={{ animation: "spin 1s linear infinite" }} /></svg>;

const UrgencyDot = ({ level }) => {
    const c = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" }[level];
    return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, marginRight: 6 }} />;
};
