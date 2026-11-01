import api from "../api";

const TRAINING_PACKAGES_URL = "/trainingpackages";

const getAll = async () => {
    const response = await api.get(TRAINING_PACKAGES_URL);
    return response.data;
};

const getById = async (id) => {
    const response = await api.get(
        `${TRAINING_PACKAGES_URL}/${id}`
    );
    return response.data;
};

const create = async (trainingPackage) => {
    const response = await api.post(TRAINING_PACKAGES_URL, trainingPackage, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Update training package with image upload
const update = async (id, trainingPackage) => {
    const response = await api.put(`${TRAINING_PACKAGES_URL}/${id}`, trainingPackage, {
         headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

const deactivate = async (id) => {
    const response = await api.patch(
        `${TRAINING_PACKAGES_URL}/${id}/deactivate`
    );

    return response.data;
};

const trainingPackageAdminService = {
    getAll,
    getById,
    create,
    update,
    deactivate,
};

export default trainingPackageAdminService;
