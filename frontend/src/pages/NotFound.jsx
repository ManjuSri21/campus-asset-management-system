import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function NotFound() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>Page not found</p>
      <div>
        <Link to="/">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}
