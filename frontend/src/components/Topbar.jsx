import React, { useEffect, useState } from "react";

export default function Topbar({ setIsLoggedIn, sidebarOpen, setSidebarOpen, title }) {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Always apply dark (AI black) theme
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Hamburger */}
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>

        <h2 className="logo-title">Campus Asset Management System</h2>
      </div>

      {/* Right Side */}
      <div className="topbar-right">
        {user && (
          <div className="profile-area">
            <div
              className="profile-btn"
              onClick={() => setShowProfile(!showProfile)}
            >
              <img src={user.photo} alt="profile" className="profile-img" />
              <span className="profile-name">{user.fullName}</span>
            </div>

            {showProfile && (
              <div className="profile-dropdown">
                <h3>{user.role}</h3>

                <p>
                  <b>Name:</b> {user.fullName}
                </p>
                <p>
                  <b>Username:</b> {user.username}
                </p>
                <p>
                  <b>Email:</b> {user.email}
                </p>

                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
