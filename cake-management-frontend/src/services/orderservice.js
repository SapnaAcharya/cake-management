import API_BASE_URL from "../config/apiConfig";

const getToken = () => {
    return localStorage.getItem("token") || 
    sessionStorage.getItem("token");
};

const getAuthHeaders = () => {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    // Only add authorization when a token exists
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

// Create an order from the current cart
export const createOrder = async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/Order`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {

    const errorBody = await response.json().catch(() => null);

    console.log("ORDER ERROR:", errorBody);

    throw new Error(
        JSON.stringify(errorBody)
    );
}

    return await response.json();
};

// Get all orders for the logged-in customer
export const getMyOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/Order`, {
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error("Failed to load your orders.");
    }

    return await response.json();
};

// Get one order — for a logged-in customer or a guest (with phone number)
export const getOrderById = async (orderId, guestPhoneNumber = null) => {
    const token = getToken();

    let url = `${API_BASE_URL}/Order/${orderId}`;
    let headers = getAuthHeaders();

    // Guest lookup: no token, so authorize via phone number instead
    if (!token && guestPhoneNumber) {
        url = `${API_BASE_URL}/Order/guest/${orderId}?phoneNumber=${encodeURIComponent(guestPhoneNumber)}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error("You're not authorized to view this order.");
        }
        throw new Error("Failed to load order details.");
    }

    return await response.json();
};

const orderService = {
    createOrder,
    getMyOrders,
    getOrderById
};

