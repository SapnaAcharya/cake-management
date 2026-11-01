import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import trainingBatchAdminService from "../../services/training/trainingBatchAdminService";
import "../../styles/AdminDashboard.css";

const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

function ManageTrainingBatches() {
    const navigate = useNavigate();

    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBatches = useCallback(async () => {
        try {
            const data = await trainingBatchAdminService.getAll();

            setBatches(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            console.error("Failed to load training batches:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to load training batches. Please check your login and API connection."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            fetchBatches();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchBatches]);

    const filteredBatches = batches.filter((batch) => {
        const query = search.toLowerCase();

        return (
            (batch.trainingPackageName ?? "").toLowerCase().includes(query) ||
            (batch.trainerName ?? "").toLowerCase().includes(query) ||
            (batch.status ?? "").toLowerCase().includes(query)
        );
    });

    const handleClose = async (batch) => {
        const confirmed = window.confirm(
            `Close the batch "${batch.trainingPackageName}"?`
        );

        if (!confirmed) return;

        try {
            await trainingBatchAdminService.close(batch.id);
            await fetchBatches();
        } catch (err) {
            console.error("Failed to close training batch:", err);

            window.alert(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to close this training batch."
            );
        }
    };

    const openCount = batches.filter((b) => b.status === "Open").length;
    const closedCount = batches.filter((b) => b.status === "Closed").length;

    return (
        <AdminLayout
            title="Manage Training Batches"
            subtitle="Schedule training sessions, assign trainers, and manage batch availability."
            headerAction={
                <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => navigate("/admin/training-batches/add")}
                >
                    <Plus size={16} />
                    Create Batch
                </button>
            }
        >
            <div className="admin-summary-row">
                <div className="admin-summary-card">
                    <span>Total batches</span>
                    <strong>{batches.length}</strong>
                </div>
                <div className="admin-summary-card">
                    <span>Open batches</span>
                    <strong>{openCount}</strong>
                </div>
                <div className="admin-summary-card">
                    <span>Closed batches</span>
                    <strong>{closedCount}</strong>
                </div>
            </div>

            <div className="manage-cakes-card">
                <div className="manage-cakes-filters">
                    <div className="manage-cakes-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search batches..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading && (
                    <div className="manage-cakes-status">
                        Loading training batches...
                    </div>
                )}

                {!loading && error && (
                    <div className="manage-cakes-status error" role="alert">
                        {error}{" "}
                        <button
                            type="button"
                            className="retry-link"
                            onClick={() => {
                                setLoading(true);
                                setError("");
                                fetchBatches();
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filteredBatches.length === 0 && (
                    <div className="manage-cakes-status">
                        {search
                            ? "No batches match your search."
                            : "No training batches yet. Create your first batch."}
                    </div>
                )}

                {!loading && !error && filteredBatches.length > 0 && (
                    <div className="manage-cakes-table-wrap">
                        <table className="manage-cakes-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>Package</th>
                                    <th>Trainer</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Schedule Details</th>
                                    <th>Registrations</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBatches.map((batch, index) => {
                                    const isOpen = batch.status === "Open";

                                    return (
                                        <tr key={batch.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="cake-name">
                                                    {batch.trainingPackageName ?? "—"}
                                                </span>
                                                <small className="cell-sub">
                                                    Batch #{batch.id}
                                                </small>
                                            </td>
                                            <td>{batch.trainerName ?? "—"}</td>
                                            <td>{formatDate(batch.startDate)}</td>

<td>{formatDate(batch.endDate)}</td>

<td>
    <span className="batch-schedule">
        {batch.scheduleDetails ||
            "Schedule not specified"}
    </span>
</td>

<td>
    {batch.registeredCount ?? 0} /{" "}
    {batch.capacity ?? "—"}
</td>
                                            <td>
                                                <span
                                                    className={`status-pill ${
                                                        isOpen
                                                            ? "available"
                                                            : "unavailable"
                                                    }`}
                                                >
                                                    {batch.status || "Unknown"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button
                                                        type="button"
                                                        className="row-action-btn edit"
                                                        aria-label={`Edit batch ${batch.id}`}
                                                        title="Edit batch"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/training-batches/${batch.id}/edit`
                                                            )
                                                        }
                                                    >
                                                        <Pencil size={14} />
                                                    </button>

                                                    {isOpen && (
                                                        <button
                                                            type="button"
                                                            className="row-action-btn delete"
                                                            aria-label={`Close batch ${batch.id}`}
                                                            title="Close batch"
                                                            onClick={() => handleClose(batch)}
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default ManageTrainingBatches;