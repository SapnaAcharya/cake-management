import API_BASE_URL from "../config/apiConfig";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

// GET: api/User/profile
const getMyProfile = async () => {
    const response = await fetch(`${API_BASE_URL}/User/profile`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to fetch profile.");
    }

    return await response.json();
};

// PUT: api/User/profile
const updateMyProfile = async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/User/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
    });

    if (!response.ok) {
        throw new Error("Failed to update profile.");
    }

    return await response.json();
};

const changePassword = async ({ currentPassword, newPassword}) => {
    const response = await fetch(`${API_BASE_URL}/User/change-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword})
    });
    return response.data;
}

// GET: api/User/orders
const getMyOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/User/orders`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to fetch order history.");
    }

    return await response.json();
};

const profileService = {
    getMyProfile,
    updateMyProfile,
    changePassword,
    getMyOrders
};

export default profileService;