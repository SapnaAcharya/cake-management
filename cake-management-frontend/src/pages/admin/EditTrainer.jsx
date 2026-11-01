
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import trainingTrainerAdminService from "../../services/training/trainingTrainerAdminService";
import "../../styles/AdminDashboard.css";

function EditTrainer() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        qualifications: "",
        bio: "",
        email: "",
        phoneNumber: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchTrainer = useCallback(async () => {
        try {
            const data = await trainingTrainerAdminService.getById(id);

            setError("");

            setForm({
                fullName: data.fullName ?? data.FullName ?? "",
                qualifications:
                    data.qualifications ?? data.Qualifications ?? "",
                bio: data.bio ?? data.Bio ?? "",
                email: data.email ?? data.Email ?? "",
                phoneNumber:
                    data.phoneNumber ?? data.PhoneNumber ?? "",
            });
        } catch (err) {
            console.error("Failed to load trainer:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to load trainer. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTrainer();
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchTrainer]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.fullName.trim()) {
            setError("Please enter the trainer's full name.");
            return;
        }

        if (!form.qualifications.trim()) {
            setError("Please enter the trainer's qualifications.");
            return;
        }

        const payload = {
            fullName: form.fullName.trim(),
            qualifications: form.qualifications.trim(),
            bio: form.bio.trim() || null,
            email: form.email.trim() || null,
            phoneNumber: form.phoneNumber.trim() || null,
        };

        try {
            setSaving(true);

            await trainingTrainerAdminService.update(id, payload);

            navigate("/admin/trainers");
        } catch (err) {
            console.error("Failed to update trainer:", err);

            const responseData = err.response?.data;
            const validationErrors = responseData?.errors;

            if (validationErrors) {
                setError(
                    Object.values(validationErrors).flat().join(" ") ||
                    "Please check the information you entered."
                );
            } else {
                setError(
                    responseData?.message ||
                    responseData?.title ||
                    "Failed to update trainer. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout
            title="Edit Trainer"
            subtitle="Update trainer information and qualifications."
            headerAction={
                <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => navigate("/admin/trainers")}
                >
                    <ArrowLeft size={16} />
                    Back to Trainers
                </button>
            }
        >
            <div className="manage-cakes-card training-form-card">
                {loading ? (
                    <div className="manage-cakes-status">
                        Loading trainer...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="training-form-error" role="alert">
                                {error}
                            </div>
                        )}

                        <div className="training-form-grid">
                            <div className="training-form-field">
                                <label htmlFor="fullName">
                                    Full Name *
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    maxLength={150}
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="training-form-field">
                                <label htmlFor="qualifications">
                                    Qualifications *
                                </label>
                                <input
                                    id="qualifications"
                                    name="qualifications"
                                    type="text"
                                    maxLength={250}
                                    value={form.qualifications}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="training-form-field training-form-full">
                                <label htmlFor="bio">Biography</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={5}
                                    maxLength={2000}
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Describe the trainer's experience."
                                />
                            </div>

                            <div className="training-form-field">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    maxLength={254}
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="training-form-field">
                                <label htmlFor="phoneNumber">
                                    Phone Number
                                </label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    maxLength={30}
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="training-form-actions">
                            <button
                                type="button"
                                className="admin-secondary-btn"
                                onClick={() => navigate("/admin/trainers")}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-primary-btn"
                                disabled={saving}
                            >
                                <Save size={16} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}

export default EditTrainer;
