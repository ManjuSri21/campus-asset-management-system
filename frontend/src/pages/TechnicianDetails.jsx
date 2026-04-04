import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from "../config/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../App.css";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </svg>
);

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export default function TechnicianDetails({ type, setIsLoggedIn }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchTechnicians = useCallback(async () => {
        try {
            setLoading(true);
            const gender = type === "Male Technicians" ? "male" : "female";
            const res = await axios.get(`${API_BASE}/technicians?gender=${gender}&q=${searchTerm}`, {
                headers: authHeaders()
            });
            setTechnicians(res.data);
            setError("");
        } catch (err) {
            setError("Failed to load technicians");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [type, searchTerm]);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this technician?")) {
            try {
                await axios.delete(`${API_BASE}/technicians/${id}`, { headers: authHeaders() });
                fetchTechnicians();
            } catch (err) {
                alert("Failed to delete technician");
                console.error(err);
            }
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

                <div className="dashboard-content tech-details-page">
                    <div className="tech-container">
                        <div className="tech-header">
                            <div className="tech-header-left">
                                <button className="back-btn" onClick={() => navigate("/users")}>
                                    <BackIcon />
                                    <span>Back</span>
                                </button>
                                <h1 className="tech-main-title">{type}</h1>
                            </div>
                        </div>

                        <div className="tech-actions">
                            <div className="tech-search-bar">
                                <SearchIcon />
                                <input
                                    type="text"
                                    placeholder="Search by name, ID or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="add-tech-btn" onClick={() => navigate("/users/add-technician", { state: { category: type } })}>
                                + Add Technician
                            </button>
                        </div>

                        {error && <div className="error-box" style={{ textAlign: 'center', marginBottom: '20px' }}>{error}</div>}

                        <div className="tech-list-wrapper">
                            {loading ? (
                                <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p>Loading technicians...</p>
                                </div>
                            ) : technicians.length === 0 ? (
                                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                    <p>No technicians found.</p>
                                </div>
                            ) : (
                                <table className="tech-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {technicians.map((tech, index) => (
                                            <tr key={tech._id}>
                                                <td>{index + 1}</td>
                                                <td className="tech-id-cell">{tech.techId}</td>
                                                <td className="tech-name-cell">{tech.name}</td>
                                                <td>{tech.username}</td>
                                                <td>{tech.email}</td>
                                                <td>{tech.dept}</td>
                                                <td>
                                                    <span className={`status-pill ${tech.status.toLowerCase().replace("-", "")}`}>
                                                        {tech.status}
                                                    </span>
                                                </td>
                                                <td className="tech-actions-cell">
                                                    <button className="edit-action-btn" onClick={() => navigate(`/users/edit-technician/${tech._id}`, { state: { category: type } })}>
                                                        <EditIcon />
                                                    </button>
                                                    <button className="delete-action-btn" onClick={() => handleDelete(tech._id)}>
                                                        <DeleteIcon />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
