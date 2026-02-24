import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE from "../config/api";
import "../App.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const LIMIT = 25;
const AUTO_REFRESH_MS = 60000;

export default function AssetList({ setIsLoggedIn }) {
  const [data, setData] = useState({
    assets: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // 🔥 only one search state (auto search)
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("assetId");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchAssets = useCallback(async (pageNum, q) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ page: pageNum, limit: LIMIT });
      if (q && String(q).trim()) params.set("q", String(q).trim());

      const res = await axios.get(`${API_BASE}/assets?${params}`, {
        headers: authHeaders(),
      });

      setData({
        assets: res.data.assets || [],
        total: res.data.total ?? 0,
        page: res.data.page ?? 1,
        totalPages: res.data.totalPages ?? 1,
      });

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ debounce typing (auto search)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchAssets(1, search);
    }, 350);

    return () => clearTimeout(t);
  }, [search, fetchAssets]);

  // page changes
  useEffect(() => {
    fetchAssets(page, search);
  }, [page, fetchAssets, search]);

  // auto refresh
  useEffect(() => {
    const t = setInterval(() => fetchAssets(page, search), AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, [page, search, fetchAssets]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      await axios.delete(`${API_BASE}/assets/${id}`, {
        headers: authHeaders(),
      });

      setMsg("Asset deleted successfully 🗑️");
      fetchAssets(page, search);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const sortedAssets = [...(data.assets || [])].sort((a, b) => {
    const key = sortField;
    let valA = a[key];
    let valB = b[key];

    if (typeof valA === "string") {
      valA = (valA || "").toLowerCase();
      valB = (valB || "").toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortIcon = (field) =>
    sortField !== field ? " ⇅" : sortOrder === "asc" ? " ↑" : " ↓";

  const exportCSV = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/assets?page=1&limit=1000${search ? `&q=${encodeURIComponent(search)}` : ""
        }`,
        { headers: authHeaders() }
      );

      const list = res.data.assets || [];
      const headers = [
        "Asset ID",
        "Name",
        "Category",
        "Department",
        "Location",
        "Status",
        "Assigned To",
      ];

      const rows = list.map((a) =>
        [a.assetId, a.name, a.category, a.department, a.location, a.status, a.assignedTo || ""]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assets-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Export failed");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Topbar title="Campus Asset Management System"
        setIsLoggedIn={setIsLoggedIn}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />


      <div className="dashboard-layout">
        <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />


        <div className="dashboard-content">
          <div className="page-title-row">
            <h2 className="page-title">Search & View Assets 📦</h2>

            <Link to="/assets/add" className="view-all-assets-link">
              + Add New Asset
            </Link>
          </div>

          {error && <div className="error-box">{error}</div>}
          {msg && <div className="success-box">{msg}</div>}

          <div className="assets-table-card standalone-table">
            <div className="assets-header">
              <h3 className="section-title">All Assets</h3>

              {/* 🔥 Auto search input */}
              <input
                className="search-box"
                placeholder="Type to search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="muted" style={{ padding: "20px" }}>
                Loading assets…
              </p>
            ) : (
              <>
                <table className="assets-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort("assetId")}>
                        Asset ID{sortIcon("assetId")}
                      </th>
                      <th className="sortable" onClick={() => handleSort("name")}>
                        Name{sortIcon("name")}
                      </th>
                      <th className="sortable" onClick={() => handleSort("category")}>
                        Category{sortIcon("category")}
                      </th>
                      <th className="sortable" onClick={() => handleSort("department")}>
                        Dept{sortIcon("department")}
                      </th>
                      <th className="sortable" onClick={() => handleSort("location")}>
                        Location{sortIcon("location")}
                      </th>
                      <th className="sortable" onClick={() => handleSort("status")}>
                        Status{sortIcon("status")}
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedAssets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-cell">
                          {data.total === 0
                            ? "No assets yet. Add your first asset!"
                            : "No matching assets."}
                        </td>
                      </tr>
                    ) : (
                      sortedAssets.map((a) => (
                        <tr key={a._id}>
                          <td>{a.assetId}</td>
                          <td>{a.name}</td>
                          <td>{a.category}</td>
                          <td>{a.department}</td>
                          <td>{a.location}</td>
                          <td>
                            <span className={`status-pill ${(a.status || "").replace(/\s+/g, "")}`}>
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <Link to={`/assets/edit/${a._id}`} className="edit-btn link-edit">
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() => handleDelete(a._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* pagination */}
                {data.totalPages > 1 && (
                  <div className="pagination">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Prev
                    </button>
                    <span>
                      Page {page} of {data.totalPages} ({data.total} total)
                    </span>
                    <button
                      type="button"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* 🔥 Export CSV bottom center */}
                <div className="export-center">
                  <button type="button" className="quick-action-btn secondary" onClick={exportCSV}>
                    Export CSV
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
