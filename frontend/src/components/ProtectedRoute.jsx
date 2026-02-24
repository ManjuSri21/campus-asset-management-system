import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  const token = localStorage.getItem("token");

  if (!loggedIn || !token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
