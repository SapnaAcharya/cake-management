
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import trainingTrainerAdminService from "../../services/training/trainingTrainerAdminService";
import "../../styles/AdminDashboard.css";

const initialForm = {
    fullName: "",
    qualifications: "",
    bio: "",
    email: "",
    phoneNumber: "",
};

function AddTrainer() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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

            await trainingTrainerAdminService.create(payload);

            navigate("/admin/trainers");
        } catch (err) {
            console.error("Failed to create trainer:", err);

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
                    "Failed to create trainer. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout
            title="Add Trainer"
            subtitle="Add a trainer to your bakery and cake decorating training team."
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
                                value={form.fullName}
                                onChange={handleChange}
                                maxLength={150}
                                placeholder="Enter trainer's full name"
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
                                value={form.qualifications}
                                onChange={handleChange}
                                maxLength={250}
                                placeholder="e.g. Professional Pastry Chef"
                                required
                            />
                        </div>

                        <div className="training-form-field training-form-full">
                            <label htmlFor="bio">
                                Biography
                            </label>

                            <textarea
                                id="bio"
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                maxLength={2000}
                                rows={5}
                                placeholder="Describe the trainer's experience and expertise."
                            />

                            <small>
                                Optional. Maximum 2000 characters.
                            </small>
                        </div>

                        <div className="training-form-field">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                maxLength={254}
                                placeholder="trainer@example.com"
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
                                value={form.phoneNumber}
                                onChange={handleChange}
                                maxLength={30}
                                placeholder="Enter phone number"
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
                            {saving ? "Saving..." : "Save Trainer"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

export default AddTrainer;
