import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE from "../config/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function AddTechnician({ setIsLoggedIn }) {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Get default category from navigation state
    const defaultCategory = location.state?.category || "Male Technicians";

    const [formData, setFormData] = useState({
        techId: "",
        name: "",
        dept: "",
        status: "Active",
        type: defaultCategory,
        email: "",
        username: "",
        password: ""
    });

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            axios.get(`${API_BASE}/technicians/${id}`, { headers: authHeaders() })
                .then(res => {
                    const tech = res.data;
                    setFormData({
                        techId: tech.techId,
                        name: tech.name,
                        dept: tech.dept,
                        status: tech.status,
                        type: tech.gender === "male" ? "Male Technicians" : "Female Technicians",
                        email: tech.email || "",
                        username: tech.username || "",
                        password: "" // Keep password empty for security/edit purposes
                    });
                })
                .catch(err => {
                    setError("Failed to load technician details");
                    console.error(err);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const payload = {
            techId: formData.techId,
            name: formData.name,
            dept: formData.dept,
            gender: formData.type === "Male Technicians" ? "male" : "female",
            status: formData.status,
            email: formData.email,
            username: formData.username,
            password: formData.password
        };

        try {
            if (isEditMode) {
                // Remove password from update if it's empty
                if (!payload.password) delete payload.password;
                await axios.put(`${API_BASE}/technicians/${id}`, payload, { headers: authHeaders() });
            } else {
                await axios.post(`${API_BASE}/technicians`, payload, { headers: authHeaders() });
            }
            const path = formData.type === "Male Technicians" ? "/users/male-technicians" : "/users/female-technicians";
            navigate(path);
        } catch (err) {
            setError(err.response?.data?.message || "Operation failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Topbar
                title="Campus Asset Management System"
                setIsLoggedIn={setIsLoggedIn}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="dashboard-layout">
                <Sidebar sidebarOpen={sidebarOpen} setIsLoggedIn={setIsLoggedIn} />

                <div className="dashboard-content add-tech-page">
                    <div className="add-tech-container">
                        <div className="add-tech-card">
                            <h1 className="add-tech-title">
                                {isEditMode ? "EDIT TECHNICIAN" : "ADD NEW TECHNICIAN"}
                            </h1>

                            {error && <div className="error-box" style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                            <form className="add-tech-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Technician ID</label>
                                        <input
                                            type="text"
                                            name="techId"
                                            placeholder="e.g. T-101"
                                            value={formData.techId}
                                            onChange={handleChange}
                                            required
                                            disabled={isEditMode}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Enter full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="Choose username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Enter email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Password {isEditMode && "(Leave blank to keep current)"}</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder={isEditMode ? "New password" : "Create password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!isEditMode}
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            name="dept"
                                            placeholder="e.g. Electrical, IT Support"
                                            value={formData.dept}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        {location.state?.category ? (
                                            <input
                                                type="text"
                                                value={formData.type === "Male Technicians" ? "Male Technician" : "Female Technician"}
                                                readOnly
                                                className="read-only-field"
                                            />
                                        ) : (
                                            <select name="type" value={formData.type} onChange={handleChange}>
                                                <option value="Male Technicians">Male Technician</option>
                                                <option value="Female Technicians">Female Technician</option>
                                            </select>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange}>
                                            <option value="Active">Active</option>
                                            <option value="In-active">In-active</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-actions-centered form-actions-center">
                                    <button type="submit" className="quick-action-btn secondary" disabled={loading}>
                                        {loading ? "Saving..." : isEditMode ? "Update" : "Add Technician"}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={() => navigate("/users")}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
