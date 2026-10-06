import api from "./api";

const login = async (email, password) => {
    const response = await api.post("/Auth/login", {
        email,
        password,
    });

    const data = response.data;

    // Save token
    if (data.token) {
        localStorage.setItem("token", data.token);
    }

    // Support either response.user.role or response.role
    const role = data.user?.role || data.role;

    if (role) {
        localStorage.setItem("role", role);
    }

    // Save user information if available
    const user = data.user || {
        id: data.id,
        name: data.name,
        email: data.email,
        role: role,
    };

    localStorage.setItem("user", JSON.stringify(user));

    return data;
};

const register = async (userData) => {
    const response = await api.post("/Auth/register", userData);

    return response.data;
};

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
};

const getRole = () => {
    return localStorage.getItem("role");
};

const isLoggedIn = () => {
    return Boolean(localStorage.getItem("token"));
};

export default {
    login,
    register,
    logout,
    getCurrentUser,
    getRole,
    isLoggedIn,
};