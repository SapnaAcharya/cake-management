import API_BASE_URL from "../config/apiConfig";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

// GET ALL USERS
export const getAllUsers = async () => {
    const response = await fetch(
        `${API_BASE_URL}/AdminUser/users`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch users.");
    }

    return await response.json();
};

// GET USER BY ID

const getUserById = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/AdminUser/users/${id}`,
        {
            method: "GET",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch user.");
    }

    return await response.json();
};

// UPDATE USER
export const updateUser = async (id, userData) => {
    const response = await fetch(
        `${API_BASE_URL}/AdminUser/users/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(userData)
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update user.");
    }

    return await response.json();
};

// DELETE USER
export const deleteUser = async (id) => {
    const response = await fetch(
        `${API_BASE_URL}/AdminUser/users/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete user.");
    }

    return await response.json();
};