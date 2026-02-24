import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

export default function Sidebar({ sidebarOpen, setIsLoggedIn }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("loggedUser");
      if (setIsLoggedIn) setIsLoggedIn(false);
    }
  };

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div className="sidebar-top">
        <h2 className="sidebar-title">Admin Panel</h2>

        <div className="sidebar-links">
          <Link className={isActive("/dashboard") ? "side-link active" : "side-link"} to="/dashboard">
            Dashboard
          </Link>

          <Link className={isActive("/assets/add") ? "side-link active" : "side-link"} to="/assets/add">
            Add Asset
          </Link>

          <Link className={isActive("/assets/list") ? "side-link active" : "side-link"} to="/assets/list">
            Search Assets
          </Link>
        </div>
      </div>

      <button className="sidebar-logout" onClick={handleLogout}>
        Admin Logout
      </button>
    </div>
  );
}
