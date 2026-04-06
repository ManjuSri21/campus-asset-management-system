import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../config/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const AdminIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const StaffIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export default function Users({ setIsLoggedIn }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [stats, setStats] = useState({ maleCount: 0, femaleCount: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE}/api/technicians/stats`, { headers: authHeaders() })
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch tech stats", err));
    }, []);

    const adminUsers = [
        { label: "Admin", count: 1, color: "#ff4ecd" },
    ];

    const managementStaff = [
        { label: "Male Technicians", count: stats.maleCount, color: "#6a11cb", path: "/users/male-technicians" },
        { label: "Female Technicians", count: stats.femaleCount, color: "#ff4ecd", path: "/users/female-technicians" }
    ];

    return (
        <div className="dashboard-wrapper">
            <Topbar
                title="Campus Asset Management System"
                setIsLoggedIn={setIsLoggedIn}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

                <div className="dashboard-content console-page">
                    <div className="console-container">
                        <h1 className="console-main-title">USER MANAGEMENT</h1>

                        {/* Admin Section */}
                        <div className="console-section">
                            <div className="console-section-header">
                                <span className="section-icon"><AdminIcon /></span>
                                <h2 className="section-title">ADMIN</h2>
                            </div>
                            <div className="console-cards-grid">
                                {adminUsers.map((user, idx) => (
                                    <div key={idx} className="console-card" onClick={() => setShowAdminModal(true)}>
                                        <div className="console-card-left">
                                            <div className="console-user-icon" style={{ backgroundColor: `${user.color}15`, color: user.color }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                            <span className="console-card-label">{user.label}</span>
                                        </div>
                                        <div className="console-badge" style={{ backgroundColor: user.color }}>
                                            {user.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Management Staff Section */}
                        <div className="console-section">
                            <div className="console-section-header">
                                <span className="section-icon"><StaffIcon /></span>
                                <h2 className="section-title">MANAGEMENT STAFF</h2>
                            </div>
                            <div className="console-cards-grid">
                                {managementStaff.map((user, idx) => (
                                    <div key={idx} className="console-card" onClick={() => navigate(user.path)}>
                                        <div className="console-card-left">
                                            <div className="console-user-icon" style={{ backgroundColor: `${user.color}15`, color: user.color }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                    <circle cx="12" cy="7" r="4" />
                                                </svg>
                                            </div>
                                            <span className="console-card-label">{user.label}</span>
                                        </div>
                                        <div className="console-badge" style={{ backgroundColor: user.color }}>
                                            {user.count}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Admin Detail Modal */}
            {showAdminModal && (
                <div className="admin-modal-overlay" onClick={() => setShowAdminModal(false)}>
                    <div className="admin-detail-card" onClick={(e) => e.stopPropagation()}>
                        <h2 className="admin-card-header">Admin</h2>
                        <div className="admin-card-body">
                            <div className="admin-profile-section">
                                <img src="/assets/admin_photo.png" alt="Admin" className="admin-profile-img" />
                            </div>
                            <div className="admin-info-list">
                                <div className="admin-info-item">
                                    <span className="info-label">Name:</span>
                                    <span className="info-value">Admin</span>
                                </div>
                                <div className="admin-info-item">
                                    <span className="info-label">Username:</span>
                                    <span className="info-value">admin</span>
                                </div>
                                <div className="admin-info-item">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">admin@gmail.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
