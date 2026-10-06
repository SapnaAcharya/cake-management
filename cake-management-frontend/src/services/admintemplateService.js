import API_BASE_URL from "../config/apiConfig";

const getAuthHeaders = (isFormData = false) => {
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

// Get all templates
const getTemplates = async () => {
    const response = await fetch(`${API_BASE_URL}/templates`);

    if (!response.ok) {
        throw new Error("Failed to fetch templates");
    }

    return await response.json();
};

// Get template by ID
const getTemplateById = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/templates/${id}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch template");
    }

    return await response.json();
};

// Create template
const createTemplate = async (templateData) => {
    const isFormData = templateData instanceof FormData;

    const response = await fetch(`${API_BASE_URL}/admin/templates`, {
        method: "POST",
        headers: getAuthHeaders(isFormData),
        body: isFormData
            ? templateData
            : JSON.stringify(templateData)
    });

    if (!response.ok) {
        throw new Error("Failed to create template");
    }

    return await response.json();
};

// Update template
const updateTemplate = async (id, templateData) => {
    const isFormData = templateData instanceof FormData;

    const response = await fetch(
        `${API_BASE_URL}/admin/templates/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(isFormData),
            body: isFormData
                ? templateData
                : JSON.stringify(templateData)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update template");
    }

    return await response.json();
};

// Delete template
const deleteTemplate = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/admin/templates/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete template");
    }

    return await response.text();
};


const addTemplateImages = async (id, imageData) => {
    const response = await fetch(
        `${API_BASE_URL}/admin/templates/${id}/images`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(imageData),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to add images");
    }

    return await response.json();
};

const templateService = {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addTemplateImages,
};

export default templateService;