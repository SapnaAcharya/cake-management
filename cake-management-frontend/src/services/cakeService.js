import API_BASE_URL from "../config/apiConfig";

const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token") ||
     sessionStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`
    };

    // Don't set Content-Type for FormData — the browser sets it
    // automatically with the correct multipart boundary.
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

// Get all cakes
const getCakes = async (pageNumber = 1, pageSize = 10, categoryId = null) => {
    let url = `${API_BASE_URL}/Cakes?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (categoryId !== null) {
        url += `&categoryId=${encodeURIComponent(categoryId)}`;
    }
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch cakes");
    }

    return await response.json();
};

// Get cake by ID
const getCakeById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/Cakes/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch cake");
    }

    return await response.json();
};

// Get cake by slug
const getCakeBySlug = async (slug) => {
    const response = await fetch(
        `${API_BASE_URL}/Cakes/${encodeURIComponent(slug)}`
    );

    if (response.status === 404) {
        throw new Error("Cake not found");
    }

    if (!response.ok) {
        throw new Error("Failed to fetch cake");
    }

    return await response.json();
};

// Create cake
const createCake = async (cakeData) => {
    const isFormData = cakeData instanceof FormData;

    const response = await fetch(`${API_BASE_URL}/Cakes`, {
        method: "POST",
        headers: getAuthHeaders(isFormData),
        body: isFormData ? cakeData : JSON.stringify(cakeData)
    });

    if (!response.ok) {
        let message = "Failed to create cake";
        try {
            const body = await response.json();
            message = body.message || message;
        } catch {
            // Ignore JSON parsing errors and fall back to the default message.
        }
        throw new Error(message);
    }

    return await response.text();
};

// Update cake (admin only)
const updateCake = async (id, cakeData) => {
    const isFormData = cakeData instanceof FormData;

    const response = await fetch(`${API_BASE_URL}/Cakes/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(isFormData),
        body: isFormData ? cakeData : JSON.stringify(cakeData)
    });

    if (!response.ok) {
        throw new Error("Failed to update cake");
    }

    return await response.text();
};

// Delete cake
const deleteCake = async (id) => {
    const response = await fetch(`${API_BASE_URL}/Cakes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to delete cake");
    }

    return await response.text();
};

// Update personalized-message settings (admin only)
const updateMessageSettings = async (id, settings) => {
    const response = await fetch(`${API_BASE_URL}/Cakes/${id}/message-settings`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
    });

    if (!response.ok) {
        let message = "Failed to update message settings";
        try {
            const body = await response.json();
            message = body.message || message;
        } catch {
            // Fall back to the default message.
        }
        throw new Error(message);
    }

    // The endpoint returns 204 No Content, so there is no body to parse.
};

const cakeService = {
    getCakes,
    getCakeById,
    getCakeBySlug,
    createCake,
    updateCake,
    deleteCake,
    updateMessageSettings,
};

export default cakeService;