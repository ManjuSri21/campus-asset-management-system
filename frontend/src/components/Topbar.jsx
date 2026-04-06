import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import API_BASE from "../config/api";
import { Link, useNavigate } from "react-router-dom";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function Topbar({ setIsLoggedIn, sidebarOpen, setSidebarOpen }) {
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchNotifs = () => {
            axios.get(`${API_BASE}/api/requests`, { headers: authHeaders() })
                .then(r => {
                    let unread = [];
                    if (user.role === "Technician") {
                        unread = Array.isArray(r.data) ? r.data.filter(req => !req.isReadByTechnician) : [];
                    } else if (user.role === "Admin") {
                        unread = Array.isArray(r.data) ? r.data.filter(req => !req.isReadByAdmin) : [];
                    }
                    setNotifications(unread);
                })
                .catch(err => console.error("Notif fetch error:", err));
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkRead = async () => {
        if (notifications.length === 0) {
            setShowNotif(!showNotif);
            return;
        }

        if (!showNotif) {
            setShowNotif(true);
            try {
                const endpoint = user.role === "Admin" ? "mark-admin-read" : "mark-as-read";
                await axios.put(`${API_BASE}/requests/${endpoint}`, {}, { headers: authHeaders() });
            } catch (err) {
                console.error(err);
            }
        } else {
            setShowNotif(false);
            setNotifications([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("loggedUser");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    return (
        <div className="topbar">
            {/* Left: Hamburger + Brand */}
            <div className="topbar-left">
                <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                {/* Brand moved from Sidebar */}
                <div className="topbar-brand">
                    <div className="topbar-logo-icon">
                        <img
                            className="topbar-logo-img"
                            src="https://cdn-icons-png.flaticon.com/512/906/906343.png"
                            alt="Campus Asset"
                        />
                    </div>
                    <span className="topbar-brand-name">Campus Asset Management System</span>
                </div>
            </div>

            {/* Center: Removed search bar as requested */}

            {/* Right: Theme toggle + Bell + Profile */}
            <div className="topbar-right">
                {/* Theme toggle button - Bright Logo Design */}
                <button
                    className="icon-btn theme-btn"
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
                    style={{
                        background: theme === "dark" ? "rgba(59, 130, 246, 0.15)" : "rgba(251, 191, 36, 0.1)",
                        border: `2px solid ${theme === "dark" ? "#3b82f6" : "#fbbf24"}`,
                        marginRight: "10px"
                    }}
                >
                    {theme === "dark" ? (
                        /* Sun Logo - Vivid Yellow/Orange */
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" fill="#fbbf24" />
                            <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </g>
                        </svg>
                    ) : (
                        /* Moon Logo - Vibrant Indigo */
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#6366f1" />
                        </svg>
                    )}
                </button>

                {/* Notification bell - Vibrant Purple Logo */}
                <div className="notif-wrapper">
                    <button
                        className="icon-btn notif-btn"
                        onClick={handleMarkRead}
                        style={{
                            background: "rgba(168, 85, 247, 0.15)",
                            border: "2px solid #a855f7",
                            marginRight: "15px",
                            position: "relative"
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="#a855f7" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" fill="#a855f7" />
                            <circle cx="12" cy="7" r="1.5" fill="white" fillOpacity="0.4" />
                        </svg>
                        {notifications.length > 0 && (
                            <span className="notif-badge">{notifications.length}</span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <span>Notifications</span>
                                {notifications.length > 0 && <span className="notif-count-text">{notifications.length} New</span>}
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">No new updates</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n._id} className="notif-card" onClick={() => navigate(user.role === "Admin" ? `/admin/requests/${n._id}` : "/technician/dashboard")}>
                                            <div className={`notif-status-dot ${n.status.toLowerCase().replace(" ", "-")}`} />
                                            <div className="notif-body">
                                                <p className="notif-text">
                                                    {user.role === "Admin" ? (
                                                        <>New <strong>{n.type}</strong> from <strong>{n.technicianId?.name || "Tech"}</strong> for {n.assetName}</>
                                                    ) : (
                                                        <>Your request for <strong>{n.assetName}</strong> was marked as <span>{n.status}</span></>
                                                    )}
                                                </p>
                                                <span className="notif-time">{new Date(n.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {user.role === "Technician" && (
                                <Link to="/technician/dashboard" className="notif-footer" onClick={() => { setShowNotif(false); setNotifications([]); }}>
                                    View all requests
                                </Link>
                            )}
                            {user.role === "Admin" && (
                                <Link to="/admin/requests" className="notif-footer" onClick={() => { setShowNotif(false); setNotifications([]); }}>
                                    View all requests
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
                {user && (
                    <div className="profile-area">
                        <div className="profile-btn" onClick={() => setShowProfile(!showProfile)}>
                            <div className="profile-text-block">
                                <span className="profile-name">{user.fullName}</span>
                                <span className="profile-role">{user.role || "Admin"}</span>
                            </div>
                            <img src={user.photo} alt="profile" className="profile-img" />
                        </div>

                        {showProfile && (
                            <div className="profile-dropdown">
                                <h3>{user.role}</h3>
                                <p><b>Name:</b> {user.fullName}</p>
                                <p><b>Username:</b> {user.username}</p>
                                <p><b>Email:</b> {user.email}</p>
                                <button className="logout-btn-top" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
