import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddAsset from "./pages/AddAsset";
import AssetList from "./pages/AssetList";
import Users from "./pages/Users";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianDetails from "./pages/TechnicianDetails";
import AddTechnician from "./pages/AddTechnician";
import RequestForm from "./pages/RequestForm";
import AdminRequests from "./pages/AdminRequests";
import AdminRequestDetails from "./pages/AdminRequestDetails";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Auth setIsLoggedIn={setIsLoggedIn} />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Dashboard setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route path="/assets" element={<Navigate to="/assets/list" replace />} />
        <Route
          path="/assets/list"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AssetList setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/add"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddAsset setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddAsset setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Users setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/male-technicians"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <TechnicianDetails type="Male Technicians" setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/female-technicians"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <TechnicianDetails type="Female Technicians" setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/add-technician"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddTechnician setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/edit-technician/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AddTechnician setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />

        {/* TECHNICIAN ROUTES */}
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminRequests setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminRequestDetails setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />

        {/* TECHNICIAN ROUTES */}
        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Technician"]}>
              <TechnicianDashboard setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/request"
          element={
            <ProtectedRoute allowedRoles={["Technician"]}>
              <RequestForm setIsLoggedIn={setIsLoggedIn} />
            </ProtectedRoute>
          }
        />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
