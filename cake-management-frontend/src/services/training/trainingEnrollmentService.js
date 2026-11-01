import api from "../api";

// Step 1: Send OTP to customer's email
export const sendEnrollmentOtp = async (email) => {
    const response = await api.post(
        "/training/send-enrollment-otp",
        { email }
    );

    return response.data;
};

// Step 2: Verify OTP and receive verification token
export const verifyEnrollmentEmail = async (email, otp) => {
    const response = await api.post(
        "/training/verify-enrollment-email",
        {
            email,
            otp
        }
    );

    return response.data;
};

// Step 3: Submit enrollment using the verification token
export const enrollInTraining = async (data) => {
    const response = await api.post(
        "/training/enroll",
        data
    );

    return response.data;
};

// Admin: Get all customer enrollments
export const getAllTrainingEnrollments = async () => {
    const response = await api.get(
        "/training/enrollments"
    );

    return response.data;
};

// Admin: Get a specific enrollment by ID
export const getTrainingEnrollmentById = async (id) => {
    const response = await api.get(
        `/training/enrollments/${id}`
    );

    return response.data;
};
