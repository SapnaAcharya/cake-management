import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createOrder } from "../services/orderservice";
import { getCart } from "../services/cartService";

import {
    getGuestCart,
    clearGuestCart
} from "../services/guestCartService";

import LocationPicker from "../components/LocationPicker";
import "../styles/Checkout.css";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

// A valid cake id is a positive whole number.
// Template-only designs (e.g. "template-5") have no real cake, so they use null.
const toCakeId = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
};

// Same identifier rule as CartPage, so both pages agree on item ids.
const getItemId = (item) =>
    item.cartItemId ?? item.lineId ?? item.cakeId;

// Turn the server's JSON error into a readable sentence.
const getErrorMessage = (err) => {
    try {
        const body = JSON.parse(err.message);

        if (body?.errors) {
            return Object.values(body.errors).flat().join(" ");
        }

        if (body?.message) return body.message;
        if (body?.title) return body.title;
    } catch {
        // Not JSON, so use the text as it is.
    }

    return err.message || "Unable to place your order. Please try again.";
};

const Checkout = () => {
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CashOnDelivery");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [coords, setCoords] = useState(null);

    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    const isGuest = !token;

    // Load cart for both guest and registered customers.
    useEffect(() => {
        const loadCart = async () => {
            try {
                setCartLoading(true);

                const cart = isGuest
                    ? getGuestCart()
                    : await getCart();

                setCartItems(cart?.items ?? []);
            } catch (err) {
                console.error("Failed to load checkout cart:", err);
                setError("Unable to load your cart. Please try again.");
            } finally {
                setCartLoading(false);
            }
        };

        loadCart();
    }, [isGuest]);

    // Clean customized cake decorations.
    const cleanDecorations = (decorations) =>
        (decorations ?? [])
            .filter((d) =>
                Number.isInteger(Number(d.decorationId))
            )
            .map((d) => ({
                ...d,
                decorationId: Number(d.decorationId),
                quantity: d.quantity ?? 1
            }));

    // Receive selected location from LocationPicker.
    const handleLocationSelect = ({ address, lat, lng }) => {
        setShippingAddress(address);
        setCoords({ lat, lng });
        setError("");
    };

    // Build the items array sent with a guest order.
    // Personalized messages were already saved on the cart page,
    // so they are only read here, never edited.
    const buildGuestOrderItems = () =>
        cartItems.map((item) => {
            // Normal cake.
            if (!item.isCustomized) {
                const cakeId = toCakeId(item.cakeId ?? item.id);

                if (cakeId === null) {
                    throw new Error(
                        `${item.cakeName} has an invalid cake id. Please remove it and add it again.`
                    );
                }

                return {
                    cakeId,
                    quantity: Number(item.quantity),
                    customization: null,
                    personalizedMessage: item.allowMessage
                        ? item.personalizedMessage?.trim() || null
                        : null
                };
            }

            // Customized cake.
            const dto = item.customizationDto ?? item.customization;

            if (!dto) {
                throw new Error(
                    `Customized cake ${item.cakeName} is missing its design details. Please remove it and customize it again.`
                );
            }

            // Real cake id when there is one, otherwise null (template-only design).
            const cakeId = toCakeId(
                dto.cakeId ?? dto.cakeSlug ?? item.cakeId
            );

            const rawColorId = dto.colorId;

            const parsedColorId =
                rawColorId === "" ||
                rawColorId === undefined ||
                rawColorId === null
                    ? null
                    : parseInt(rawColorId, 10);

            const customization = {
                ...dto,
                cakeId,
                colorId: parsedColorId,
                decorations: cleanDecorations(dto.decorations)
            };

            return {
                cakeId,
                quantity: Number(item.quantity),
                customization,
                personalizedMessage: null
            };
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (cartLoading) {
            setError("Please wait while your cart loads.");
            return;
        }

        if (cartItems.length === 0) {
            setError("Your cart is empty. Please add a cake before checkout.");
            return;
        }

        if (!shippingAddress.trim()) {
            setError("Please enter a shipping address.");
            return;
        }

        if (!coords) {
            setError("Please select your delivery location on the map.");
            return;
        }

        let cleanedPhone = "";

        if (isGuest) {
            cleanedPhone = phoneNumber.replace(/\s+/g, "");

            if (!cleanedPhone) {
                setError("Please enter your phone number.");
                return;
            }

            if (!/^9[678]\d{8}$/.test(cleanedPhone)) {
                setError(
                    "Please enter a valid 10-digit Nepal mobile number."
                );
                return;
            }
        }

        // Validate the saved messages before placing the order.
        for (const item of cartItems) {
            if (item.isCustomized && item.personalizedMessage?.trim()) {
                setError(
                    "Personalized messages are not available for customized cakes."
                );
                return;
            }

            if (
                !item.isCustomized &&
                item.personalizedMessage?.trim() &&
                !item.allowMessage
            ) {
                setError(
                    `Personalized messages are not available for ${item.cakeName}.`
                );
                return;
            }

            if (
                item.allowMessage &&
                item.personalizedMessage?.trim() &&
                item.personalizedMessage.trim().length >
                    (item.maxMessageLength ?? 100)
            ) {
                setError(
                    `Message for ${item.cakeName} cannot exceed ${item.maxMessageLength ?? 100} characters.`
                );
                return;
            }
        }

        try {
            setLoading(true);

            // Registered customers: messages are already saved in the database cart.
            // Guest customers: messages are sent directly with the order.
            const orderData = {
                shippingAddress: shippingAddress.trim(),
                paymentMethod,
                latitude: coords.lat,
                longitude: coords.lng
            };

            if (isGuest) {
                orderData.phoneNumber = cleanedPhone;
                orderData.items = buildGuestOrderItems();
            }

            // Debug output in development only (it contains personal details).
            if (import.meta.env.DEV) {
                console.log(
                    "ORDER DATA:",
                    JSON.stringify(orderData, null, 2)
                );
            }

            const order = await createOrder(orderData);

            if (isGuest) {
                clearGuestCart();
            }

            // Use the public GUID in the URL, never the numeric order id.
            navigate(`/orders/${order.publicId}`, {
                state: {
                    justPlaced: true,
                    ...(isGuest && {
                        phoneNumber: cleanedPhone
                    })
                }
            });
        } catch (err) {
            console.error("Error placing order:", err);

            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Estimate only. The server calculates the final total.
    const estimatedTotal = cartItems.reduce(
        (total, item) => total + Number(item.subtotal ?? 0),
        0
    );

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p>
                        Confirm your delivery details to place your order.
                    </p>
                </div>

                {error && (
                    <div className="checkout-error-message">
                        {error}
                    </div>
                )}

                {cartLoading ? (
                    <p>Loading your cart...</p>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="checkout-form"
                    >

                        {/* ORDER ITEMS (PERSONALIZED MESSAGES ARE READ-ONLY) */}
                        <div className="checkout-field">
                            <h3>Your Order</h3>

                            {cartItems.map((item, index) => {
                                const itemId = getItemId(item);
                                const message =
                                    item.personalizedMessage?.trim() || "";
                                const messageCharge = Number(
                                    item.messageAdditionalPrice ?? 0
                                );
                                const canHaveMessage =
                                    !item.isCustomized && item.allowMessage;

                                return (
                                    <div
                                        key={`${itemId}-${index}`}
                                        className="checkout-order-item"
                                    >
                                        <div className="checkout-item-main">
                                            <div className="checkout-item-info">
                                                <strong>{item.cakeName}</strong>

                                                <span className="checkout-item-qty">
                                                    Qty: {item.quantity}
                                                    {item.isCustomized &&
                                                        " • Customized cake"}
                                                </span>
                                            </div>

                                            <div className="checkout-item-price">
                                                <span>
                                                    NPR{" "}
                                                    {Number(
                                                        item.price ?? 0
                                                    ).toFixed(2)}{" "}
                                                    each
                                                </span>

                                                <strong>
                                                    NPR{" "}
                                                    {Number(
                                                        item.subtotal ?? 0
                                                    ).toFixed(2)}
                                                </strong>
                                            </div>
                                        </div>

                                        {canHaveMessage && message && (
                                            <div className="checkout-message-box">
                                                <span className="checkout-message-label">
                                                    {item.messageLabel ||
                                                        "Personalized Message"}
                                                </span>

                                                <p className="checkout-message-text">
                                                    “{message}”
                                                </p>

                                                {messageCharge > 0 && (
                                                    <small>
                                                        Includes message charge:
                                                        NPR{" "}
                                                        {messageCharge.toFixed(2)}
                                                    </small>
                                                )}
                                            </div>
                                        )}

                                        {canHaveMessage && (
                                            <button
                                                type="button"
                                                className="checkout-edit-link"
                                                onClick={() => navigate("/cart")}
                                                disabled={loading}
                                            >
                                                {message
                                                    ? "Edit message in cart"
                                                    : "Add a message in cart"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="checkout-total">
                                <span>Estimated total</span>
                                <strong>
                                    NPR {estimatedTotal.toFixed(2)}
                                </strong>
                            </div>
                        </div>

                        {/* GUEST CONTACT NUMBER */}
                        {isGuest && (
                            <div className="checkout-field">
                                <label htmlFor="phoneNumber">
                                    Contact Number
                                </label>

                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        setPhoneNumber(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="Enter your 10-digit mobile number"
                                    required
                                />

                                <small>
                                    Please provide a valid mobile number so
                                    we can contact you regarding your order
                                    and delivery.
                                </small>
                            </div>
                        )}

                        {/* LOCATION PICKER - GUEST AND REGISTERED CUSTOMERS */}
                        <div className="checkout-field">
                            <LocationPicker
                                onSelect={handleLocationSelect}
                            />
                        </div>

                        {/* SHIPPING ADDRESS */}
                        <div className="checkout-field">
                            <label htmlFor="shippingAddress">
                                Shipping Address
                            </label>

                            <input
                                type="text"
                                id="shippingAddress"
                                value={shippingAddress}
                                onChange={(e) => {
                                    setShippingAddress(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter your full delivery address"
                                autoComplete="street-address"
                                required
                            />
                        </div>

                        {/* PAYMENT METHOD */}
                        <div className="checkout-field">
                            <label htmlFor="paymentMethod">
                                Payment Method
                            </label>

                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            >
                                <option value="CashOnDelivery">
                                    Cash on Delivery
                                </option>
                            </select>
                        </div>

                        {/* SELECTED COORDINATES */}
                        {coords && (
                            <div className="checkout-field">
                                <small>
                                    Delivery coordinates:{" "}
                                    {coords.lat.toFixed(6)},{" "}
                                    {coords.lng.toFixed(6)}
                                </small>
                            </div>
                        )}

                        {/* CHECKOUT ACTIONS */}
                        <div className="checkout-actions">
                            <button
                                type="button"
                                className="checkout-back-btn"
                                onClick={() => navigate("/cart")}
                                disabled={loading}
                            >
                                Back to Cart
                            </button>

                            <button
                                type="submit"
                                className="checkout-submit-btn"
                                disabled={loading || cartLoading}
                            >
                                {loading
                                    ? "Placing Order..."
                                    : "Place Order"}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};

export default Checkout;
