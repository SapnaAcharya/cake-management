import api from "./api";

const STORAGE_KEYS = ["token", "role", "user"];

// Remove the saved login from both places
const clearAuth = () => {
    STORAGE_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
};

// Read a saved value from either place
const readAuth = (key) =>
    localStorage.getItem(key) || sessionStorage.getItem(key);

const login = async (email, password, rememberMe = false) => {
    const response = await api.post("/Auth/login", {
        email,
        password,
    });

    const data = response.data;

    // Remove any old login first so the two places never disagree
    clearAuth();

    // Remember me ticked: stays after the browser closes.
    // Not ticked: ends when the tab or browser closes.
    const storage = rememberMe ? localStorage : sessionStorage;

    if (data.token) {
        storage.setItem("token", data.token);
    }

    // Support either response.user.role or response.role
    const role = data.user?.role || data.role;

    if (role) {
        storage.setItem("role", role);
    }

    // Save user information if available
    const user = data.user || {
        id: data.userId ?? data.id,
        name: data.name,
        email: data.email,
        role: role,
    };

    storage.setItem("user", JSON.stringify(user));

    return data;
};

const register = async (userData) => {
    const response = await api.post("/Auth/register", userData);

    return response.data;
};

const logout = () => {
    clearAuth();
};

const getToken = () => {
    return readAuth("token");
};

const getCurrentUser = () => {
    const user = readAuth("user");

    return user ? JSON.parse(user) : null;
};

const getRole = () => {
    return readAuth("role");
};

const isLoggedIn = () => {
    return Boolean(readAuth("token"));
};

const verifyEmail = async (email, otp) => {
    const response = await api.post("/Auth/verify-email", {
        email,
        otp,
    });

    return response.data;
};

const resendEmailOtp = async (email) => {
    const response = await api.post("/Auth/resend-email-otp", {
        email,
    });

    return response.data;
};

const googleLogin = async (idToken) => {
    const response = await api.post("/Auth/google", { idToken });
    return response.data;
};

const forgotPassword = async (email) => {
    const response = await api.post("/Auth/forgot-password", { email });

    return response.data;
};

const resetPassword = async (email, token, newPassword) => {
    const response = await api.post("/Auth/reset-password", {
        email,
        token,
        newPassword,
    });
    return response.data;
};

export default {
    login,
    googleLogin,
    register,
    verifyEmail,
    resendEmailOtp,
    logout,
    getToken,
    getCurrentUser,
    getRole,
    isLoggedIn,
    forgotPassword,
    resetPassword,
};