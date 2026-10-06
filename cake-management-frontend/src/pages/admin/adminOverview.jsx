import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    Users,
    Cake,
    DollarSign,
    ArrowRight,
    Clock,
    CheckCircle
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { getAllOrders } from "../../services/adminorderService";
import { getAllUsers } from "../../services/adminuserService";
import "../../styles/AdminOverview.css";

function AdminOverview() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load dashboard data
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [ordersData, usersData] = await Promise.all([
                    getAllOrders(),
                    getAllUsers()
                ]);

                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setUsers(Array.isArray(usersData) ? usersData : []);

            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    // Derived stats
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    const pendingOrders = orders.filter(
        (order) => order.status === "Pending"
    ).length;

    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "Admin").length;
    const totalCustomers = users.filter((u) => u.role === "Customer").length;

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 5);

    // Format helpers
    const formatCurrency = (amount) =>
        `NPR ${Number(amount || 0).toLocaleString()}`;

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending": return "order-status pending";
            case "Confirmed": return "order-status confirmed";
            case "Processing": return "order-status processing";
            case "Shipped": return "order-status shipped";
            case "Delivered": return "order-status delivered";
            case "Cancelled": return "order-status cancelled";
            default: return "order-status";
        }
    };

    return (
        <AdminLayout
            title="Dashboard"
            subtitle="Overview of your cake business at a glance."
        >
            {error && (
                <div className="overview-error-message">
                    {error}
                </div>
            )}

            {/* SUMMARY CARDS */}

            <div className="overview-stat-grid">

                <div className="overview-stat-card">
                    <div className="overview-stat-icon revenue">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <p>Total Revenue</p>
                        <h2>{loading ? "—" : formatCurrency(totalRevenue)}</h2>
                    </div>
                </div>

                <div
                    className="overview-stat-card clickable"
                    onClick={() => navigate("/admin/orders")}
                >
                    <div className="overview-stat-icon orders">
                        <ShoppingBag size={22} />
                    </div>
                    <div>
                        <p>Total Orders</p>
                        <h2>{loading ? "—" : totalOrders}</h2>
                    </div>
                </div>

                <div className="overview-stat-card">
                    <div className="overview-stat-icon pending">
                        <Clock size={22} />
                    </div>
                    <div>
                        <p>Pending Orders</p>
                        <h2>{loading ? "—" : pendingOrders}</h2>
                    </div>
                </div>

                <div
                    className="overview-stat-card clickable"
                    onClick={() => navigate("/admin/users")}
                >
                    <div className="overview-stat-icon users">
                        <Users size={22} />
                    </div>
                    <div>
                        <p>Total Users</p>
                        <h2>{loading ? "—" : totalUsers}</h2>
                    </div>
                </div>

            </div>

            {/* QUICK LINKS */}
            <div className="overview-section-title">Quick Actions</div>

            <div className="overview-quick-links">

                <div
                    className="overview-quick-card"
                    onClick={() => navigate("/admin/cakes")}
                >
                    <Cake size={20} />
                    <div>
                        <h3>Manage Cakes</h3>
                        <p>Add, edit, or remove cakes from the catalog.</p>
                    </div>
                    <ArrowRight size={16} className="quick-arrow" />
                </div>

                <div
                    className="overview-quick-card"
                    onClick={() => navigate("/admin/orders")}
                >
                    <ShoppingBag size={20} />
                    <div>
                        <h3>Manage Orders</h3>
                        <p>Review orders and update their status.</p>
                    </div>
                    <ArrowRight size={16} className="quick-arrow" />
                </div>

                <div
                    className="overview-quick-card"
                    onClick={() => navigate("/admin/users")}
                >
                    <Users size={20} />
                    <div>
                        <h3>Manage Users</h3>
                        <p>{totalAdmins} admin{totalAdmins !== 1 ? "s" : ""}, {totalCustomers} customer{totalCustomers !== 1 ? "s" : ""}.</p>
                    </div>
                    <ArrowRight size={16} className="quick-arrow" />
                </div>

            </div>

            {/* RECENT ORDERS */}
            <div className="overview-recent-card">

                <div className="overview-recent-header">
                    <h2>Recent Orders</h2>
                    <button
                        className="view-all-btn"
                        onClick={() => navigate("/admin/orders")}
                    >
                        View all
                        <ArrowRight size={14} />
                    </button>
                </div>

                {loading ? (
                    <div className="overview-loading">Loading recent orders...</div>
                ) : recentOrders.length === 0 ? (
                    <div className="overview-empty">
                        <CheckCircle size={32} />
                        <p>No orders yet.</p>
                    </div>
                ) : (
                    <div className="overview-table-container">
                        <table className="overview-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order, index) => (
                                    <tr key={order.orderId}>
                                        <td>{index + 1}</td>
                                        <td><strong>#{order.orderId}</strong></td>
                                        <td>Customer #{order.userId}</td>
                                        <td>{formatDate(order.orderDate)}</td>
                                        <td>{formatCurrency(order.totalAmount)}</td>
                                        <td>
                                            <span className={getStatusClass(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </AdminLayout>
    );
}

export default AdminOverview;
