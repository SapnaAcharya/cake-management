import { useEffect, useState } from "react";
import { GraduationCap, X } from "lucide-react";

import {
    sendEnrollmentOtp,
    verifyEnrollmentEmail,
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

    const [otp, setOtp] = useState("");
    const [verificationToken, setVerificationToken] = useState("");

    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Close on Escape and lock page scroll
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKey);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);

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

    // Step 1: Validate email
    const validateEmail = () => {
        const email = form.email.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            setError("Please enter your email address.");
            return false;
        }

        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return false;
        }

        return true;
    };

    // Step 2: Send OTP
    const handleSendOtp = async () => {
        setError("");

        if (!validateEmail()) return;

        try {
            setSendingOtp(true);

            await sendEnrollmentOtp(form.email.trim());

            setOtpSent(true);
            setOtp("");

        } catch (err) {
            console.error("SEND OTP ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Could not send the verification code. Please try again."
            );
        } finally {
            setSendingOtp(false);
        }
    };

    // Step 3: Verify OTP and receive verification token
    const handleVerifyOtp = async () => {
        setError("");

        if (!validateEmail()) return;

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter the valid six-digit OTP.");
            return;
        }

        try {
            setVerifyingOtp(true);

            const response = await verifyEnrollmentEmail(
                form.email.trim(),
                otp.trim()
            );

            if (!response.verificationToken) {
                throw new Error("Verification token was not returned.");
            }

            setVerificationToken(response.verificationToken);
            setEmailVerified(true);

            setError("");

        } catch (err) {
            console.error("VERIFY OTP ERROR:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Email verification failed. Please try again."
            );
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Step 4: Validate training enrollment form
    const validateEnrollmentForm = () => {
        if (
            !form.name.trim() ||
            !form.phone.trim()
        ) {
            setError("Please fill in your name and phone number.");
            return false;
        }

        if (!form.trainingBatchId) {
            setError("Please select a training batch.");
            return false;
        }

        if (!verificationToken) {
            setError("Please verify your email before enrolling.");
            return false;
        }

        return true;
    };

    // Step 5: Submit enrollment with verification token
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validateEnrollmentForm()) return;

        try {
            setSubmitting(true);

            await enrollInTraining({
                trainingId: Number(trainingId),
                trainingBatchId: Number(form.trainingBatchId),
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                whatsApp: form.whatsApp.trim(),
                city: form.city.trim(),
                experienceLevel: form.experienceLevel,
                verificationToken: verificationToken
            });

            setSuccess(true);

        } catch (err) {
            console.error("TRAINING ENROLLMENT ERROR:", err);

            setError(
                err.response?.data?.message ||
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
                e.target === e.currentTarget && onClose()
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

                        {/* STAGE 1: EMAIL VERIFICATION */}
                        {!emailVerified && (
                            <>
                                <div className="enroll-full">
                                    <h3>Verify Your Email Address</h3>

                                    <p>
                                        Please verify your email address
                                        before proceeding with your
                                        training enrollment.
                                    </p>
                                </div>

                                <label className="enroll-field enroll-full">
                                    <span>
                                        Email Address <em>*</em>
                                    </span>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            setForm((prev) => ({
                                                ...prev,
                                                email: value
                                            }));

                                            // Reset verification if email changes
                                            setOtpSent(false);
                                            setOtp("");
                                            setVerificationToken("");
                                            setError("");
                                        }}
                                        placeholder="your@email.com"
                                        autoFocus
                                        disabled={sendingOtp || verifyingOtp}
                                    />
                                </label>

                                {/* SEND OTP BUTTON */}
                                <div className="enroll-full">
                                    <button
                                        type="button"
                                        className="enroll-submit"
                                        onClick={handleSendOtp}
                                        disabled={
                                            sendingOtp ||
                                            verifyingOtp
                                        }
                                    >
                                        {sendingOtp
                                            ? "Sending OTP..."
                                            : otpSent
                                                ? "Resend OTP"
                                                : "Send OTP to Email"}
                                    </button>

                                    {otpSent && (
                                        <p>
                                            A verification code has been
                                            sent to{" "}
                                            <strong>{form.email}</strong>.
                                            Please check your inbox.
                                        </p>
                                    )}
                                </div>

                                {/* OTP INPUT */}
                                {otpSent && (
                                    <>
                                        <label className="enroll-field enroll-full">
                                            <span>
                                                Enter Verification Code{" "}
                                                <em>*</em>
                                            </span>

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => {
                                                    setOtp(
                                                        e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 6)
                                                    );

                                                    setError("");
                                                }}
                                                placeholder="Enter 6-digit OTP"
                                                autoComplete="one-time-code"
                                            />

                                            <small>
                                                The OTP is valid for
                                                5 minutes.
                                            </small>
                                        </label>

                                        <div className="enroll-full">
                                            <button
                                                type="button"
                                                className="enroll-submit"
                                                onClick={handleVerifyOtp}
                                                disabled={
                                                    verifyingOtp ||
                                                    sendingOtp
                                                }
                                            >
                                                {verifyingOtp
                                                    ? "Verifying Email..."
                                                    : "Verify Email"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* STAGE 2: FULL ENROLLMENT FORM */}
                        {emailVerified && (
                            <>
                                <div className="enroll-full">
                                    <h3>Email Verified Successfully!</h3>

                                    <p>
                                        Your email{" "}
                                        <strong>{form.email}</strong>{" "}
                                        has been verified. Please complete
                                        your training enrollment details.
                                    </p>
                                </div>

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
                                    />
                                </label>

                                <label className="enroll-field">
                                    <span>
                                        Email Address
                                    </span>

                                    <input
                                        type="email"
                                        value={form.email}
                                        readOnly
                                    />
                                </label>

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
                                    />
                                </label>

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

                                <label className="enroll-field">
                                    <span>City</span>

                                    <input
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="Your city"
                                    />
                                </label>

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
                            </>
                        )}

                        {/* ERROR MESSAGE FOR EMAIL/OTP STAGE */}
                        {!emailVerified && error && (
                            <p
                                className="enroll-error enroll-full"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {/* CANCEL BUTTON */}
                        {!emailVerified && (
                            <div className="enroll-actions enroll-full">
                                <button
                                    type="button"
                                    className="enroll-cancel"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}

                    </form>
                )}
            </div>
        </div>
    );
}

