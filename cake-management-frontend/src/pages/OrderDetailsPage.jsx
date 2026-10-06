import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { getOrderById } from "../services/orderservice";
import "../styles/OrderDetails.css";

const statusClass = (status) => {
    switch (status) {
        case "Pending": return "order-status pending";
        case "Confirmed": return "order-status confirmed";
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

const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

const OrderDetails = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
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
     const loadOrder = useCallback(async (phoneOverride) => {
            try {
                setLoading(true);
                setError("");
                setNeedsGuestPhone(false);
    
                let data;
    
                if (isLoggedIn) {
                    data = await getOrderById(orderId);
                } else {
                    const phoneToUse = phoneOverride || passedPhoneNumber;
    
                    if (!phoneToUse) {
                        // No token, no phone number available — ask for it
                        // instead of calling the API with nothing to verify.
                        setNeedsGuestPhone(true);
                        setLoading(false);
                        return;
                    }
    
                    data = await getOrderById(orderId, phoneToUse);
                }
    
                setOrder(data);
            } catch (err) {
                console.error("Error loading order:", err);
                setError(err.message || "Unable to load this order.");
            } finally {
                setLoading(false);
            }
        }, [orderId, isLoggedIn, passedPhoneNumber]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadOrder();
    }, [loadOrder]);

    const handleGuestPhoneSubmit = (e) => {
        e.preventDefault();
        if (guestPhoneInput.trim()){
            loadOrder(guestPhoneInput.trim());
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

    // Guest needs phone number to verify
     if (needsGuestPhone) {
        return (
            <div className="orderdetails-page">
                <div className="orderdetails-error">
                    <h2>Verify your order</h2>
                    <p>Enter the phone number you used when placing this order.</p>

                    <form onSubmit={handleGuestPhoneSubmit} className="orderdetails-guest-form">
                        <input
                            type="tel"
                            value={guestPhoneInput}
                            onChange={(e) => setGuestPhoneInput(e.target.value)}
                            placeholder="98XXXXXXXX"
                            required
                        />
                        <button type="submit">View Order</button>
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
                    <button onClick={() => navigate("/orders")}>
                        Back to My Orders
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
                            <h2>Order placed successfully!</h2>
                            <p>Thank you for your order. We've started preparing it.</p>
                        </div>
                    </div>
                )}

                {/* BACK LINK */}
                <button
                    className="orderdetails-back-link"
                    onClick={() => navigate("/orders")}
                >
                    <ArrowLeft size={15} />
                    Back to My Orders
                </button>

                {/* HEADER */}
                <div className="orderdetails-header">
                    <div>
                        <h1>Order #{order.orderId}</h1>
                        <p>Placed on {formatDate(order.orderDate)}</p>
                    </div>

                    <span className={statusClass(order.status)}>
                        {order.status}
                    </span>
                </div>

                {/* INFO GRID */}
                <div className="orderdetails-info-grid">
                    <div className="orderdetails-info-box">
                        <span>Shipping Address</span>
                        <strong>{order.shippingAddress}</strong>
                    </div>

                    <div className="orderdetails-info-box">
                        <span>Payment Method</span>
                        <strong>{order.paymentMethod}</strong>
                    </div>

                    <div className="orderdetails-info-box">
                        <span>Payment Status</span>
                        <strong>{order.paymentStatus}</strong>
                    </div>
                </div>

                {/* ITEMS */}
                <div className="orderdetails-items">
                    <h2>Items</h2>

                    <div className="orderdetails-items-table">
                        <div className="orderdetails-items-head">
                            <span>Cake</span>
                            <span>Qty</span>
                            <span>Unit Price</span>
                            <span>Subtotal</span>
                        </div>

                        {order.items.map((item) => (
                            <div className="orderdetails-item-row" key={item.orderItemId}>
                                <span className="orderdetails-item-name">{item.cakeName}</span>
                                <span>{item.quantity}</span>
                                <span>Rs. {item.unitPrice.toFixed(2)}</span>
                                <strong>Rs. {item.subtotal.toFixed(2)}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="orderdetails-total">
                    <span>Total Amount</span>
                    <strong>Rs. {order.totalAmount.toFixed(2)}</strong>
                </div>

                {/* ACTIONS */}
                <div className="orderdetails-actions">
                    <button
                        className="orderdetails-browse-btn"
                        onClick={() => navigate("/")}
                    >
                        Continue Shopping
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
