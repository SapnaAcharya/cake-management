import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import profileService from "../services/profileService";
import { Eye, EyeOff } from "lucide-react";
import "../styles/MyProfile.css";

function Profile() {
    const [activeTab, setActiveTab] = useState("info");

    // Profile info state
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: ""
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);

    // Order history state
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [ordersLoaded, setOrdersLoaded] = useState(false);

    // Change password state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Load profile on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoadingProfile(true);
                setError("");

                const data = await profileService.getMyProfile();

                setProfile(data);
                setForm({
                    name: data.name || "",
                    phone: data.phone || "",
                    address: data.address || ""
                });

            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load profile.");
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, []);

    // Load orders when the Order History tab is opened (lazy load)
    useEffect(() => {
        if (activeTab !== "orders" || ordersLoaded) return;

        const loadOrders = async () => {
            try {
                setLoadingOrders(true);
                setError("");

                const data = await profileService.getMyOrders();

                setOrders(Array.isArray(data) ? data : []);
                setOrdersLoaded(true);

            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load order history.");
            } finally {
                setLoadingOrders(false);
            }
        };

        loadOrders();
    }, [activeTab, ordersLoaded]);

    // Handle profile form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Save profile
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSavingProfile(true);
            setError("");
            setSuccess("");

            const result = await profileService.updateMyProfile(form);

            const updatedUser = result.user || result;
            setProfile(updatedUser);
            setSuccess("Profile updated successfully.");

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

        // Change password
        const handlePasswordFieldChange = (e) => {
            const { name, value } = e.target;
            setPasswordForm((prev) => ({ ...prev, [name]: value }));
        };
    
        const validatePasswordForm = () => {
            const newErrors = {};
    
            if (!passwordForm.currentPassword) {
                newErrors.currentPassword = "Enter your current password.";
            }
    
            if (!passwordForm.newPassword) {
                newErrors.newPassword = "Enter a new password.";
            } else if (passwordForm.newPassword.length < 6) {
                newErrors.newPassword = "New password must be at least 6 characters.";
            } else if (passwordForm.newPassword === passwordForm.currentPassword) {
                newErrors.newPassword = "New password must be different from the current password.";
            }
    
            if (passwordForm.confirmPassword !== passwordForm.newPassword) {
                newErrors.confirmPassword = "Passwords do not match.";
            }
    
            return newErrors;
        };
    
        const handleChangePassword = async (e) => {
            e.preventDefault();
            setError("");
            setSuccess("");
    
            const validationErrors = validatePasswordForm();
            setPasswordErrors(validationErrors);
            if (Object.keys(validationErrors).length > 0) return;
    
            try {
                setChangingPassword(true);
    
                await profileService.changePassword({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                });
    
                setSuccess("Password changed successfully.");
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setPasswordErrors({});
    
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to change password.");
            } finally {
                setChangingPassword(false);
            }
        };

    // Format helpers
    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const formatCurrency = (amount) =>
        `NPR ${Number(amount || 0).toLocaleString()}`;

    return (
        <div className="profile-page">
            <Navbar />

            <main className="profile-content">
                <h1>My Account</h1>

                {success && <div className="profile-success">{success}</div>}
                {error && <div className="profile-error">{error}</div>}

                <div className="profile-tabs">
                    <button
                        className={activeTab === "info" ? "active" : ""}
                        onClick={() => setActiveTab("info")}
                    >
                        My Info
                    </button>
                    <button
                        className={activeTab === "orders" ? "active" : ""}
                        onClick={() => setActiveTab("orders")}
                    >
                        Order History
                    </button>
                    <button className={activeTab === "security" ? "active" : ""}
                    onClick={() => setActiveTab("security")}
                    >
                        Change Password
                    </button>
                </div>

                {activeTab === "info" && (
                    <div className="profile-card">
                        {loadingProfile ? (
                            <p>Loading profile...</p>
                        ) : (
                            <form onSubmit={handleSave} className="profile-form">
                                <div className="form-field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={profile?.email || ""}
                                        disabled
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={savingProfile}
                                >
                                    {savingProfile ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="profile-card">
                        {loadingOrders ? (
                            <p>Loading order history...</p>
                        ) : orders.length === 0 ? (
                            <p>You haven't placed any orders yet.</p>
                        ) : (
                            <div className="order-history-list">
                                {orders.map((order) => (
                                    <div key={order.id} className="order-history-item">
                                        <div className="order-history-header">
                                            <strong>Order #{order.id}</strong>
                                            <span>{formatDate(order.orderDate)}</span>
                                        </div>
                                        <div className="order-history-status">
                                            {order.status}
                                        </div>
                                        <ul>
                                            {order.items?.map((item) => (
                                                <li key={item.cakeId}>
                                                    {item.cakeName} × {item.quantity} —{" "}
                                                    {formatCurrency(item.subtotal)}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="order-history-total">
                                            Total: {formatCurrency(order.totalAmount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "security" && (
                                    <div className="profile-card">
                                        <form onSubmit={handleChangePassword} className="profile-form" noValidate>
                                            <div className="form-field">
                                                <label htmlFor="currentPassword">Current Password</label>
                                                <div className="password-input-wrap">
                                                    <input
                                                        id="currentPassword"
                                                        type={showCurrentPassword ? "text" : "password"}
                                                        name="currentPassword"
                                                        value={passwordForm.currentPassword}
                                                        onChange={handlePasswordFieldChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowCurrentPassword((v) => !v)}
                                                        tabIndex={-1}
                                                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {passwordErrors.currentPassword && (
                                                    <div className="field-error">{passwordErrors.currentPassword}</div>
                                                )}
                                            </div>
                
                                            <div className="form-field">
                                                <label htmlFor="newPassword">New Password</label>
                                                <div className="password-input-wrap">
                                                    <input
                                                        id="newPassword"
                                                        type={showNewPassword ? "text" : "password"}
                                                        name="newPassword"
                                                        value={passwordForm.newPassword}
                                                        onChange={handlePasswordFieldChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowNewPassword((v) => !v)}
                                                        tabIndex={-1}
                                                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {passwordErrors.newPassword && (
                                                    <div className="field-error">{passwordErrors.newPassword}</div>
                                                )}
                                            </div>
                
                                            <div className="form-field">
                                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                                <div className="password-input-wrap">
                                                    <input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={handlePasswordFieldChange}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                                        tabIndex={-1}
                                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {passwordErrors.confirmPassword && (
                                                    <div className="field-error">{passwordErrors.confirmPassword}</div>
                                                )}
                                            </div>
                
                                            <button
                                                type="submit"
                                                className="save-btn"
                                                disabled={changingPassword}
                                            >
                                                {changingPassword ? "Updating..." : "Update Password"}
                                            </button>
                                        </form>
                                    </div>
                             )}
            </main>
        </div>
    );
}

export default Profile;
