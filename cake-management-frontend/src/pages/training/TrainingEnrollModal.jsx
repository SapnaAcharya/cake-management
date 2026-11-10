import { useEffect, useState } from "react";
import { GraduationCap, X } from "lucide-react";

import {
    enrollInTraining
} from "../../services/training/trainingEnrollmentService";

import "./TrainingEnrollModal.css";

const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    whatsApp: "",
    city: "",
    experienceLevel: "Beginner",
    trainingBatchId: "",
};

export default function TrainingEnrollModal({
    courseName,
    trainingId,
    batches = [],
    onClose
}) {
    const [form, setForm] = useState(EMPTY_FORM);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Close on Escape and lock page scroll
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !submitting) {
                onClose();
            }
        };

        document.addEventListener("keydown", onKey);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose, submitting]);

    // Only display open batches
    const openBatches = batches.filter(
        (batch) => batch.status?.toLowerCase() === "open"
    );

    const selectedBatch = openBatches.find(
        (batch) => batch.id === Number(form.trainingBatchId)
    );

    // Format training dates
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC"
        });
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    // Validate enrollment form
    const validateEnrollmentForm = () => {
        if (!form.name.trim()) {
            setError("Please enter your full name.");
            return false;
        }

        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(form.email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (!form.phone.trim()) {
            setError("Please enter your phone number.");
            return false;
        }

        if (!form.trainingBatchId) {
            setError("Please select a training batch.");
            return false;
        }

        return true;
    };

    // Submit enrollment directly without OTP verification
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEnrollmentForm()) return;

        try {
            setSubmitting(true);

            const enrollmentData = {
                trainingId: Number(trainingId),
                trainingBatchId: Number(form.trainingBatchId),
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                whatsApp: form.whatsApp.trim() || null,
                city: form.city.trim() || null,
                experienceLevel: form.experienceLevel || "Beginner"
            };

            const response = await enrollInTraining(enrollmentData);

            if (response.success === false) {
                throw new Error(
                    response.message || "Training enrollment failed."
                );
            }

            setSuccess(true);

        } catch (err) {
            console.error("TRAINING ENROLLMENT ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Training enrollment failed. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="enroll-overlay"
            onMouseDown={(e) =>
                e.target === e.currentTarget && !submitting && onClose()
            }
        >
            <div
                className="enroll-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="enroll-title"
            >
                {/* Modal Header */}
                <div className="enroll-header">
                    <h2 id="enroll-title">
                        <GraduationCap size={20} />
                        Enroll for {courseName}
                    </h2>

                    <button
                        type="button"
                        className="enroll-close"
                        onClick={onClose}
                        aria-label="Close"
                        disabled={submitting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* SUCCESS SCREEN */}
                {success ? (
                    <div className="enroll-ok">

                        <div className="enroll-ok-circle">
                            <svg
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#16a34a"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <h3>
                            Thank you, {form.name.split(" ")[0]}!
                        </h3>

                        <p className="enroll-ok-sub">
                            Your registration for{" "}
                            <strong>{courseName}</strong> was successful.
                        </p>

                        {selectedBatch && (
                            <div className="selected-batch-details">
                                <h4>Confirmed Training Schedule</h4>

                                <p>
                                    <strong>Start Date:</strong>{" "}
                                    {formatDate(selectedBatch.startDate)}
                                </p>

                                <p>
                                    <strong>End Date:</strong>{" "}
                                    {formatDate(selectedBatch.endDate)}
                                </p>

                                <p>
                                    <strong>Time Schedule:</strong>{" "}
                                    {selectedBatch.scheduleDetails}
                                </p>
                            </div>
                        )}

                        <p className="enroll-ok-thanks">
                            Thank you for choosing{" "}
                            <strong>SweetCakes</strong> for your baking
                            journey. We're excited to have you with us
                            and can't wait to help you turn your passion
                            into something delicious!
                        </p>

                        <p className="enroll-ok-footer">
                            Have questions in the meantime? Just reply
                            to our message or visit our Contact page.
                        </p>

                        <button
                            type="button"
                            className="enroll-submit"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form
                        className="enroll-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {/* CUSTOMER INFORMATION */}

                        <div className="enroll-full">
                            <h3>Training Enrollment Details</h3>

                            <p>
                                Please complete the form below to register
                                for your selected training course.
                            </p>
                        </div>

                        {/* FULL NAME */}
                        <label className="enroll-field enroll-full">
                            <span>
                                Full Name <em>*</em>
                            </span>

                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoFocus
                                required
                            />
                        </label>

                        {/* EMAIL */}
                        <label className="enroll-field enroll-full">
                            <span>
                                Email Address <em>*</em>
                            </span>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                required
                            />
                        </label>

                        {/* PHONE */}
                        <label className="enroll-field">
                            <span>
                                Phone Number <em>*</em>
                            </span>

                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Your phone number"
                                required
                            />
                        </label>

                        {/* WHATSAPP */}
                        <label className="enroll-field">
                            <span>WhatsApp</span>

                            <input
                                type="tel"
                                name="whatsApp"
                                value={form.whatsApp}
                                onChange={handleChange}
                                placeholder="Your WhatsApp number"
                            />
                        </label>

                        {/* CITY */}
                        <label className="enroll-field">
                            <span>City</span>

                            <input
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="Your city"
                            />
                        </label>

                        {/* EXPERIENCE LEVEL */}
                        <label className="enroll-field">
                            <span>Experience Level</span>

                            <select
                                name="experienceLevel"
                                value={form.experienceLevel}
                                onChange={handleChange}
                            >
                                <option value="Beginner">
                                    Beginner
                                </option>

                                <option value="Intermediate">
                                    Intermediate
                                </option>

                                <option value="Advanced">
                                    Advanced
                                </option>
                            </select>
                        </label>

                        {/* TRAINING BATCH SELECTION */}
                        <label className="enroll-field enroll-full">
                            <span>
                                Select Training Batch <em>*</em>
                            </span>

                            <select
                                name="trainingBatchId"
                                value={form.trainingBatchId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    Choose your training batch
                                </option>

                                {openBatches.map((batch) => (
                                    <option
                                        key={batch.id}
                                        value={batch.id}
                                    >
                                        {formatDate(batch.startDate)}
                                        {" - "}
                                        {formatDate(batch.endDate)}
                                    </option>
                                ))}
                            </select>

                            {openBatches.length === 0 && (
                                <small>
                                    No open training batches are
                                    currently available.
                                </small>
                            )}
                        </label>

                        {/* SELECTED BATCH INFORMATION */}
                        {selectedBatch && (
                            <div className="selected-batch-details enroll-full">
                                <h4>Training Schedule</h4>

                                <p>
                                    <strong>Start Date:</strong>{" "}
                                    {formatDate(selectedBatch.startDate)}
                                </p>

                                <p>
                                    <strong>End Date:</strong>{" "}
                                    {formatDate(selectedBatch.endDate)}
                                </p>

                                <p>
                                    <strong>Time Schedule:</strong>{" "}
                                    {selectedBatch.scheduleDetails}
                                </p>
                            </div>
                        )}

                        {/* ERROR MESSAGE */}
                        {error && (
                            <p
                                className="enroll-error enroll-full"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {/* ENROLLMENT ACTIONS */}
                        <div className="enroll-actions enroll-full">
                            <button
                                type="button"
                                className="enroll-cancel"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="enroll-submit"
                                disabled={
                                    submitting ||
                                    openBatches.length === 0
                                }
                            >
                                {submitting
                                    ? "Submitting Enrollment..."
                                    : "Complete Enrollment"}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
}

