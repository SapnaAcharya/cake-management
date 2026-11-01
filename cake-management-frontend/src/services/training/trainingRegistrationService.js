
import api from "../api";

const TRAINING_REGISTRATIONS_URL = "/trainingregistrations";

const register = async (trainingBatchId) => {
    const response = await api.post(TRAINING_REGISTRATIONS_URL, {
        trainingBatchId,
    });

    return response.data;
};

const getMyRegistrations = async () => {
    const response = await api.get(
        `${TRAINING_REGISTRATIONS_URL}/my`
    );

    return response.data;
};

const trainingRegistrationService = {
    register,
    getMyRegistrations,
};

export default trainingRegistrationService;
