import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Pencil, Power, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../layouts/AdminLayout";
import trainingTrainerAdminService from "../../services/training/trainingTrainerAdminService";
import "../../styles/AdminDashboard.css";

function ManageTrainers() {
    const navigate = useNavigate();

    const [trainers, setTrainers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTrainers = useCallback(async () => {
        try {
            const data = await trainingTrainerAdminService.getAll();

            setTrainers(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            console.error("Failed to load trainers:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to load trainers. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            fetchTrainers();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchTrainers]);

    const filteredTrainers = trainers.filter((trainer) => {
        const name = trainer.fullName ?? trainer.FullName ?? "";
        const email = trainer.email ?? trainer.Email ?? "";
        const qualifications =
            trainer.qualifications ?? trainer.Qualifications ?? "";

        const query = search.toLowerCase();

        return (
            name.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            qualifications.toLowerCase().includes(query)
        );
    });

    const handleDeactivate = async (trainer) => {
        const name = trainer.fullName ?? trainer.FullName ?? "this trainer";
        const id = trainer.id ?? trainer.Id;

        const confirmed = window.confirm(`Deactivate "${name}"?`);

        if (!confirmed) return;

        try {
            await trainingTrainerAdminService.deactivate(id);
            await fetchTrainers();
        } catch (err) {
            console.error("Failed to deactivate trainer:", err);

            window.alert(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to deactivate the trainer."
            );
        }
    };

    const handleActivate = async (trainer) => {
        const name = trainer.fullName ?? trainer.FullName ?? "this trainer";
        const id = trainer.id ?? trainer.Id;

        const confirmed = window.confirm(`Activate "${name}"?`);

        if (!confirmed) return;

        try {
            await trainingTrainerAdminService.activate(id);
            await fetchTrainers();
        } catch (err) {
            console.error("Failed to activate trainer:", err);

            window.alert(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to activate the trainer."
            );
        }
    };

    return (
        <AdminLayout
            title="Manage Trainers"
            subtitle="View and manage your bakery and cake decorating trainers."
            headerAction={
                <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={() => navigate("/admin/trainers/add")}
                >
                    <Plus size={16} />
                    Add Trainer
                </button>
            }
        >
            <div className="manage-cakes-card">
                <div className="manage-cakes-filters">
                    <div className="manage-cakes-search">
                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Search trainers..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>
                </div>

                {loading && (
                    <div className="manage-cakes-status">
                        Loading trainers...
                    </div>
                )}

                {!loading && error && (
                    <div
                        className="manage-cakes-status error"
                        role="alert"
                    >
                        {error}{" "}
                        <button
                            type="button"
                            className="retry-link"
                            onClick={() => {
                                setLoading(true);
                                setError("");
                                fetchTrainers();
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filteredTrainers.length === 0 && (
                    <div className="manage-cakes-status">
                        {search
                            ? "No trainers match your search."
                            : "No trainers found. Add your first trainer."}
                    </div>
                )}

                {!loading && !error && filteredTrainers.length > 0 && (
                    <div className="manage-cakes-table-wrap">
                        <table className="manage-cakes-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>ID</th>
                                    <th>Trainer Name</th>
                                    <th>Qualifications</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTrainers.map((trainer, index) => {
                                    const id = trainer.id ?? trainer.Id;

                                    const name =
                                        trainer.fullName ??
                                        trainer.FullName ??
                                        "—";

                                    const qualifications =
                                        trainer.qualifications ??
                                        trainer.Qualifications ??
                                        "—";

                                    const email =
                                        trainer.email ?? trainer.Email ?? "—";

                                    const phone =
                                        trainer.phoneNumber ??
                                        trainer.PhoneNumber ??
                                        "—";

                                    const isActive =
                                        trainer.isActive ??
                                        trainer.IsActive ??
                                        true;

                                    return (
                                        <tr key={id}>
                                            <td>{index + 1}</td>
                                            <td>{id}</td>
                                            <td className="cake-name">{name}</td>
                                            <td>{qualifications}</td>
                                            <td>{email}</td>
                                            <td>{phone}</td>
                                            <td>
                                                <span
                                                    className={`status-pill ${
                                                        isActive
                                                            ? "available"
                                                            : "unavailable"
                                                    }`}
                                                >
                                                    {isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button
                                                        type="button"
                                                        className="row-action-btn edit"
                                                        aria-label={`Edit ${name}`}
                                                        title="Edit trainer"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/trainers/${id}/edit`
                                                            )
                                                        }
                                                    >
                                                        <Pencil size={14} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`row-action-btn ${
                                                            isActive
                                                                ? "delete"
                                                                : "edit"
                                                        }`}
                                                        aria-label={`${
                                                            isActive
                                                                ? "Deactivate"
                                                                : "Activate"
                                                        } ${name}`}
                                                        title={
                                                            isActive
                                                                ? "Deactivate trainer"
                                                                : "Activate trainer"
                                                        }
                                                        onClick={() =>
                                                            isActive
                                                                ? handleDeactivate(trainer)
                                                                : handleActivate(trainer)
                                                        }
                                                    >
                                                        {isActive ? (
                                                            <Power size={14} />
                                                        ) : (
                                                            <RotateCcw size={14} />
                                                        )}
                                                    </button>
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

export default ManageTrainers;