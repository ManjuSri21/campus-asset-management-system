import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const loggedIn = localStorage.getItem("loggedIn") === "true";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");

  if (!loggedIn || !token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user role is not allowed, redirect to their home dashboard
    const homePath = user.role === "Admin" ? "/dashboard" : "/technician/dashboard";
    return <Navigate to={homePath} replace />;
  }

  return children;
}
