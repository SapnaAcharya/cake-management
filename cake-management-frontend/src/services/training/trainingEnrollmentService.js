import api from "../api";

// Step 1: Submit enrollment using the verification token
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
