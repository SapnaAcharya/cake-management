import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Pencil, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";

import AdminLayout from "../../layouts/AdminLayout";
import trainingPackageAdminService from "../../services/training/trainingPackageAdminService";
import "../../styles/AdminDashboard.css";

function ManageTrainingPackages() {
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await trainingPackageAdminService.getAll();

            setPackages(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load training packages. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(fetchPackages, 0);
        return () => window.clearTimeout(timeoutId);
    }, [fetchPackages]);

    const filteredPackages = packages.filter((trainingPackage) =>
        (trainingPackage.name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleDeactivate = async (trainingPackage) => {
        const confirmed = window.confirm(
            `Deactivate "${trainingPackage.name}"?`
        );

        if (!confirmed) return;

        try {
            await trainingPackageAdminService.deactivate(
                trainingPackage.id
            );

            await fetchPackages();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to deactivate the training package."
            );
        }
    };

    return (
        <AdminLayout
            title="Manage Training Packages"
            subtitle="Create, view, edit, and manage bakery training courses."
            headerAction={
                <button
                    className="admin-primary-btn"
                    onClick={() =>
                        navigate("/admin/training-packages/add")
                    }
                >
                    <Plus size={16} />
                    Add Training Package
                </button>
            }
        >
            <div className="manage-cakes-card">
                <div className="manage-cakes-filters">
                    <div className="manage-cakes-search">
                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Search training packages..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>
                </div>

                {loading && (
                    <div className="manage-cakes-status">
                        Loading training packages...
                    </div>
                )}

                {!loading && error && (
                    <div className="manage-cakes-status error">
                        {error}{" "}
                        <button
                            className="retry-link"
                            onClick={fetchPackages}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filteredPackages.length === 0 && (
                    <div className="manage-cakes-status">
                        {search
                            ? "No training packages match your search."
                            : "No training packages found. Add your first package."}
                    </div>
                )}

                {!loading && !error && filteredPackages.length > 0 && (
                    <div className="manage-cakes-table-wrap">
                        <table className="manage-cakes-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Course Name</th>
                                    <th>Skill Level</th>
                                    <th>Duration</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredPackages.map(
                                    (trainingPackage, index) => {
                                        const isActive =
                                            trainingPackage.isActive ??
                                            trainingPackage.active ??
                                            true;

                                        return (
                                            <tr key={trainingPackage.id}>
                                                <td>{index + 1}</td>
                                                <td>{trainingPackage.id}</td>

                                                <td>
    {trainingPackage.imageUrl ? (
        <img
            src={getImageUrl(trainingPackage.imageUrl)}
            alt={trainingPackage.name}
            className="training-table-thumb"
            onError={(event) => {
                event.currentTarget.style.display = "none";
            }}
        />
    ) : (
        <span className="training-no-image">No image</span>
    )}
</td>

                                                <td className="cake-name">
                                                    {trainingPackage.name}
                                                </td>

                                                <td>
                                                    {trainingPackage.skillLevel ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {trainingPackage.durationInDays != null
                                                        ? `${trainingPackage.durationInDays} day(s)`
                                                        : "—"}
                                                </td>

                                                <td>
                                                    Rs.{" "}
                                                    {Number(
                                                        trainingPackage.fee ?? 0
                                                    ).toLocaleString()}
                                                </td>

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
                                                            className="row-action-btn edit"
                                                            aria-label="Edit training package"
                                                            title="Edit training package"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/admin/training-packages/${trainingPackage.id}/edit`
                                                                )
                                                            }
                                                        >
                                                            <Pencil size={14} />
                                                        </button>

                                                        {isActive && (
                                                            <button
                                                                className="row-action-btn delete"
                                                                aria-label="Deactivate training package"
                                                                title="Deactivate training package"
                                                                onClick={() =>
                                                                    handleDeactivate(
                                                                        trainingPackage
                                                                    )
                                                                }
                                                            >
                                                                <Power size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default ManageTrainingPackages;
