import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddAsset from "./pages/AddAsset";
import AssetList from "./pages/AssetList";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [, setIsLoggedIn] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Auth setIsLoggedIn={setIsLoggedIn} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard setIsLoggedIn={setIsLoggedIn} />
          </ProtectedRoute>
        }
      />
      <Route path="/assets" element={<Navigate to="/assets/list" replace />} />
      <Route
        path="/assets/list"
        element={
          <ProtectedRoute>
            <AssetList setIsLoggedIn={setIsLoggedIn} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/add"
        element={
          <ProtectedRoute>
            <AddAsset setIsLoggedIn={setIsLoggedIn} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/edit/:id"
        element={
          <ProtectedRoute>
            <AddAsset setIsLoggedIn={setIsLoggedIn} />
          </ProtectedRoute>
        }
      />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
