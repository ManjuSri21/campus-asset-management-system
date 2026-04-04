import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import "../App.css";

export default function Auth({ setIsLoggedIn }) {
  const [mode, setMode] = useState("signin");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const API = API_BASE;

  // If already logged in, go straight to their dashboard
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const userStr = localStorage.getItem("loggedUser");
    if (loggedIn && userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "Admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/technician/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  // ================= SIGNUP (Admin only) =================
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const res = await axios.post(`${API}/api/auth/signup`, {
        fullName,
        username,
        email,
        password,
        secretKey,
      });

      setMsg(res.data.message || "Signup successful! Now login.");
      setMode("signin");

      setFullName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setSecretKey("");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  // ================= LOGIN (Unified) =================
  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const res = await axios.post(`${API}/auth/login`, {
        username,
        password,
      });

      // Save token + user data
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedUser", JSON.stringify(res.data.user));

      setIsLoggedIn(true);

      // Role-based redirection
      const user = res.data.user;
      const name = user.fullName || "User";
      setMsg(`Welcome ${name}! 🎉 You are logging in...`);

      const redirectPath = user.role === "Admin" ? "/dashboard" : "/technician/dashboard";
      setTimeout(() => navigate(redirectPath), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <img
            className="auth-img"
            src="https://cdn-icons-png.flaticon.com/512/906/906343.png"
            alt="Campus Asset"
          />
          <h2>Campus Asset Management System</h2>
          <p>Track • Allocate • Maintain • Report</p>

          <div className="mode-switch">
            <button
              className={mode === "signin" ? "switch-btn active" : "switch-btn"}
              onClick={() => {
                setMode("signin");
                setError("");
                setMsg("");
              }}
              type="button"
            >
              Sign In
            </button>

            <button
              className={mode === "signup" ? "switch-btn active" : "switch-btn"}
              onClick={() => {
                setMode("signup");
                setError("");
                setMsg("");
              }}
              type="button"
            >
              Admin Sign Up
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <h1>{mode === "signin" ? "Welcome Back 💜" : "Create Admin 💗"}</h1>

          <p className="subtext">
            {mode === "signin"
              ? "Login to access the system (Admin or Technician)."
              : "Register as a principal administrator."}
          </p>

          {error && <div className="error-box">{error}</div>}
          {msg && <div className="success-box">{msg}</div>}

          {mode === "signin" ? (
            <form onSubmit={handleSignin}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit">Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Username</label>
              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Create password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="auth-hint">Password must be at least 6 characters.</p>

              <label>Admin Registration Key</label>
              <input
                type="password"
                placeholder="Enter secret key (Required if admins exists)"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />

              <button type="submit">Sign Up</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
