const GUEST_CART_KEY = "guestCart";

// Get guest cart
export const getGuestCart = () => {
    try {
        const cart = localStorage.getItem(GUEST_CART_KEY);

        if (!cart){
            return [];
        }

        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error("Failed to read guest cart:", error);
        return [];
    }
};

// Save guest cart
const saveGuestCart = (cart) => {
    localStorage.setItem(
        GUEST_CART_KEY,
        JSON.stringify(cart)
    );
};

// Add to cart
export const addToGuestCart = (
    cake,
    quantity = 1,
    customization = null,
    customizationDto = null
) => {
    const cart = getGuestCart();
    const item = {
        cakeId: cake.id,
        cakeName: cake.name,
        imageUrl: cake.imageUrl,
        quantity,
        isCustomized: !!customization,
        price: customization?.customUnitPrice ?? cake.price,
        customUnitPrice: customization?.customUnitPrice ?? null,
        cakeTemplateId: customization?.cakeTemplateId ?? null,
        customizationJson: customization?.customizationJson ?? null,
        customizationDto: customizationDto
    };
    cart.push(item);
    saveGuestCart(cart);
    return cart;
}

// Update guest cart item
export const updateGuestCartItem = (
    cakeId,
    quantity
) => {
    const cart = getGuestCart();

    const item = cart.find(
        item => item.cakeId === cakeId
    );

    if (item) {
        item.quantity = quantity;
    }

    saveGuestCart(cart);

    return cart;
};

// Remove guest cart item
export const removeGuestCartItem = (cakeId) => {
    const cart = getGuestCart();

    const updatedCart = cart.filter(
        item => item.cakeId !== cakeId
    );

    saveGuestCart(updatedCart);

    return updatedCart;
};

// Clear guest cart
export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};

// Get number of items
export const getGuestCartCount = () => {
    const cart = getGuestCart();

    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
};

// export 
const guestCartService = {
    getGuestCart ,
    saveGuestCart,
    addToGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart,
    getGuestCartCount
};


