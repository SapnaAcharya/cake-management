
import api from "../api";

const REGISTRATIONS_URL = "/trainingregistrations";

// Get all customer training registrations (Admin only).
const getAll = async () => {
    const response = await api.get(REGISTRATIONS_URL);
    return response.data;
};

// Update registration and payment statuses (Admin only).
const updateStatus = async (id, status, paymentStatus) => {
    const response = await api.patch(
        `${REGISTRATIONS_URL}/${id}/status`,
        {
            status,
            paymentStatus,
        }
    );

    return response.data;
};

const trainingRegistrationAdminService = {
    getAll,
    updateStatus,
};

export default trainingRegistrationAdminService;
