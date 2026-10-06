import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../services/orderservice";
import "../styles/MyOrders.css";
import { Package } from "lucide-react";

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
        day: "numeric"
    });
};

const MyOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // LOAD MY ORDERS
    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyOrders();

            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading orders:", err);
            setError(err.message || "Unable to load your orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadOrders();
    }, []);

    // LOADING STATE
    if (loading) {
        return (
            <div className="myorders-page">
                <div className="myorders-loading">
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    // ERROR STATE
    if (error && orders.length === 0) {
        return (
            <div className="myorders-page">
                <div className="myorders-error">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={loadOrders}>Try Again</button>
                </div>
            </div>
        );
    }

    // EMPTY STATE
    if (orders.length === 0) {
        return (
            <div className="myorders-page">
                <div className="myorders-container">
                    <div className="myorders-header">
                        <h1>My Orders</h1>
                    </div>

                    <div className="myorders-empty">
                        <div className="myorders-empty-icon">
                            <Package size={40} />
                        </div>
                        <h2>No orders yet</h2>
                        <p>Your placed orders will show up here.</p>
                        <button
                            className="myorders-browse-btn"
                            onClick={() => navigate("/")}
                        >
                            Browse Cakes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // MAIN ORDERS LIST
    return (
        <div className="myorders-page">
            <div className="myorders-container">

                <div className="myorders-header">
                    <div>
                        <h1>My Orders</h1>
                        <p>
                            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="myorders-error-message">
                        {error}
                    </div>
                )}

                <div className="myorders-list">
                    {orders.map((order) => (
                        <div
                            className="myorder-card"
                            key={order.orderId}
                            onClick={() => navigate(`/orders/${order.orderId}`)}
                        >
                            <div className="myorder-card-top">
                                <div>
                                    <h2>Order #{order.orderId}</h2>
                                    <p className="myorder-date">
                                        Placed on {formatDate(order.orderDate)}
                                    </p>
                                </div>

                                <span className={statusClass(order.status)}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="myorder-card-items">
                                {order.items.slice(0, 3).map((item) => (
                                    <span key={item.orderItemId} className="myorder-item-chip">
                                        {item.cakeName} × {item.quantity}
                                    </span>
                                ))}
                                {order.items.length > 3 && (
                                    <span className="myorder-item-chip more">
                                        +{order.items.length - 3} more
                                    </span>
                                )}
                            </div>

                            <div className="myorder-card-bottom">
                                <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                                <strong>Rs. {order.totalAmount.toFixed(2)}</strong>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default MyOrders;
