// import API_BASE_URL from "../config/apiConfig";

// const getToken = () => 
//     localStorage.getItem("token") || sessionStorage.getItem("token");

// const getAuthHeaders = () => {
//    {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`
//     };
// };

// // GET: api/User/profile
// const getMyProfile = async () => {
//     const response = await fetch(`${API_BASE_URL}/User/profile`, {
//         method: "GET",
//         headers: getAuthHeaders()
//     });

//     if (!response.ok) {
//         throw new Error("Failed to fetch profile.");
//     }

//     return await response.json();
// };

// // PUT: api/User/profile
// const updateMyProfile = async (profileData) => {
//     const response = await fetch(`${API_BASE_URL}/User/profile`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify(profileData)
//     });

//     if (!response.ok) {
//         throw new Error("Failed to update profile.");
//     }

//     return await response.json();
// };

// const changePassword = async ({ currentPassword, newPassword}) => {
//     const response = await fetch(`${API_BASE_URL}/User/change-password`, {
//         method: "PUT",
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ currentPassword, newPassword})
//     });
//     return response.data;
// }

// // GET: api/User/orders
// const getMyOrders = async () => {
//     const response = await fetch(`${API_BASE_URL}/User/orders`, {
//         method: "GET",
//         headers: getAuthHeaders()
//     });

//     if (!response.ok) {
//         throw new Error("Failed to fetch order history.");
//     }

//     return await response.json();
// };

// const profileService = {
//     getMyProfile,
//     updateMyProfile,
//     changePassword,
//     getMyOrders
// };

// export default profileService;

import API_BASE_URL from "../config/apiConfig";

const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

// For JSON requests
const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
});

// For file uploads: no Content-Type here, the browser must set it
// itself so it can add the multipart boundary
const getAuthOnlyHeaders = () => ({
    Authorization: `Bearer ${getToken()}`
});

// Your API returns plain-text errors like BadRequest("Only JPG...").
// This reads that text so the user sees the real message.
const readError = async (response, fallback) => {
    try {
        const text = await response.text();
        if (!text) return fallback;

        try {
            const data = JSON.parse(text);
            return data.message || data.title || fallback;
        } catch {
            return text;
        }
    } catch {
        return fallback;
    }
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

// POST: api/User/profile/photo
const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append("file", file); // must match "IFormFile file" in the controller

    const response = await fetch(`${API_BASE_URL}/User/profile/photo`, {
        method: "POST",
        headers: getAuthOnlyHeaders(),
        body: formData
    });

    if (!response.ok) {
        throw new Error(await readError(response, "Failed to upload photo."));
    }

    const data =  await response.json(); // { profileImageUrl }

    window.dispatchEvent(
        new CustomEvent("profile-photo-changed", {detail: data.profileImageUrl })
    );

    return data;
};

// DELETE: api/User/profile/photo
const removePhoto = async () => {
    const response = await fetch(`${API_BASE_URL}/User/profile/photo`, {
        method: "DELETE",
        headers: getAuthOnlyHeaders()
    });

    if (!response.ok) {
        throw new Error(await readError(response, "Failed to remove photo."));
    }

    window.dispatchEvent(
        new CustomEvent("profile-photo-changed", { detail: null })
    );

    return await response.json();
};

// PUT: api/User/change-password
const changePassword = async ({ currentPassword, newPassword }) => {
    const response = await fetch(`${API_BASE_URL}/User/change-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
        throw new Error(await readError(response, "Failed to change password."));
    }

    return await response.json();
};

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
    uploadPhoto,
    removePhoto,
    changePassword,
    getMyOrders
};

export default profileService;