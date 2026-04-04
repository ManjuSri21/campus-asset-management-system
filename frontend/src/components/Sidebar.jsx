import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const DashboardIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const AssetsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AddIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const RequestsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const adminLinks = [
  { path: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { path: "/assets/list", label: "Assets List", Icon: AssetsIcon },
  { path: "/assets/add", label: "Add Asset", Icon: AddIcon },
  { path: "/users", label: "Users", Icon: UsersIcon },
  { path: "/admin/requests", label: "Requests", Icon: RequestsIcon },
];

const techLinks = [
  { path: "/technician/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { path: "/technician/request", label: "New Request", Icon: AddIcon },
];

export default function Sidebar({ sidebarOpen, setIsLoggedIn }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");
  const role = user.role || "Admin";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("loggedUser");
      if (setIsLoggedIn) setIsLoggedIn(false);
    }
  };

  const currentLinks = role === "Admin" ? adminLinks : techLinks;

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">{role.toUpperCase()} PORTAL</p>
        {currentLinks.map(({ path, label, Icon }) => (
          <Link
            key={path}
            to={path}
            className={`side-link ${isActive(path) ? "active" : ""}`}
          >
            <span className="side-icon"><Icon /></span>
            <span className="side-label">{label}</span>
          </Link>
        ))}

        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="side-icon"><LogoutIcon /></span>
          <span className="side-label">Logout</span>
        </button>
      </nav>
    </div>
  );
}
