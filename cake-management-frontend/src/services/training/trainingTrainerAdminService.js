import api from "../api";

const TRAINERS_URL = "/trainers";

const getAll = async () => {
    const response = await api.get(`${TRAINERS_URL}/admin/all`);
    return response.data;
};

const getById = async (id) => {
    const response = await api.get(`${TRAINERS_URL}/admin/${id}`);
    return response.data;
};

const create = async (trainer) => {
    const response = await api.post(TRAINERS_URL, trainer);
    return response.data;
};

const update = async (id, trainer) => {
    const response = await api.put(`${TRAINERS_URL}/${id}`, trainer);
    return response.data;
};

const deactivate = async (id) => {
    const response = await api.patch(`${TRAINERS_URL}/${id}/deactivate`);
    return response.data;
};

const activate = async (id) => {
    const response = await api.patch(`${TRAINERS_URL}/${id}/activate`);
    return response.data;
};

const trainingTrainerAdminService = {
    getAll,
    getById,
    create,
    update,
    deactivate,
    activate,
};

export default trainingTrainerAdminService;