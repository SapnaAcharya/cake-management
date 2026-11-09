import API_BASE_URL from "../config/apiConfig";

import {
    getGuestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart,
    updateGuestCartMessage
} from "./guestCartService";

// Authentication helpers
const getToken = () => {
    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token")
    );
};

const getAuthHeaders = () => {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

const isAuthenticated = () => !!getToken();

// Get cart
export const getCart = async () => {
    if (!isAuthenticated()) {
        return getGuestCart();
    }

    const response = await fetch(
        `${API_BASE_URL}/Cart`,
        {
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch cart.");
    }

    return await response.json();
};

// Add to cart
const addToCart = async (
    cakeId,
    quantity = 1,
    cake = null,
    customization = null,
    unitPrice = null,
    personalizedMessage = ""
) => {
    if (isAuthenticated()) {
        let endpoint;
        let requestBody;

        if (customization) {
            endpoint = `${API_BASE_URL}/Cart/add-customized`;

            requestBody = {
                cakeId,
                quantity,
               // cakeTemplateId: customization.templateId,
               cakeTemplateId: customization.templateId ?? customization.templateSlug,
                customization
            };
        } else {
            endpoint = `${API_BASE_URL}/Cart/add`;

            requestBody = {
                cakeId,
                quantity,
                personalizedMessage:
                    personalizedMessage?.trim() || null
            };
        }

        const response = await fetch(endpoint, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);

            throw new Error(
                errorBody?.message || "Failed to add cake to cart."
            );
        }

        return await response.json();
    }

    // Guest cart
    if (!cake) {
        throw new Error("Cake information is required for guest cart.");
    }

    const guestCake = {
        ...cake,
        id: cake.id ?? cakeId,
        price: unitPrice ?? cake.price
    };

    return addToGuestCart(
        guestCake,
        quantity,
        customization,
        personalizedMessage?.trim() || ""
    );
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated()) {
        return updateGuestCartItem(cartItemId, quantity);
    }

    const response = await fetch(
        `${API_BASE_URL}/Cart/items/${cartItemId}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(quantity)
        }
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        throw new Error(
            errorBody?.message || "Failed to update cart item."
        );
    }

    return await response.json();
};

// Remove cart item
export const removeCartItem = async (cartItemId) => {
    if (!isAuthenticated()) {
        return removeGuestCartItem(cartItemId);
    }

    const response = await fetch(
        `${API_BASE_URL}/Cart/items/${cartItemId}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to remove cart item.");
    }

    return await response.json();
};

// Clear cart
export const clearCart = async () => {
    if (!isAuthenticated()) {
        clearGuestCart();

        return {
            message: "Guest cart cleared successfully."
        };
    }

    const response = await fetch(
        `${API_BASE_URL}/Cart/clear`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        throw new Error("Failed to clear cart.");
    }

    return await response.json();
};

// Update personalized message
export const updatePersonalizedMessage = async (
    cartItemId,
    personalizedMessage
) => {
    if (!isAuthenticated()) {
        return updateGuestCartMessage(
            cartItemId,
            personalizedMessage
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/Cart/items/${cartItemId}/message`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                personalizedMessage
            })
        }
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        throw new Error(
            errorBody?.message ||
            "Failed to update personalized message."
        );
    }

    return await response.json();
};

// Default export
const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    updatePersonalizedMessage
};

export default cartService;
