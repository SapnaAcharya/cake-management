import API_BASE_URL from "../config/apiConfig";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
};

// Get all categories
export const getCategories = async () => {
    const response = await fetch(`${API_BASE_URL}/Categories`);

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    return await response.json();
};

// Get category by ID
const getCategoryById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/Categories/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch category");
    }

    return await response.json();
};

// Create category
export const createCategory = async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/Categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
        throw new Error("Failed to create category");
    }

    return await response.text();
};

// Update category(admin only)
export const updateCategory = async (id, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/Categories/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
    });

    if (!response.ok) {
        throw new Error("Failed to update category");
    }

    return await response.text();
};

// Delete category
export const deleteCategory = async (id) => {
    const response = await fetch(`${API_BASE_URL}/Categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to delete category");
    }

    return await response.text();
};

const categoryService = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};

export default categoryService;