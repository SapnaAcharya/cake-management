
const GUEST_CART_KEY = "guestCart";

// Get guest cart
export const getGuestCart = () => {
    try {
        const storedCart = localStorage.getItem(GUEST_CART_KEY);

        if (!storedCart) {
            return {
                cartId: "guest-cart",
                userId: null,
                items: [],
                totalAmount: 0
            };
        }

        const parsedCart = JSON.parse(storedCart);

        // Convert the old array-based format
        if (Array.isArray(parsedCart)) {
            const cart = {
                cartId: "guest-cart",
                userId: null,
                items: parsedCart.map((item, index) => ({
                    cartItemId: item.cartItemId ?? `guest-${index}`,
                    cakeId: item.cakeId ?? item.id,
                    cakeName: item.cakeName ?? item.name,
                    imageUrl: item.imageUrl,
                    basePrice: Number(item.basePrice ?? item.price ?? 0),
                    price: Number(item.price ?? 0),
                    quantity: Number(item.quantity ?? 1),
                    subtotal: Number(item.subtotal ?? (
                        Number(item.price ?? 0) *
                        Number(item.quantity ?? 1)
                    )),
                    isCustomized: !!(
                        item.isCustomized ??
                        item.customization ??
                        item.customizationDto
                    ),
                    customization: item.customization ?? item.customizationDto ?? null,
                    customizationDto: item.customizationDto ?? item.customization ?? null,
                    personalizedMessage: item.personalizedMessage ?? "",
                    allowMessage: !!item.allowMessage,
                    messageLabel: item.messageLabel ?? "Personalized Message",
                    messagePlaceholder: item.messagePlaceholder ?? "Enter your message",
                    maxMessageLength: Number(item.maxMessageLength ?? 100),
                    messageAdditionalPrice: Number(item.messageAdditionalPrice ?? 0)
                })),
                totalAmount: 0
            };

            cart.totalAmount = calculateGuestCartTotal(cart);
            saveGuestCart(cart);

            return cart;
        }

        const cart = {
            cartId: parsedCart.cartId ?? "guest-cart",
            userId: null,
            items: parsedCart.items ?? [],
            totalAmount: Number(parsedCart.totalAmount ?? 0)
        };

        return cart;
    } catch (error) {
        console.error("Failed to read guest cart:", error);

        return {
            cartId: "guest-cart",
            userId: null,
            items: [],
            totalAmount: 0
        };
    }
};

// Save guest cart
export const saveGuestCart = (cart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

// Calculate guest cart total
export const calculateGuestCartTotal = (cart) => {
    return (cart.items ?? []).reduce(
        (total, item) => total + Number(item.subtotal ?? 0),
        0
    );
};

// Add cake to guest cart
export const addToGuestCart = (
    cake,
    quantity = 1,
    customization = null,
    customizationDto = null,
    personalizedMessage = ""
) => {
    const cart = getGuestCart();
    const isCustomized = !!customization;

    const cakeId = cake.id ?? cake.cakeId;

    // Customized cakes never support personalized messages.
    const allowMessage =
        !isCustomized && cake.allowMessage === true;

    const message = allowMessage
        ? (personalizedMessage?.trim() ?? "")
        : "";

    const maxMessageLength = Number(
        cake.maxMessageLength ?? 100
    );

    if (message.length > maxMessageLength) {
        throw new Error(
            `Message cannot exceed ${maxMessageLength} characters.`
        );
    }

    const messageAdditionalPrice = Number(
        cake.messageAdditionalPrice ?? 0
    );

    const basePrice = Number(
        customization?.customUnitPrice ?? cake.price ?? 0
    );

    // The additional charge applies only when a message exists.
    const unitPrice = basePrice +
        (message ? messageAdditionalPrice : 0);

    // Merge only items with the same cake and same message.
    // Different messages should remain separate cart items.
    const existingItem = isCustomized
        ? null
        : cart.items.find(
            item =>
                Number(item.cakeId) === Number(cakeId) &&
                !item.isCustomized &&
                (item.personalizedMessage ?? "").trim() === message
        );

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = unitPrice;
        existingItem.subtotal =
            unitPrice * existingItem.quantity;
    } else {
        cart.items.push({
            cartItemId: isCustomized
                ? `custom-${Date.now()}`
                : `guest-${Date.now()}-${Math.random()}`,

            cakeId,
            cakeName: cake.name,
            imageUrl: cake.imageUrl,

            basePrice,
            price: unitPrice,
            quantity,
            subtotal: unitPrice * quantity,

            isCustomized,
            customization,
            customizationDto: customizationDto ?? customization,

            personalizedMessage: message,

            allowMessage,

            messageLabel: cake.messageLabel ??
                "Personalized Message",

            messagePlaceholder: cake.messagePlaceholder ??
                "Enter your message",

            maxMessageLength,

            messageAdditionalPrice
        });
    }

    cart.totalAmount = calculateGuestCartTotal(cart);

    saveGuestCart(cart);

    return cart;
};

// Update guest cart quantity
export const updateGuestCartItem = (cartItemId, quantity) => {
    const cart = getGuestCart();

    const item = cart.items.find(
        item => String(item.cartItemId) === String(cartItemId)
    );

    if (!item) {
        throw new Error("Cart item not found.");
    }

    if (quantity < 1) {
        throw new Error("Quantity must be at least 1.");
    }

    item.quantity = quantity;
    item.subtotal = item.price * item.quantity;

    cart.totalAmount = calculateGuestCartTotal(cart);
    saveGuestCart(cart);

    return cart;
};

// Update personalized message
export const updateGuestCartMessage = (
    cartItemId,
    personalizedMessage
) => {
    const cart = getGuestCart();

    const item = cart.items.find(
        item => String(item.cartItemId) === String(cartItemId)
    );

    if (!item) {
        throw new Error("Cart item not found.");
    }

    if (item.isCustomized) {
        throw new Error(
            "Personalized messages are not available for customized cakes."
        );
    }

    const message = personalizedMessage?.trim() ?? "";

    if (message && !item.allowMessage) {
        throw new Error(
            "Personalized messages are not available for this cake."
        );
    }

    if (message.length > item.maxMessageLength) {
        throw new Error(
            `Message cannot exceed ${item.maxMessageLength} characters.`
        );
    }

    if (message && item.messageAdditionalPrice < 0) {
        throw new Error("Invalid personalized message price.");
    }

    item.personalizedMessage = message;

    // Recalculate price using the cake's base price
    item.price = item.basePrice +
        (message ? item.messageAdditionalPrice : 0);

    item.subtotal = item.price * item.quantity;

    cart.totalAmount = calculateGuestCartTotal(cart);
    saveGuestCart(cart);

    return cart;
};

// Remove guest cart item
export const removeGuestCartItem = (cartItemId) => {
    const cart = getGuestCart();

    cart.items = cart.items.filter(
        item => String(item.cartItemId) !== String(cartItemId)
    );

    cart.totalAmount = calculateGuestCartTotal(cart);
    saveGuestCart(cart);

    return cart;
};

// Clear guest cart
export const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
};

// Get guest cart item count
export const getGuestCartCount = () => {
    const cart = getGuestCart();

    return cart.items.reduce(
        (total, item) => total + Number(item.quantity ?? 0),
        0
    );
};

// Default export
const guestCartService = {
    getGuestCart,
    saveGuestCart,
    addToGuestCart,
    updateGuestCartItem,
    updateGuestCartMessage,
    removeGuestCartItem,
    clearGuestCart,
    getGuestCartCount,
    calculateGuestCartTotal
};

export default guestCartService;
