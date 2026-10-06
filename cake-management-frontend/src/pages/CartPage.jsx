import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../services/cartService";
import {
    getGuestCart,
    updateGuestCartItem,
    removeGuestCartItem,
    clearGuestCart
} from "../services/guestCartService";
import { ShoppingCart } from "lucide-react";
import "../styles/CartPage.css";

// Helper: get the auth token, if any
const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const buildGuestCart = (guestItems) => {
    const itemsWithSubtotal = guestItems.map((item) => ({
        ...item,
        cartItemId: item.lineId,
        subtotal: item.price * item.quantity
    }));

    return {
        cartId: null,
        userId: null,
        items: itemsWithSubtotal,
        totalAmount: itemsWithSubtotal.reduce(
            (total, item) => total + item.subtotal,
            0
        )
    };
};

const CartPage = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    // LOAD CART
    const loadCart = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            // Guest cart
            if (!token) {
                const guestItems = getGuestCart();
                setCart(buildGuestCart(guestItems));
                return;
            }

            // logged-in-customer cart
            const data = await getCart();
            console.log("Cart Data:", data);
            console.log("Cart Items:", data.items);
            setCart(data);
        } catch (error) {
            console.error("Error loading cart:", error);

            setError(
                error.message ||
                "Unable to load your cart."
            );
        } finally {
            setLoading(false);
        }
    };

    // LOAD CART WHEN PAGE OPENS
    useEffect(() => {
         // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadCart();
    }, []);
   
    const handleIncrease = async (item) => {
    const actionKey = item.cartItemId ?? item.lineId ?? item.cakeId;

    try {
        setActionLoading(actionKey);
        setError("");

        const token = getToken();

        // Guest: update the exact line by its lineId
        if (!token) {
            const updatedItems = updateGuestCartItem(
                item.lineId,
                item.quantity + 1
            );

            setCart(buildGuestCart(updatedItems));
            return;
        }

        // Logged-in customer: update by the server's cartItemId
        const updatedCart = await updateCartItem(
            item.cartItemId,
            item.quantity + 1
        );

        setCart(updatedCart);
    } catch (error) {
        console.error("Error increasing quantity:", error);

        setError(error.message || "Unable to update quantity.");
    } finally {
        setActionLoading(null);
    }
};

    const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
        return;
    }

    const actionKey = item.cartItemId ?? item.lineId ?? item.cakeId;

    try {
        setActionLoading(actionKey);
        setError("");

        const token = getToken();

        // Guest: update the exact line by its lineId
        if (!token) {
            const updatedItems = updateGuestCartItem(
                item.lineId,
                item.quantity - 1
            );

            setCart(buildGuestCart(updatedItems));
            return;
        }

        // Logged-in customer: update by the server's cartItemId
        const updatedCart = await updateCartItem(
            item.cartItemId,
            item.quantity - 1
        );

        setCart(updatedCart);
    } catch (error) {
        console.error("Error decreasing quantity:", error);

        setError(error.message || "Unable to update quantity.");
    } finally {
        setActionLoading(null);
    }
};

    // REMOVE CART ITEM
    const handleRemove = async (item) => {
    const actionKey = item.cartItemId ?? item.lineId ?? item.cakeId;

    try {
        setActionLoading(actionKey);
        setError("");

        const token = getToken();

        // Guest: remove the exact line by its lineId
        if (!token) {
            removeGuestCartItem(item.lineId);
            await loadCart();
            return;
        }

        // Logged-in customer: remove by the server's cartItemId.
        // The backend returns only a message, so reload the cart after.
        await removeCartItem(item.cartItemId);
        await loadCart();
    } catch (error) {
        console.error("Error removing cart item:", error);

        setError(error.message || "Unable to remove cart item.");
        setActionLoading(null);
    }
};

    // CLEAR CART
    const handleClearCart = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading("clear");
            setError("");

            const token = getToken();

            // Guest
            if (!token) {
                clearGuestCart();
                await loadCart();
                return;
            }

            // logged-in-customer
            await clearCart();
            await loadCart();

        } catch (error) {
            console.error("Error clearing cart:", error);

            setError(
                error.message ||
                "Unable to clear cart."
            );

            setActionLoading(null);
        }
    };

    // LOADING STATE
    if (loading) {
        return (
            <div className="cart-page">
                <div className="cart-loading">
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error && !cart) {
        return (
            <div className="cart-page">
                <div className="cart-error">
                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button onClick={loadCart}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // EMPTY CART
    if (!cart || cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-container">

                    <div className="cart-header">
                        <h1>My Cart</h1>
                    </div>

                    {error && (
                        <div className="cart-error-message">
                            {error}
                        </div>
                    )}

                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                             <ShoppingCart size={64} strokeWidth={1.5} />
                        </div>

                        <h2>Your cart is empty</h2>

                        <p>
                            Looks like you haven't added any cakes
                            to your cart yet.
                        </p>

                        <button
                            className="continue-shopping-btn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // MAIN CART PAGE
    return (
        <div className="cart-page">

            <div className="cart-container">

                <div className="cart-header">

                    <div>
                        <h1>My Cart</h1>

                        <p>
                            {cart.items.length}{" "}
                            {cart.items.length === 1
                                ? "item"
                                : "items"}{" "}
                            in your cart
                        </p>
                    </div>

                    <button
                        className="clear-cart-btn"
                        onClick={handleClearCart}
                        disabled={actionLoading === "clear"}
                    >
                        {actionLoading === "clear"
                            ? "Clearing..."
                            : "Clear Cart"}
                    </button>

                </div>


                    {/* ERROR MESSAGE */}
               
                {error && (
                    <div className="cart-error-message">
                        {error}
                    </div>
                )}


                {/* CART CONTENT */}
                <div className="cart-content">

                    {/* CART ITEMS */}
                    <div className="cart-items">

                        {cart.items.map((item, index) => {

                            // const itemKey = item.cartItemId ?? item.id ?? `${item.cakeId}-${index}`;
                            const itemKey = `${item.cartItemId}-${index}`;
                            const isUpdating = actionLoading === itemKey;

                            return (
                                <div
                                    className="cart-item"
                                    key={itemKey}
                                >

                                    {/* CAKE INFORMATION */}
                                    <div className="cart-item-info">

                                        <h2>
                                            {item.cakeName}
                                        </h2>

                                        <p className="cart-item-price">
                                            Rs.{" "}
                                            {item.price.toFixed(2)}
                                        </p>

                                    </div>


                                    {/* QUANTITY CONTROLS */}
                                    <div className="quantity-section">

                                        <span className="quantity-label">
                                            Quantity
                                        </span>

                                        <div className="quantity-controls">

                                            <button
                                                onClick={() =>
                                                    handleDecrease(item)
                                                }
                                                disabled={
                                                    item.quantity <= 1 ||
                                                    isUpdating
                                                }
                                            >
                                                −
                                            </button>

                                            <span>
                                                {isUpdating
                                                    ? "..."
                                                    : item.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    handleIncrease(item)
                                                }
                                                disabled={isUpdating}
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>


                                    {/* SUBTOTAL */}
                                    <div className="cart-item-subtotal">

                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            Rs.{" "}
                                            {item.subtotal.toFixed(2)}
                                        </strong>

                                    </div>


                                    {/*REMOVE BUTTON */}
                                    <button
                                        className="remove-item-btn"
                                        onClick={() =>
                                            handleRemove(item)
                                        }
                                        disabled={isUpdating}
                                    >
                                        {isUpdating
                                            ? "Removing..."
                                            : "Remove"}
                                    </button>

                                </div>
                            );
                        })}

                    </div>


                    {/* CART SUMMARY */}
                    <div className="cart-summary">

                        <h2>
                            Order Summary
                        </h2>

                        <div className="summary-row">

                            <span>
                                Items
                            </span>

                            <span>
                                {cart.items.length}
                            </span>

                        </div>


                        <div className="summary-row">

                            <span>
                                Total
                            </span>

                            <strong>
                                Rs.{" "}
                                {cart.totalAmount.toFixed(2)}
                            </strong>

                        </div>


                        <div className="summary-divider" />


                        <div className="summary-total">

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                Rs.{" "}
                                {cart.totalAmount.toFixed(2)}
                            </strong>

                        </div>


                        {/*CHECKOUT */}
                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout
                        </button>


                        {/* CONTINUE SHOPPING */}
                        <button
                            className="continue-shopping-btn"
                            onClick={() => navigate("/")}
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default CartPage;
