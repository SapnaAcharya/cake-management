import { useEffect, useState } from "react";
import {
    ShoppingBag,
    Eye,
    RefreshCw,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    X
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
    getAllOrders,
    getOrderById,
    updateOrderStatus
} from "../../services/adminorderService";
import "../../styles/ManageOrders.css";

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [statusFilter, setStatusFilter] = useState("All");

    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    // Load all orders
    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllOrders();

            setOrders(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadOrders();
    }, []);

    // View order details
    const handleViewOrder = async (orderId) => {
        try {
            setDetailsLoading(true);
            setError("");

            const data = await getOrderById(orderId);

            setSelectedOrder(data);

        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to load order details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // Update status
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingOrderId(orderId);
            setError("");
            setSuccess("");

            await updateOrderStatus(orderId, newStatus);

            setSuccess(
                `Order #${orderId} status updated to ${newStatus}.`
            );

            await loadOrders();

            // Refresh selected order if open
            if (
                selectedOrder &&
                selectedOrder.orderId === orderId
            ) {
                const updatedOrder =
                    await getOrderById(orderId);

                setSelectedOrder(updatedOrder);
            }

        } catch (err) {
            console.error(err);
            setError(
                err.message || "Failed to update order status."
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Filter orders
    const filteredOrders =
        statusFilter === "All"
            ? orders
            : orders.filter(
                  (order) =>
                      order.status === statusFilter
              );

    // Statistics
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
        (order) => order.status === "Pending"
    ).length;

    const processingOrders = orders.filter(
        (order) => order.status === "Processing"
    ).length;

    const deliveredOrders = orders.filter(
        (order) => order.status === "Delivered"
    ).length;
    // Format date
    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    };
    // Format currency
    const formatCurrency = (amount) => {
        return `NPR ${Number(amount || 0).toLocaleString()}`;
    };
    // Status class
    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "order-status pending";

            case "Confirmed":
                return "order-status confirmed";

            case "Processing":
                return "order-status processing";

            case "Shipped":
                return "order-status shipped";

            case "Delivered":
                return "order-status delivered";

            case "Cancelled":
                return "order-status cancelled";

            default:
                return "order-status";
        }
    };

    return (

        <AdminLayout
           title="Manage Orders"
           subtitle="View and manage customer cake orders."
           >
            {/* SUCCESS / ERROR */}
            {success && (
                <div className="orders-success-message">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {error && (
                <div className="orders-error-message">
                    <XCircle size={18} />
                    {error}
                </div>
            )}
            {/* PAGE ACTIONS */}

            <div className="orders-page-actions">
                <button
                    className="refresh-orders-btn"
                    onClick={loadOrders}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "refresh-spinning" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* STATISTICS */}
            <div className="order-stat-grid">

                <div className="order-stat-card">
                    <div className="order-stat-icon">
                        <ShoppingBag size={21} />
                    </div>

                    <div>
                        <p>Total Orders</p>
                        <h2>{totalOrders}</h2>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon">
                        <Clock size={21} />
                    </div>

                    <div>
                        <p>Pending Orders</p>
                        <h2>{pendingOrders}</h2>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon">
                        <Package size={21} />
                    </div>

                    <div>
                        <p>Processing</p>
                        <h2>{processingOrders}</h2>
                    </div>
                </div>

                <div className="order-stat-card">
                    <div className="order-stat-icon">
                        <CheckCircle size={21} />
                    </div>

                    <div>
                        <p>Delivered</p>
                        <h2>{deliveredOrders}</h2>
                    </div>
                </div>

            </div>

            {/* ORDER TABLE */}
            <div className="orders-card">

                <div className="orders-card-header">

                    <div>
                        <h2>Order Records</h2>

                        <p>
                            {filteredOrders.length} orders found
                        </p>
                    </div>

                    <div className="order-filter">

                        <label>
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="All">
                                All Status
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Confirmed">
                                Confirmed
                            </option>

                            <option value="Processing">
                                Processing
                            </option>

                            <option value="Shipped">
                                Shipped
                            </option>

                            <option value="Delivered">
                                Delivered
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>
                        </select>

                    </div>

                </div>

                {loading ? (
                    <div className="orders-loading">
                        Loading orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="orders-empty">
                        <ShoppingBag size={40} />

                        <h3>
                            No orders found
                        </h3>

                        <p>
                            There are no orders matching
                            the selected status.
                        </p>
                    </div>
                ) : (
                    <div className="orders-table-container">

                        <table className="orders-table">

                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Order Date</th>
                                    <th>Total Amount</th>
                                    <th>Payment</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredOrders.map(
                                    (order, index) => (
                                        <tr key={order.orderId}>

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>
                                                <strong>
                                                    Order ID: {order.orderId}
                                                </strong>
                                            </td>

                                            <td>
                                                Customer ID:
                                                {order.userId}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    order.orderDate
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        order.totalAmount
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="payment-info">
                                                    <span>
                                                        {
                                                            order.paymentMethod
                                                        }
                                                    </span>

                                                    <small>
                                                        {
                                                            order.paymentStatus
                                                        }
                                                    </small>
                                                </div>
                                            </td>

                                            <td>

                                                <select
                                                    className={getStatusClass(
                                                        order.status
                                                    )}
                                                    value={
                                                        order.status
                                                    }
                                                    disabled={
                                                        updatingOrderId ===
                                                        order.orderId
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            order.orderId,
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="Pending">
                                                        Pending
                                                    </option>

                                                    <option value="Confirmed">
                                                        Confirmed
                                                    </option>

                                                    <option value="Processing">
                                                        Processing
                                                    </option>

                                                    <option value="Shipped">
                                                        Shipped
                                                    </option>

                                                    <option value="Delivered">
                                                        Delivered
                                                    </option>

                                                    <option value="Cancelled">
                                                        Cancelled
                                                    </option>

                                                </select>

                                            </td>

                                            <td>

                                                <button
                                                    className="view-order-btn"
                                                    onClick={() =>
                                                        handleViewOrder(
                                                            order.orderId
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                    View
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div
                    className="order-modal-overlay"
                    onClick={() =>
                        setSelectedOrder(null)
                    }
                >

                    <div
                        className="order-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="order-modal-header">

                            <div>
                                <h2>
                                    Order ID:
                                    {selectedOrder.orderId}
                                </h2>

                                <p>
                                    Placed on{" "}
                                    {formatDate(
                                        selectedOrder.orderDate
                                    )}
                                </p>
                            </div>

                            <button
                                className="modal-close-btn"
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                            >
                                <X size={18} />
                            </button>

                        </div>

                        {detailsLoading ? (
                            <div className="orders-loading">
                                Loading order details...
                            </div>
                        ) : (
                            <>

                                {/* Order Information */}

                                <div className="order-detail-grid">

                                    <div className="order-detail-box">
                                        <span>
                                            Customer
                                        </span>

                                        <strong>
                                            Customer ID:
                                            {
                                                selectedOrder.userId
                                            }
                                        </strong>
                                    </div>

                                    <div className="order-detail-box">
                                        <span>Order Status</span>
                                        <select 
                                        className={getStatusClass(selectedOrder.status)}
                                        value={selectedOrder.status}
                                        disabled={updatingOrderId === selectedOrder.order.orderId}
                                        onChange={(e) => 
                                            handleStatusChange(selectedOrder.orderId, e.target.value)
                                        }
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>

                                    <div className="order-detail-box">
                                        <span>
                                            Payment Method
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.paymentMethod
                                            }
                                        </strong>
                                    </div>

                                    <div className="order-detail-box">
                                        <span>
                                            Payment Status
                                        </span>

                                        <strong>
                                            {
                                                selectedOrder.paymentStatus
                                            }
                                        </strong>
                                    </div>

                                </div>

                                {/* Shipping */}

                                <div className="shipping-section">

                                    <h3>
                                        Shipping Address
                                    </h3>

                                    <p>
                                        {
                                            selectedOrder.shippingAddress
                                        }
                                    </p>

                                </div>

                                {/* Items */}

                                <div className="order-items-section">

                                    <h3>
                                        Ordered Cakes
                                    </h3>

                                    <table className="order-items-table">

                                        <thead>
                                            <tr>
                                                <th>Cake</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {selectedOrder.items?.map(
                                                (item) => (
                                                    <tr
                                                        key={
                                                            item.orderItemId
                                                        }
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.cakeName
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.quantity
                                                            }
                                                        </td>

                                                        <td>
                                                            {formatCurrency(
                                                                item.unitPrice
                                                            )}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {formatCurrency(
                                                                    item.subtotal
                                                                )}
                                                            </strong>
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                                {/* Total */}

                                <div className="order-total-section">

                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedOrder.totalAmount
                                        )}
                                    </strong>

                                </div>

                            </>
                        )}

                    </div>

                </div>
            )}

        </AdminLayout>
    );
}

export default ManageOrders;