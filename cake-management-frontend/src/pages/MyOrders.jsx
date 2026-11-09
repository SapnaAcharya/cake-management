import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { getMyOrders } from "../services/orderservice";
import "../styles/MyOrders.css";

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
        day: "numeric"
    });
};

const formatMoney = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

// Short, readable reference. The full GUID stays in the URL.
const getReference = (publicId) =>
    publicId ? `CK-${String(publicId).slice(0, 8).toUpperCase()}` : "—";

const IN_PROGRESS = ["Pending", "Confirmed", "Processing", "Preparing", "Shipped"];

const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "In progress" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" }
];

const matchesFilter = (order, filter) => {
    switch (filter) {
        case "active": return IN_PROGRESS.includes(order.status);
        case "delivered": return order.status === "Delivered";
        case "cancelled": return order.status === "Cancelled";
        default: return true;
    }
};

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

const MyOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

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

    // Newest first.
    const sortedOrders = useMemo(
        () =>
            [...orders].sort(
                (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
            ),
        [orders]
    );

    const filteredOrders = useMemo(
        () => sortedOrders.filter((order) => matchesFilter(order, filter)),
        [sortedOrders, filter]
    );

    const countFor = (key) =>
        sortedOrders.filter((order) => matchesFilter(order, key)).length;

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
                    <button onClick={loadOrders}>Try again</button>
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
                        <h1>My orders</h1>
                    </div>

                    <div className="myorders-empty">
                        <div className="myorders-empty-icon">
                            <Package size={36} />
                        </div>

                        <h2>No orders yet</h2>
                        <p>Your placed orders will show up here.</p>

                        <button
                            className="myorders-browse-btn"
                            onClick={() => navigate("/")}
                        >
                            Browse cakes
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

                {/* HEADER */}
                <div className="myorders-header">
                    <h1>My orders</h1>

                    <p>
                        {orders.length}{" "}
                        {orders.length === 1 ? "order" : "orders"} placed
                    </p>
                </div>

                {error && (
                    <div className="myorders-error-message">{error}</div>
                )}

                {/* FILTERS */}
                <div
                    className="myorders-filters"
                    role="tablist"
                    aria-label="Filter orders"
                >
                    {FILTERS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={filter === key}
                            className={`myorders-filter ${
                                filter === key ? "active" : ""
                            }`}
                            onClick={() => setFilter(key)}
                        >
                            {label}
                            <span className="myorders-filter-count">
                                {countFor(key)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* NOTHING MATCHES THE FILTER */}
                {filteredOrders.length === 0 && (
                    <div className="myorders-no-match">
                        <p>No orders in this category.</p>
                    </div>
                )}

                {/* ORDERS */}
                <div className="myorders-list">
                    {filteredOrders.map((order) => {
                        const items = order.items ?? [];
                        const itemCount = items.reduce(
                            (sum, item) => sum + Number(item.quantity || 0),
                            0
                        );

                        return (
                            <Link
                                className="myorder-card"
                                key={order.publicId}
                                to={`/orders/${order.publicId}`}
                            >
                                <div className="myorder-card-top">
                                    <div>
                                        <h2 title={order.publicId}>
                                            {getReference(order.publicId)}
                                        </h2>

                                        <p className="myorder-date">
                                            Placed on{" "}
                                            {formatDate(order.orderDate)}
                                        </p>
                                    </div>

                                    <span className={statusClass(order.status)}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="myorder-card-items">
                                    {items.slice(0, 3).map((item) => (
                                        <span
                                            key={item.orderItemId}
                                            className="myorder-item-chip"
                                        >
                                            {item.cakeName} × {item.quantity}
                                        </span>
                                    ))}

                                    {items.length > 3 && (
                                        <span className="myorder-item-chip more">
                                            +{items.length - 3} more
                                        </span>
                                    )}
                                </div>

                                <div className="myorder-card-bottom">
                                    <div className="myorder-card-total">
                                        <span>
                                            {itemCount}{" "}
                                            {itemCount === 1 ? "item" : "items"}
                                        </span>

                                        <strong>
                                            {formatMoney(order.totalAmount)}
                                        </strong>
                                    </div>

                                    <span className="myorder-view">
                                        View details
                                        <ChevronRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default MyOrders;

