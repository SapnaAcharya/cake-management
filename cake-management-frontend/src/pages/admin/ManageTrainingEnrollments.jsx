import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, RefreshCw, Eye, X } from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import {
    getAllTrainingEnrollments,
    getTrainingEnrollmentById,
} from "../../services/training/trainingEnrollmentService";
import "../../styles/AdminDashboard.css";
import "../../styles/ManageTrainingEnrollments.css";

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
};

const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed") return "available";
    if (s === "pending") return "pending";
    return "unavailable";
};

function ManageTrainingEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selected, setSelected] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchEnrollments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAllTrainingEnrollments();
            setEnrollments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load training enrollments. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(fetchEnrollments, 0);
        return () => window.clearTimeout(timeoutId);
    }, [fetchEnrollments]);

    const countByStatus = (name) =>
        enrollments.filter((e) => (e.status || "").toLowerCase() === name).length;

    const filtered = useMemo(() => {
        const term = search.toLowerCase().trim();

        return enrollments.filter((item) => {
            const matchesSearch =
                (item.name || "").toLowerCase().includes(term) ||
                (item.email || "").toLowerCase().includes(term) ||
                (item.phone || "").toLowerCase().includes(term) ||
                (item.trainingPackageName || "").toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === "All" ||
                (item.status || "").toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [enrollments, search, statusFilter]);

    const handleViewDetails = async (id) => {
        setDetailsLoading(true);
        setSelected({ id });

        try {
            const data = await getTrainingEnrollmentById(id);
            setSelected(data);
        } catch (err) {
            setSelected(null);
            setError(
                err.response?.data?.message ||
                "Unable to load enrollment details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => setSelected(null);

    return (
        <AdminLayout
            title="Manage Training Enrollments"
            subtitle="View and manage customers enrolled in your training courses."
            headerAction={
                <button
                    className="admin-primary-btn"
                    onClick={fetchEnrollments}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    {loading ? "Loading..." : "Refresh"}
                </button>
            }
        >
            <div className="admin-summary-row">
                <div className="admin-summary-card">
                    <span>Total enrollments</span>
                    <strong>{enrollments.length}</strong>
                </div>
                <div className="admin-summary-card">
                    <span>Confirmed</span>
                    <strong>{countByStatus("confirmed")}</strong>
                </div>
                <div className="admin-summary-card">
                    <span>Pending</span>
                    <strong>{countByStatus("pending")}</strong>
                </div>
            </div>

            <div className="manage-cakes-card">
                <div className="manage-cakes-filters">
                    <div className="manage-cakes-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search name, email, phone, course..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="category-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>

                {loading && (
                    <div className="manage-cakes-status">
                        Loading training enrollments...
                    </div>
                )}

                {!loading && error && (
                    <div className="manage-cakes-status error">
                        {error}{" "}
                        <button className="retry-link" onClick={fetchEnrollments}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="manage-cakes-status">
                        {search || statusFilter !== "All"
                            ? "No enrollments match your search or filter."
                            : "No customer enrollments yet."}
                    </div>
                )}

                {!loading && !error && filtered.length > 0 && (
                    <div className="manage-cakes-table-wrap">
                        <table className="manage-cakes-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Training Package</th>
                                    <th>Batch Dates</th>
                                    <th>Status</th>
                                    <th>Enrolled On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>

                                        <td>
                                            <span className="cake-name">{item.name}</span>
                                            <span className="cell-sub">
                                                {item.city || "City not provided"}
                                            </span>
                                        </td>

                                        <td>
                                            {item.email}
                                            <span className="cell-sub">{item.phone}</span>
                                        </td>

                                        <td>
                                            <span className="cake-name">
                                                {item.trainingPackageName || "—"}
                                            </span>
                                            <span className="cell-sub">
                                                {item.trainingBatchId
                                                    ? `Batch #${item.trainingBatchId}`
                                                    : "No batch"}
                                            </span>
                                        </td>

                                        <td>
                                            {item.startDate
                                                ? `${formatDate(item.startDate)} – ${formatDate(item.endDate)}`
                                                : "—"}
                                        </td>

                                        <td>
                                            <span className={`status-pill ${statusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        <td>{formatDate(item.createdAt)}</td>

                                        <td>
                                            <div className="row-actions">
                                                <button
                                                    className="row-action-btn edit"
                                                    aria-label="View enrollment details"
                                                    title="View details"
                                                    onClick={() => handleViewDetails(item.id)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <div className="enrollment-modal-overlay" onClick={closeDetails}>
                    <div
                        className="enrollment-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="enrollment-modal-header">
                            <div>
                                <h2>Enrollment Details</h2>
                                <p>Customer and selected training information</p>
                            </div>
                            <button
                                className="enrollment-modal-close"
                                aria-label="Close"
                                onClick={closeDetails}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="manage-cakes-status">
                                Loading enrollment details...
                            </div>
                        ) : (
                            <div className="enrollment-details-content">
                                <div className="enrollment-detail-section">
                                    <h3>Customer Information</h3>
                                    <div className="enrollment-detail-grid">
                                        <div><label>Full Name</label><strong>{selected.name}</strong></div>
                                        <div><label>Email Address</label><strong>{selected.email}</strong></div>
                                        <div><label>Phone Number</label><strong>{selected.phone}</strong></div>
                                        <div><label>WhatsApp</label><strong>{selected.whatsApp || "N/A"}</strong></div>
                                        <div><label>City</label><strong>{selected.city || "N/A"}</strong></div>
                                        <div><label>Experience Level</label><strong>{selected.experienceLevel}</strong></div>
                                    </div>
                                </div>

                                <div className="enrollment-detail-section">
                                    <h3>Training Information</h3>
                                    <div className="enrollment-detail-grid">
                                        <div><label>Training Package</label><strong>{selected.trainingPackageName}</strong></div>
                                        <div><label>Batch ID</label><strong>{selected.trainingBatchId ?? "N/A"}</strong></div>
                                        <div><label>Start Date</label><strong>{formatDate(selected.startDate)}</strong></div>
                                        <div><label>End Date</label><strong>{formatDate(selected.endDate)}</strong></div>
                                        <div><label>Enrollment Date</label><strong>{formatDate(selected.createdAt)}</strong></div>
                                        <div>
                                            <label>Status</label>
                                            <span className={`status-pill ${statusClass(selected.status)}`}>
                                                {selected.status}
                                            </span>
                                        </div>
                                        <div className="enrollment-schedule-detail">
                                            <label>Schedule Details</label>
                                            <strong>{selected.scheduleDetails || "N/A"}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="enrollment-modal-footer">
                            <button onClick={closeDetails}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default ManageTrainingEnrollments;
