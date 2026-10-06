import API_BASE_URL from "../config/apiConfig";

const GUEST_CART_KEY = "guestCart";

// AUTHENTICATION

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

    // Only send Authorization when a token exists
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};


const isAuthenticated = () => {
    return !!getToken();
};

// GUEST CART HELPERS

const getGuestCart = () => {
    const storedCart = localStorage.getItem(GUEST_CART_KEY);

    if (!storedCart) {
        return {
            cartId: "guest-cart",
            userId: null,
            items: [],
            totalAmount: 0
        };
    }

    try {
        return JSON.parse(storedCart);
    } catch (error) {
        console.error("Invalid guest cart:", error);

        return {
            cartId: "guest-cart",
            userId: null,
            items: [],
            totalAmount: 0
        };
    }
};


const saveGuestCart = (cart) => {
    localStorage.setItem(
        GUEST_CART_KEY,
        JSON.stringify(cart)
    );
};


const calculateGuestCartTotal = (cart) => {
    return cart.items.reduce(
        (total, item) => total + item.subtotal,
        0
    );
};

// GET CART

export const getCart = async () => {

    // LOGGED-IN CUSTOMER
    if (isAuthenticated()) {

        const response = await fetch(
            `${API_BASE_URL}/Cart`,
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch cart."
            );
        }

        return await response.json();
    }


    // GUEST
    return getGuestCart();
};

// ADD TO CART
const addToCart = async (
    cakeId,
    quantity = 1,
    cake = null,
    customization = null,
    unitPrice = null
) => {

    // LOGGED-IN CUSTOMER
    if (isAuthenticated()) {

        let endpoint;
        let requestBody;

        // Customized cake
        if (customization) {

            endpoint = `${API_BASE_URL}/Cart/add-customized`;

            requestBody = {
                cakeId,
                quantity,
                cakeTemplateId: customization.templateId,
                customization
            };
        }
        // Normal cake
        else {

            endpoint = `${API_BASE_URL}/Cart/add`;

            requestBody = {
                cakeId,
                quantity
            };
        }

        const response = await fetch(
            endpoint,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {

            const errorBody =
                await response.json()
                    .catch(() => null);

            throw new Error(
                errorBody?.message ||
                "Failed to add cake to cart."
            );
        }

        return await response.json();
    }

    // GUEST CART
    if (!cake) {
        throw new Error(
            "Cake information is required for guest cart."
        );
    }

    const cart = getGuestCart();

    const existingItem = customization
        ? null
        : cart.items.find(
            item =>
                item.cakeId === cakeId &&
                !item.customization
        );

    const price = Number(unitPrice ?? cake.price);

    if (existingItem) {

        existingItem.quantity += quantity;

        existingItem.subtotal =
            existingItem.price *
            existingItem.quantity;
    }
    else {

        cart.items.push({
            cartItemId: customization
                ? `custom-${Date.now()}`
                : cakeId,

            cakeId,
            cakeName: cake.name,
            imageUrl: cake.imageUrl,

            price,
            quantity,

            subtotal:
                price * quantity,

            customization
        });
    }

    cart.totalAmount =
        calculateGuestCartTotal(cart);

    saveGuestCart(cart);

    return cart;
};

// UPDATE CART ITEM
export const updateCartItem = async (
    cartItemId,
    quantity
) => {

    // LOGGED-IN CUSTOMER
    if (isAuthenticated()) {

        const response = await fetch(
            `${API_BASE_URL}/Cart/items/${cartItemId}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(quantity)
            }
        );

        if (!response.ok) {

            const errorBody =
                await response.json()
                    .catch(() => null);

            throw new Error(
                errorBody?.message ||
                "Failed to update cart item."
            );
        }

        return await response.json();
    }

    // GUEST

    const cart = getGuestCart();

    const item = cart.items.find(
        item => item.cartItemId === cartItemId
    );

    if (!item) {
        throw new Error(
            "Cart item not found."
        );
    }

    if (quantity < 1) {
        throw new Error(
            "Quantity must be at least 1."
        );
    }

    item.quantity = quantity;

    item.subtotal =
        item.price * item.quantity;

    cart.totalAmount =
        calculateGuestCartTotal(cart);

    saveGuestCart(cart);

    return cart;
};


// REMOVE CART ITEM

export const removeCartItem = async (
    cartItemId
) => {

    // LOGGED-IN CUSTOMER
    if (isAuthenticated()) {

        const response = await fetch(
            `${API_BASE_URL}/Cart/items/${cartItemId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to remove cart item."
            );
        }

        return await response.json();
    }

    // GUEST

    const cart = getGuestCart();

    cart.items = cart.items.filter(
        item => item.cartItemId !== cartItemId
    );

    cart.totalAmount =
        calculateGuestCartTotal(cart);

    saveGuestCart(cart);

    return {
        message: "Cart item removed successfully."
    };
};

// CLEAR CART
export const clearCart = async () => {

    // LOGGED-IN CUSTOMER
    if (isAuthenticated()) {

        const response = await fetch(
            `${API_BASE_URL}/Cart/clear`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to clear cart."
            );
        }

        return await response.json();
    }

    // GUEST

    localStorage.removeItem(
        GUEST_CART_KEY
    );

    return {
        message: "Guest cart cleared successfully."
    };
};

// EXPORT

const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};

export default cartService;