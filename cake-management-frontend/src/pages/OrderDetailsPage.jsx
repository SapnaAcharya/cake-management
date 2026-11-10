import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import {
    getOrderByPublicId,
    getGuestOrderByPublicId
} from "../services/orderservice";
import "../styles/OrderDetails.css";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const statusClass = (status) => {
    switch (status) {
        case "Pending": return "order-status pending";
        case "Confirmed": return "order-status confirmed";
        case "Processing":
        case "Preparing": return "order-status preparing";
        case "Shipped": return "order-status shipped";
        case "Delivered": return "order-status delivered";
        case "Cancelled": return "order-status cancelled";
        default: return "order-status";
    }
};

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
};

const formatMoney = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

// Short, readable reference for display. The full GUID stays in the URL.
const getReference = (publicId) =>
    publicId ? `CK-${String(publicId).slice(0, 8).toUpperCase()}` : "—";

const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const OrderDetails = () => {
    const navigate = useNavigate();
    const { publicId } = useParams();
    const location = useLocation();

    const justPlaced = location.state?.justPlaced || false;
    const passedPhoneNumber = location.state?.phoneNumber || null;

    const isLoggedIn = Boolean(getToken());

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [guestPhoneInput, setGuestPhoneInput] = useState("");
    const [needsGuestPhone, setNeedsGuestPhone] = useState(false);

    // LOAD ORDER
    const loadOrder = useCallback(
        async (phoneOverride) => {
            try {
                setLoading(true);
                setError("");
                setNeedsGuestPhone(false);

                if (!publicId) {
                    setError("Invalid order reference.");
                    return;
                }

                let data;

                if (isLoggedIn) {
                    data = await getOrderByPublicId(publicId);
                } else {
                    const phoneToUse = phoneOverride || passedPhoneNumber;

                    if (!phoneToUse) {
                        // Guests must verify with their phone number first.
                        setNeedsGuestPhone(true);
                        return;
                    }

                    data = await getGuestOrderByPublicId(
                        publicId,
                        phoneToUse
                    );
                }

                setOrder(data);
            } catch (err) {
                console.error("Error loading order:", err);
                setError(err.message || "Unable to load this order.");
            } finally {
                setLoading(false);
            }
        },
        [publicId, isLoggedIn, passedPhoneNumber]
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadOrder();
    }, [loadOrder]);

    const handleGuestPhoneSubmit = (e) => {
        e.preventDefault();

        const cleaned = guestPhoneInput.replace(/\s+/g, "");

        if (cleaned) {
            loadOrder(cleaned);
        }
    };

    // LOADING STATE
    if (loading) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-loading">
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    // GUEST NEEDS PHONE NUMBER TO VERIFY
    if (needsGuestPhone) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-error">
                    <h2>Verify your order</h2>
                    <p>
                        Enter the phone number you used when placing this
                        order.
                    </p>

                    <form
                        onSubmit={handleGuestPhoneSubmit}
                        className="orderdetails-guest-form"
                    >
                        <input
                            type="tel"
                            value={guestPhoneInput}
                            onChange={(e) =>
                                setGuestPhoneInput(e.target.value)
                            }
                            placeholder="98XXXXXXXX"
                            required
                        />

                        <button type="submit">View order</button>
                    </form>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error || !order) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-error">
                    <h2>Order not found</h2>
                    <p>{error || "We couldn't find this order."}</p>

                    <button
                        onClick={() =>
                            navigate(isLoggedIn ? "/orders" : "/")
                        }
                    >
                        {isLoggedIn ? "Back to my orders" : "Back to home"}
                    </button>
                </div>
            </div>
        );
    }

    // MAIN ORDER DETAILS
    return (
        <div className="orderdetails-page">
            <div className="orderdetails-container">

                {/* CONFIRMATION BANNER (only right after checkout) */}
                {justPlaced && (
                    <div className="orderdetails-confirmation">
                        <CheckCircle2 size={22} />

                        <div>
                            <h2>Order placed successfully</h2>
                            <p>
                                Thank you for your order. We will confirm it
                                shortly.
                            </p>
                        </div>
                    </div>
                )}

                {/* HEADER CARD */}
                <div className="orderdetails-card orderdetails-header">
                    <div className="orderdetails-header-text">
                        <span className="orderdetails-header-label">
                            Order reference
                        </span>

                        <h1 title={order.publicId}>
                            {getReference(order.publicId)}
                        </h1>

                        <p>Placed on {formatDate(order.orderDate)}</p>
                    </div>

                    <span className={statusClass(order.status)}>
                        {order.status}
                    </span>
                </div>

                {/* ITEMS */}
                <div className="orderdetails-items">
                    <h2>Items</h2>

                    <div className="orderdetails-items-list">
                        {order.items.map((item) => {
                            const personalizedMessage =
                                item.personalizedMessage?.trim() || "";

                            const messageCharge = Number(
                                item.messageAdditionalPrice || 0
                            );

                            const unitPrice = Number(item.unitPrice || 0);
                            const quantity = Number(item.quantity || 1);

                            const hasPersonalizedMessage =
                                personalizedMessage.length > 0 &&
                                !item.isCustomized;

                            const cakePrice = hasPersonalizedMessage
                                ? unitPrice - messageCharge
                                : unitPrice;

                            return (
                                <div
                                    className="orderdetails-item-card"
                                    key={item.orderItemId}
                                >
                                    <div className="orderdetails-item-heading">
                                        <div>
                                            <h3>{item.cakeName}</h3>

                                            <span className="orderdetails-item-type">
                                                {item.isCustomized
                                                    ? "Customized cake"
                                                    : "Regular cake"}
                                            </span>
                                        </div>

                                        <span className="orderdetails-item-quantity">
                                            Qty {quantity}
                                        </span>
                                    </div>

                                    {/* PERSONALIZED MESSAGE */}
                                    {hasPersonalizedMessage && (
                                        <div className="orderdetails-personalized-message">
                                            <span>Personalized message</span>
                                            <p>“{personalizedMessage}”</p>
                                        </div>
                                    )}

                                    {/* CUSTOMIZATION NOTE */}
                                    {item.isCustomized && (
                                        <p className="orderdetails-customized-note">
                                            Made with your selected design
                                            options.
                                        </p>
                                    )}

                                    {/* PRICE BREAKDOWN */}
                                    <dl className="orderdetails-item-pricing">
                                        <div>
                                            <dt>Cake price</dt>
                                            <dd>{formatMoney(cakePrice)}</dd>
                                        </div>

                                        {hasPersonalizedMessage && (
                                            <div>
                                                <dt>Message charge</dt>
                                                <dd>
                                                    {formatMoney(messageCharge)}
                                                </dd>
                                            </div>
                                        )}

                                        <div>
                                            <dt>
                                                Unit price × {quantity}
                                            </dt>
                                            <dd>{formatMoney(unitPrice)}</dd>
                                        </div>

                                        <div className="orderdetails-item-subtotal">
                                            <dt>Subtotal</dt>
                                            <dd>
                                                {formatMoney(item.subtotal)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="orderdetails-total">
                    <span>Total amount</span>
                    <strong>{formatMoney(order.totalAmount)}</strong>
                </div>

                {/* DELIVERY AND PAYMENT */}
                <div className="orderdetails-card orderdetails-info">
                    <div className="orderdetails-info-row orderdetails-info-wide">
                        <span>Delivery address</span>
                        <strong>{order.shippingAddress || "—"}</strong>
                    </div>

                    <div className="orderdetails-info-row">
                        <span>Payment method</span>
                        <strong>
                            {order.paymentMethod === "CashOnDelivery"
                                ? "Cash on delivery"
                                : order.paymentMethod}
                        </strong>
                    </div>

                    <div className="orderdetails-info-row">
                        <span>Payment status</span>
                        <strong>{order.paymentStatus}</strong>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="orderdetails-actions">
                    {isLoggedIn && (
                        <button
                            className="orderdetails-orders-btn"
                            onClick={() => navigate("/orders")}
                        >
                            My orders
                        </button>
                    )}

                    <button
                        className="orderdetails-browse-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue shopping
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
