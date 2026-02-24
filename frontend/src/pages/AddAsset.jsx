import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import API_BASE from "../config/api";
import "../App.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function AddAsset({ setIsLoggedIn }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [assetId, setAssetId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("Good");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Available");
  const [assignedTo, setAssignedTo] = useState("");
  const [damageNotes, setDamageNotes] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [nextMaintenanceAt, setNextMaintenanceAt] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE}/assets/${id}`, { headers: authHeaders() })
      .then((res) => {
        const asset = res.data;
        setAssetId(asset.assetId);
        setName(asset.name);
        setCategory(asset.category);
        setDepartment(asset.department);
        setLocation(asset.location);
        setStatus(asset.status);
        setCondition(asset.condition || "Good");
        setAssignedTo(asset.assignedTo || "");
        setDamageNotes(asset.damageNotes || "");
        setReportedBy(asset.reportedBy || "");
        setNextMaintenanceAt(asset.nextMaintenanceAt ? asset.nextMaintenanceAt.slice(0, 10) : "");
      })
      .catch(() => setError("Failed to load asset"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);

    const payload = {
      assetId,
      name,
      category,
      department,
      location,
      status,
      condition,
      assignedTo: assignedTo.trim(),
      damageNotes: damageNotes.trim(),
      reportedBy: reportedBy.trim(),
      nextMaintenanceAt: nextMaintenanceAt.trim() || null,
    };

    try {
      if (isEdit) {
        await axios.put(`${API_BASE}/assets/${id}`, payload, { headers: authHeaders() });
        setMsg("Asset updated successfully ");
      } else {
        await axios.post(`${API_BASE}/assets`, payload, { headers: authHeaders() });
        setMsg("Asset added successfully ");
      }
      setAssetId("");
      setName("");
      setCategory("");
      setDepartment("");
      setLocation("");
      setStatus("Available");
      setCondition("Good");
      setAssignedTo("");
      setDamageNotes("");
      setReportedBy("");
      setNextMaintenanceAt("");
      if (!isEdit) {
        setTimeout(() => navigate("/assets/list"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAssetId("");
    setName("");
    setCategory("");
    setDepartment("");
    setLocation("");
    setStatus("Available");
    setCondition("Good");
    setAssignedTo("");
    setDamageNotes("");
    setReportedBy("");
    setNextMaintenanceAt("");
    navigate("/assets/list");
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

        <div className="dashboard-content add-asset-page">
          <div className="add-asset-card-full">
            <div className="add-asset-header">
              <h2 className="add-asset-title">{isEdit ? "Update Asset ✏️" : "Add Asset ➕"}</h2>
              <Link to="/assets/list" className="view-all-assets-link">View All Assets</Link>
            </div>

            {error && <div className="error-box">{error}</div>}
            {msg && <div className="success-box">{msg}</div>}

            {fetching ? (
              <p className="muted">Loading asset…</p>
            ) : (
              <form onSubmit={handleSubmit} className="asset-form-compact">
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-field-label">Asset ID</label>
                    <input value={assetId} onChange={(e) => setAssetId(e.target.value)} placeholder="e.g. LAB-101" required disabled={isEdit} />
                  </div>
                  <div className="form-field">
                    <label className="form-field-label">Asset Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Asset name" required />
                  </div>

                  <div className="form-field">
                    <label className="form-field-label">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                      <option value="">Select Category</option>
                      <option>Infrastructure</option>
                      <option>IT Equipment</option>
                      <option>Laboratory Equipment</option>
                      <option>Furniture & Fixtures</option>
                      <option>Library Assets</option>
                      <option>Vehicles</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-field-label">Department</label>
                    <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE" required />
                  </div>

                  <div className="form-field">
                    <label className="form-field-label">Location</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lab 1" required />
                  </div>
                  <div className="form-field">
                    <label className="form-field-label">Condition</label>
                    <select value={condition} onChange={(e) => setCondition(e.target.value)} required>
                      <option>Good</option>
                      <option>Damaged</option>
                      <option>Needs Repair</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-field-label">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option>Available</option>
                      <option>In Use</option>
                      <option>Maintenance</option>
                      <option>Damaged</option>
                    </select>
                  </div>

                  {status === "In Use" && (
                    <div className="form-field">
                      <label className="form-field-label">Assigned To</label>
                      <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Name or ID" />
                    </div>
                  )}

                  {status === "Damaged" && (
                    <>
                      <div className="form-field">
                        <label className="form-field-label">Damage Notes</label>
                        <input value={damageNotes} onChange={(e) => setDamageNotes(e.target.value)} placeholder="Describe damage" />
                      </div>
                      <div className="form-field">
                        <label className="form-field-label">Reported By</label>
                        <input value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} placeholder="Name" />
                      </div>
                    </>
                  )}

                  <div className="form-field">
                    <label className="form-field-label">Next Maintenance (optional)</label>
                    <input type="date" value={nextMaintenanceAt} onChange={(e) => setNextMaintenanceAt(e.target.value)} />
                  </div>
                </div>

                <div className="form-actions form-actions-center">
                  <button type="submit" disabled={loading}>
                    {loading ? "Saving…" : isEdit ? "Update Asset" : "Add Asset"}
                  </button>
                  {isEdit && (
                    <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
