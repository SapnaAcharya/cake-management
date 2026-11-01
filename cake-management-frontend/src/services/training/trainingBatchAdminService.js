
import api from "../api";

const TRAINING_BATCHES_URL = "/trainingbatches";

// Get all batches, including closed and cancelled batches.
const getAll = async () => {
  const response = await api.get(`${TRAINING_BATCHES_URL}/admin/all`);
  return response.data;
};

// Get one batch by ID.
const getById = async (id) => {
  const response = await api.get(
    `${TRAINING_BATCHES_URL}/admin/${id}`
  );
  return response.data;
};

// Create a new training batch.
const create = async (batch) => {
  const response = await api.post(TRAINING_BATCHES_URL, batch);
  return response.data;
};

// Update an existing training batch.
const update = async (id, batch) => {
  const response = await api.put(
    `${TRAINING_BATCHES_URL}/${id}`,
    batch
  );
  return response.data;
};

// Close a training batch without deleting its history.
const close = async (id) => {
  const response = await api.patch(
    `${TRAINING_BATCHES_URL}/${id}/close`
  );
  return response.data;
};

const trainingBatchAdminService = {
  getAll,
  getById,
  create,
  update,
  close,
};

export default trainingBatchAdminService;
