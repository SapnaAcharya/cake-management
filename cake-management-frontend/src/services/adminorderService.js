import API_BASE_URL from "../config/apiConfig";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`
    };
};

// Get all orders (admin)
export const getAllOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/AdminOrder`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }
    return await response.json();
};

// Get order by ID
export const getOrderById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/AdminOrder/${id}`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to fetch order details");
    }
    return await response.json();
};

// Update order status
export const updateOrderStatus = async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/AdminOrder/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    if (!response.ok) {
        throw new Error("Failed to update order status");
    }
    return await response.json();
};

const AdminOrderService = {
    getAllOrders,
    getOrderById,
    updateOrderStatus
};

