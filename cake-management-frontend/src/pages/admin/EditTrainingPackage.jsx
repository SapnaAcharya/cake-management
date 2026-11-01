import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { API_ORIGIN } from "../../config/apiConfig";

import AdminLayout from "../../layouts/AdminLayout";
import trainingPackageAdminService from "../../services/training/trainingPackageAdminService";
import "../../styles/AdminDashboard.css";

function EditTrainingPackage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        skillLevel: "Beginner",
        durationInDays: "",
        fee: "",
        description: "",
        learningOutcomes: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [existingImageUrl, setExistingImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [newPreview, setNewPreview] = useState("");

    useEffect(() => {
       return () => {
         if (newPreview) URL.revokeObjectURL(newPreview);
        };
    }, [newPreview]);

    const fetchPackage = useCallback(async () => {
        try {
            const data = await trainingPackageAdminService.getById(id);
            setError("");

            setForm({
                name: data.name ?? "",
                skillLevel: data.skillLevel ?? "Beginner",
                durationInDays: data.durationInDays ?? "",
                fee: data.fee ?? "",
                description: data.description ?? "",
                learningOutcomes: Array.isArray(data.learningOutcomes)
                    ? data.learningOutcomes.join("\n")
                    : data.learningOutcomes ?? "",
                isActive: data.isActive ?? data.active ?? true,
            });
            setExistingImageUrl(data.imageUrl ?? "");
        } catch (err) {
            console.error("Failed to load training package:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Failed to load this training package. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        Promise.resolve().then(fetchPackage);
    }, [fetchPackage]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

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

    setNewPreview((previousPreview) => {
        if (previousPreview) {
            URL.revokeObjectURL(previousPreview);
        }

        return URL.createObjectURL(file);
    });

    setImageFile(file);
};

// Cancels the newly chosen image and goes back to the saved one
const handleCancelNewImage = () => {
    setImageFile(null);
    setNewPreview("");

    const input = document.getElementById("courseImage");
    if (input) input.value = "";
};

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
            setError("Please enter a valid duration in whole days.");
            return;
        }

        if (form.fee === "" || !Number.isFinite(Number(form.fee)) ||
            Number(form.fee) < 0) {
            setError("Please enter a valid training fee.");
            return;
        }

        const payload = new FormData();

payload.append("Name", form.name.trim());
payload.append("SkillLevel", form.skillLevel);
payload.append("DurationInDays", Number(form.durationInDays));
payload.append("Fee", Number(form.fee));
payload.append("Description", form.description.trim());
payload.append(
    "LearningOutcomes",
    form.learningOutcomes
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .join("\n")
);
payload.append("IsActive", form.isActive);

if (imageFile) {
    payload.append("Image", imageFile);
}

        try {
            setSaving(true);

            await trainingPackageAdminService.update(id, payload);

            navigate("/admin/training-packages");
        } catch (err) {
            console.error("Failed to update training package:", err);

            const responseData = err.response?.data;
            const validationErrors = responseData?.errors;

            if (validationErrors) {
                setError(
                    Object.values(validationErrors).flat().join(" ") ||
                    "Please check the information and try again."
                );
            } else {
                setError(
                    responseData?.message ||
                    responseData?.title ||
                    "Failed to update the training package. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout
            title="Edit Training Package"
            subtitle="Update the course details and training information."
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
                {loading ? (
                    <div className="manage-cakes-status">
                        Loading training package...
                    </div>
                ) : error && !form.name ? (
                    <div className="manage-cakes-status error" role="alert">
                        {error}
                        <button
                            type="button"
                            className="retry-link"
                            onClick={fetchPackage}
                        >
                            Retry
                        </button>
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
                                <label htmlFor="name">Course Name *</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    maxLength={150}
                                    required
                                />
                            </div>

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
                                    required
                                />
                            </div>

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
                                    required
                                />
                            </div>

                            <div className="training-form-field training-form-full">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the training course."
                                />
                            </div>

                            <div className="training-form-field training-form-full">
                                <label htmlFor="learningOutcomes">
                                    Learning Outcomes
                                </label>
                                <textarea
                                    id="learningOutcomes"
                                    name="learningOutcomes"
                                    rows={5}
                                    value={form.learningOutcomes}
                                    onChange={handleChange}
                                    placeholder="Enter one learning outcome per line."
                                />
                                <small>
                                    Enter each learning outcome on a separate line.
                                </small>
                            </div>

                            <div className="training-form-field training-form-full">
    <label htmlFor="courseImage">Course Image</label>

    <div className="training-image-upload">
        {newPreview || existingImageUrl ? (
            <div className="training-image-preview">
                <img
                    src={newPreview || `${API_ORIGIN}${existingImageUrl}`}
                    alt="Training course"
                />

                <div className="training-image-actions">
                    <label
                        htmlFor="courseImage"
                        className="admin-secondary-btn"
                        style={{ cursor: "pointer" }}
                    >
                        <Upload size={16} />
                        {newPreview ? "Choose another" : "Change image"}
                    </label>

                    {newPreview && (
                        <button
                            type="button"
                            className="training-remove-image"
                            onClick={handleCancelNewImage}
                        >
                            <X size={16} />
                            Cancel new image
                        </button>
                    )}
                </div>
            </div>
        ) : (
            <label
                htmlFor="courseImage"
                className="training-image-upload-box"
            >
                <Upload size={32} />
                <span>Click to upload course image</span>
                <small>PNG, JPG, JPEG or WEBP (Maximum 5 MB)</small>
            </label>
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
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}

export default EditTrainingPackage;
