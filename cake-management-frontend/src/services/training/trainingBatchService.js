import api from "../api";

const TRAINING_BATCHES_URL = "/trainingbatches";

const getAllOpen = async () => {
    const response = await api.get(TRAINING_BATCHES_URL);
    return response.data;
};

const getOpenById = async (id) => {
    const response = await api.get(`${TRAINING_BATCHES_URL}/${id}`);
    return response.data;
};

const trainingBatchService = {
    getAllOpen,
    getOpenById,
};

export default trainingBatchService;
