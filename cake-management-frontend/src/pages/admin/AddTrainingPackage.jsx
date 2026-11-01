import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import trainingPackageAdminService from "../../services/training/trainingPackageAdminService";
import "../../styles/AdminDashboard.css";

const initialForm = {
    name: "",
    skillLevel: "Beginner",
    durationInDays: "",
    fee: "",
    description: "",
    learningOutcomes: "",
    isActive: true,
};

function AddTrainingPackage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Image states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Clean up image preview URL
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Handle normal form inputs
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle image selection
    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Please upload a JPG, PNG, or WEBP image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            event.target.value = "";
            return;
        }

        setError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    // Remove selected image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview("");

        const imageInput = document.getElementById("courseImage");

        if (imageInput) {
            imageInput.value = "";
        }
    };

    // Submit training package
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Please enter the training package name.");
            return;
        }

        if (
            form.durationInDays === "" ||
            !Number.isInteger(Number(form.durationInDays)) ||
            Number(form.durationInDays) <= 0
        ) {
            setError("Please enter a valid duration in days.");
            return;
        }

        if (
            form.fee === "" ||
            !Number.isFinite(Number(form.fee)) ||
            Number(form.fee) < 0
        ) {
            setError("Please enter a valid training fee.");
            return;
        }

        // Create FormData for text and image upload
        const payload = new FormData();

        payload.append("Name", form.name.trim());
        payload.append("SkillLevel", form.skillLevel);
        payload.append("DurationInDays", Number(form.durationInDays));
        payload.append("Fee", Number(form.fee));
        payload.append("Description", form.description.trim());
        payload.append("LearningOutcomes", form.learningOutcomes.trim());
        payload.append("IsActive", form.isActive);

        // Append course image
        if (imageFile) {
            payload.append("Image", imageFile);
        }

        try {
            setSaving(true);

            await trainingPackageAdminService.create(payload);

            navigate("/admin/training-packages");
        } catch (err) {
            console.error("Failed to create training package:", err);

            const responseData = err.response?.data;
            const validationErrors = responseData?.errors;

            if (validationErrors) {
                const messages = Object.values(validationErrors)
                    .flat()
                    .join(" ");

                setError(
                    messages ||
                    "Please check the information and try again."
                );
            } else {
                setError(
                    responseData?.message ||
                    responseData?.title ||
                    "Failed to create the training package. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout
            title="Add Training Package"
            subtitle="Create a new bakery or cake decorating training course."
            headerAction={
                <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => navigate("/admin/training-packages")}
                >
                    <ArrowLeft size={16} />
                    Back to Packages
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

                        {/* Course Name */}
                        <div className="training-form-field">
                            <label htmlFor="name">Course Name *</label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Basic Cake Decorating"
                                maxLength={150}
                                required
                            />
                        </div>

                        {/* Skill Level */}
                        <div className="training-form-field">
                            <label htmlFor="skillLevel">Skill Level *</label>

                            <select
                                id="skillLevel"
                                name="skillLevel"
                                value={form.skillLevel}
                                onChange={handleChange}
                                required
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Duration */}
                        <div className="training-form-field">
                            <label htmlFor="durationInDays">
                                Duration (days) *
                            </label>

                            <input
                                id="durationInDays"
                                name="durationInDays"
                                type="number"
                                min="1"
                                step="1"
                                value={form.durationInDays}
                                onChange={handleChange}
                                placeholder="e.g. 7"
                                required
                            />
                        </div>

                        {/* Training Fee */}
                        <div className="training-form-field">
                            <label htmlFor="fee">Training Fee (Rs.) *</label>

                            <input
                                id="fee"
                                name="fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.fee}
                                onChange={handleChange}
                                placeholder="e.g. 5000"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="training-form-field training-form-full">
                            <label htmlFor="description">Description</label>

                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe what students will learn in this course."
                                rows={4}
                            />
                        </div>

                        {/* Learning Outcomes */}
                        <div className="training-form-field training-form-full">
                            <label htmlFor="learningOutcomes">
                                Learning Outcomes
                            </label>

                            <textarea
                                id="learningOutcomes"
                                name="learningOutcomes"
                                value={form.learningOutcomes}
                                onChange={handleChange}
                                placeholder={
                                    "Enter one learning outcome per line.\nExample: Prepare and bake a basic sponge cake"
                                }
                                rows={5}
                            />

                            <small>
                                Enter each learning outcome on a separate line.
                            </small>
                        </div>

                        {/* Course Image Upload */}
                        <div className="training-form-field training-form-full">

                            <label htmlFor="courseImage">
                                Course Image
                            </label>

                            <div className="training-image-upload">

                                {!imagePreview ? (

                                    <label
                                        htmlFor="courseImage"
                                        className="training-image-upload-box"
                                    >
                                        <Upload size={32} />

                                        <span>
                                            Click to upload course image
                                        </span>

                                        <small>
                                            PNG, JPG, JPEG or WEBP
                                            (Maximum 5 MB)
                                        </small>
                                    </label>

                                ) : (

                                    <div className="training-image-preview">

                                        <img
                                            src={imagePreview}
                                            alt="Training course preview"
                                        />

                                        <button
                                            type="button"
                                            className="training-remove-image"
                                            onClick={handleRemoveImage}
                                        >
                                            <X size={16} />
                                            Remove Image
                                        </button>

                                    </div>

                                )}

                                <input
                                    id="courseImage"
                                    name="Image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageChange}
                                    hidden
                                />

                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="training-form-field training-form-full">

                            <label className="training-active-toggle">

                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={form.isActive}
                                    onChange={handleChange}
                                />

                                <span>
                                    Make this training package active
                                </span>

                            </label>

                        </div>

                    </div>

                    {/* Form Actions */}
                    <div className="training-form-actions">

                        <button
                            type="button"
                            className="admin-secondary-btn"
                            onClick={() =>
                                navigate("/admin/training-packages")
                            }
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

                            {saving
                                ? "Saving..."
                                : "Save Training Package"}
                        </button>

                    </div>

                </form>

            </div>
        </AdminLayout>
    );
}

export default AddTrainingPackage;

