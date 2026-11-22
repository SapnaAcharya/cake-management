import API_BASE_URL from "../config/apiConfig";

// Get authentication headers for admin APIs
const getAuthHeaders = () => {
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        ...(token && {
            Authorization: `Bearer ${token}`,
        }),
    };
};


// Handle API responses
const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong. Please try again."
        );
    }

    return data;
};

// CUSTOMER CONTACT SETTINGS APIs

// Get contact settings
const getContactSettings = async () => {
    const response = await fetch(
        `${API_BASE_URL}/contact/settings`
    );

    return handleResponse(response);
};

// Get active FAQs
const getFaqs = async () => {
    const response = await fetch(
        `${API_BASE_URL}/contact/settings/faqs`
    );

    return handleResponse(response);
};

// Submit customer enquiry
const sendContactMessage = async (data) => {
    const response = await fetch(
        `${API_BASE_URL}/contact`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    return handleResponse(response);
};

// ADMIN CONTACT SETTINGS APIs

// Update contact settings
const updateContactSettings = async (data) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/settings`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    );

    return handleResponse(response);
};

// Create FAQ
const createFaq = async (data) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/settings/faqs`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    );

    return handleResponse(response);
};

// Update FAQ
const updateFaq = async (id, data) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/settings/faqs/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        }
    );

    return handleResponse(response);
};

// Delete FAQ
const deleteFaq = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/settings/faqs/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

// ADMIN CONTACT MESSAGE APIs

// Get all contact messages
const getAllContactMessages = async () => {
    const response = await fetch(
        `${API_BASE_URL}/contact/messages`,
        {
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

// Get contact message by ID
const getContactMessageById = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/messages/${id}`,
        {
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

// Update contact message status
const updateContactMessageStatus = async (id, status) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/messages/${id}/status`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        }
    );

    return handleResponse(response);
};

// Delete contact message
const deleteContactMessage = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/contact/messages/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

const contactService = {
    getContactSettings,
    getFaqs,
    sendContactMessage,

    updateContactSettings,
    createFaq,
    updateFaq,
    deleteFaq,

    getAllContactMessages,
    getContactMessageById,
    updateContactMessageStatus,
    deleteContactMessage,
};

export default contactService;
