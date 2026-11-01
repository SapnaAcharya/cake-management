import api from "../api";

const TRAINING_PACKAGES_URL = "/trainingpackages";

const getAllActive = async () => {
    const response = await api.get(TRAINING_PACKAGES_URL);
    return response.data;
};

const getActiveById = async (id) => {
    const response = await api.get(`${TRAINING_PACKAGES_URL}/${id}`);
    return response.data;
};

const trainingPackageService = {
    getAllActive,
    getActiveById,
};

export default trainingPackageService;
