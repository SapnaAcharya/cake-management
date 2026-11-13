import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import profileService from "../services/profileService";
import {
    Eye,
    EyeOff,
    User,
    ShoppingBag,
    Lock,
    Mail,
    Phone,
    Home,
    Save,
    RotateCcw,
    Crown,
    Camera,
    Trash2,
    X,
    ChevronDown,
    GraduationCap,
    LogOut,
    ShieldCheck,
    Check,
} from "lucide-react";
import { notifyProfilePhotoChanged } from "../hooks/useProfilePhoto";
import "../styles/MyProfile.css";

// Sidebar items. Title and subtitle drive the page heading too.
const TABS = [
    {
        id: "info",
        sidebarLabel: "My Account",
        title: "My Account",
        subtitle: "Manage your personal information and account details",
        icon: User,
    },
    {
        id: "orders",
        sidebarLabel: "My Orders",
        title: "My Orders",
        subtitle: "Track your cake orders and past purchases",
        icon: ShoppingBag,
    },
    {
        id: "training",
        sidebarLabel: "My Training",
        title: "My Training",
        subtitle: "Your baking classes and workshops",
        icon: GraduationCap,
    },
    {
        id: "security",
        sidebarLabel: "Change Password",
        title: "Change Password",
        subtitle: "Keep your account secure with a strong password",
        icon: Lock,
    },
];

// Order filters
const ORDER_FILTERS = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
];

const EMPTY_MESSAGES = {
    all: "You have no orders yet.",
    active: "You have no active orders right now.",
    delivered: "No delivered orders yet.",
    cancelled: "You have no cancelled orders.",
};

// Maps any backend status to one of the filter groups
const statusGroup = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "completed") return "delivered";
    if (s === "cancelled" || s === "canceled") return "cancelled";
    return "active";
};

const API_BASE = import.meta.env.VITE_API_URL || "https://localhost:7092";

const getItemImage = (item) => {
    const url = item.imageUrl;
    if (!url) return "";
    if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
    return `${API_BASE}/${url.replace(/^\//, "")}`;
};

function Profile() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("info");
    const [navOpen, setNavOpen] = useState(false);

    // Profile information
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address: "",
    });
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);

    // Order history
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [ordersLoaded, setOrdersLoaded] = useState(false);
    const [orderFilter, setOrderFilter] = useState("all");
    const [expandedOrders, setExpandedOrders] = useState({});

    // Password change
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Profile photo
    const fileInputRef = useRef(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Load profile
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
                    address: data.address || "",
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

    // Load orders when the My Orders tab is opened
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

    // Mobile drawer: Escape closes it, growing past mobile closes it,
    // and the page behind does not scroll while it is open
    useEffect(() => {
        if (!navOpen) return;

        const onKey = (e) => e.key === "Escape" && setNavOpen(false);
        const mq = window.matchMedia("(min-width: 961px)");
        const onChange = (e) => e.matches && setNavOpen(false);

        document.addEventListener("keydown", onKey);
        mq.addEventListener("change", onChange);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            mq.removeEventListener("change", onChange);
            document.body.style.overflow = "";
        };
    }, [navOpen]);

    // Switch tabs, close the drawer, reset the order filter, clear old messages
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setOrderFilter("all");
        setNavOpen(false);
        setError("");
        setSuccess("");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("role");
        navigate("/login");
    };

    // Profile form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Put the form back to the saved profile values
    const handleReset = () => {
        setForm({
            name: profile?.name || "",
            phone: profile?.phone || "",
            address: profile?.address || "",
        });
        setError("");
        setSuccess("");
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

    // Upload a new profile photo
    const handlePhotoSelect = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // lets the user pick the same file again later
        if (!file) return;

        setError("");
        setSuccess("");

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setError("Please choose a JPG, PNG or WEBP image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be 5 MB or smaller.");
            return;
        }

        try {
            setUploadingPhoto(true);

            const result = await profileService.uploadPhoto(file);

            setProfile((prev) => ({
                ...prev,
                profileImageUrl: result.profileImageUrl,
            }));
            setSuccess("Profile photo updated.");
            notifyProfilePhotoChanged(result.profileImageUrl);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to upload photo.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Remove the profile photo
    const handleRemovePhoto = async () => {
        try {
            setUploadingPhoto(true);
            setError("");
            setSuccess("");

            await profileService.removePhoto();

            setProfile((prev) => ({ ...prev, profileImageUrl: null }));
            setSuccess("Profile photo removed.");
            notifyProfilePhotoChanged(null);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to remove photo.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Password field changes
    const handlePasswordFieldChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    };

    // Validate password form
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
            newErrors.newPassword =
                "New password must be different from the current password.";
        }

        if (passwordForm.confirmPassword !== passwordForm.newPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        return newErrors;
    };

    // Change password
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
                newPassword: passwordForm.newPassword,
            });

            setSuccess("Password changed successfully.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
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

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "—";

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) =>
        `NPR ${Number(amount || 0).toLocaleString()}`;

    // Avatar initials, for example "Sapana Acharya" becomes "SA"
    const displayName = profile?.name || form.name || "";
    const initials =
        displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join("") || "?";

    const activeTitle = TABS.find((t) => t.id === activeTab) || TABS[0];
    const HeaderIcon = activeTitle.icon;

    // Password strength, 0 to 4
    const getStrength = (pw) => {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strengthScore = getStrength(passwordForm.newPassword);
    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];

    const passwordRules = [
        {
            ok: passwordForm.newPassword.length >= 6,
            label: "At least 6 characters",
        },
        {
            ok:
                passwordForm.newPassword.length > 0 &&
                passwordForm.newPassword !== passwordForm.currentPassword,
            label: "Different from your current password",
        },
        {
            ok:
                passwordForm.confirmPassword.length > 0 &&
                passwordForm.confirmPassword === passwordForm.newPassword,
            label: "Both new passwords match",
        },
    ];

    // Orders: count per filter, and the list for the selected filter
    const orderCount = (id) =>
        id === "all"
            ? orders.length
            : orders.filter((o) => statusGroup(o.status) === id).length;

    const filteredOrders =
        orderFilter === "all"
            ? orders
            : orders.filter((o) => statusGroup(o.status) === orderFilter);

    // Password field renderer (keeps the three fields identical)
    const renderPasswordField = ({ id, label, show, setShow }) => (
        <div className="acct-field">
            <label htmlFor={id}>{label}</label>

            <div className="acct-input">
                <Lock size={18} className="acct-input-icon" aria-hidden="true" />
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    name={id}
                    value={passwordForm[id]}
                    onChange={handlePasswordFieldChange}
                    autoComplete={
                        id === "currentPassword" ? "current-password" : "new-password"
                    }
                />
                <button
                    type="button"
                    className="acct-password-toggle"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {passwordErrors[id] && (
                <div className="acct-field-error">{passwordErrors[id]}</div>
            )}
        </div>
    );

    return (
        <div className="acct-page">
            <Navbar />

            <div className="acct-shell">
                {/* Sidebar (desktop) and drawer (mobile) */}
                <aside
                    id="acct-sidebar"
                    className={"acct-sidebar" + (navOpen ? " is-open" : "")}
                    aria-label="Account sections"
                >
                    <div className="acct-drawer-head">
                        <strong>My Account</strong>
                        <button
                            type="button"
                            className="acct-drawer-close"
                            aria-label="Close account menu"
                            onClick={() => setNavOpen(false)}
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                    </div>

                    <nav>
                        {TABS.map(({ id, sidebarLabel, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                className={
                                    "acct-side-link" + (activeTab === id ? " active" : "")
                                }
                                aria-current={activeTab === id ? "page" : undefined}
                                onClick={() => handleTabChange(id)}
                            >
                                <Icon size={20} aria-hidden="true" />
                                <span>{sidebarLabel}</span>
                            </button>
                        ))}

                        <div className="acct-side-divider" />

                        <button
                            type="button"
                            className="acct-side-link acct-side-logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} aria-hidden="true" />
                            <span>Logout</span>
                        </button>
                    </nav>
                </aside>

                {navOpen && (
                    <button
                        type="button"
                        className="acct-backdrop"
                        aria-label="Close account menu"
                        onClick={() => setNavOpen(false)}
                    />
                )}

                <main className="acct-main">
                    {/* Mobile section switcher */}
                    <div className="acct-mobile-bar">
                        <button
                            type="button"
                            className="acct-mobile-toggle"
                            aria-label="Open account menu"
                            aria-expanded={navOpen}
                            aria-controls="acct-sidebar"
                            onClick={() => setNavOpen(true)}
                        >
                            <span>{activeTitle.title}</span>
                            <ChevronDown size={18} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Page heading */}
                    <header className="acct-heading">
                        <span className="acct-heading-icon" aria-hidden="true">
                            <HeaderIcon size={28} />
                        </span>
                        <div>
                            <h1>{activeTitle.title}</h1>
                            <p>{activeTitle.subtitle}</p>
                        </div>
                    </header>

                    {success && (
                        <div className="acct-message acct-success" role="status">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="acct-message acct-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div
                        className={
                            "acct-grid" + (activeTab !== "info" ? " acct-grid-single" : "")
                        }
                    >
                        {/* Summary card (My Account tab only) */}
                        {activeTab === "info" && (
                            <section className="acct-summary" aria-label="Account summary">
                                <div className="acct-avatar-wrap">
                                    <div className="acct-avatar">
                                        {profile?.profileImageUrl ? (
                                            <img
                                                src={profile.profileImageUrl}
                                                alt={`${displayName || "Your"} profile photo`}
                                            />
                                        ) : (
                                            <span aria-hidden="true">{initials}</span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="acct-avatar-edit"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}
                                        aria-label="Change profile photo"
                                    >
                                        <Camera size={18} aria-hidden="true" />
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handlePhotoSelect}
                                        hidden
                                    />
                                </div>

                                {uploadingPhoto && (
                                    <p className="acct-photo-status">Uploading...</p>
                                )}

                                {profile?.profileImageUrl && !uploadingPhoto && (
                                    <button
                                        type="button"
                                        className="acct-photo-remove"
                                        onClick={handleRemovePhoto}
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Remove photo
                                    </button>
                                )}

                                <h2>{displayName || "Your name"}</h2>
                                <p className="acct-summary-email">
                                    <Mail size={16} aria-hidden="true" />
                                    <span>{profile?.email || ""}</span>
                                </p>

                                <div className="acct-badge">
                                    <Crown size={26} aria-hidden="true" />
                                    <div>
                                        <strong>Valued customer</strong>
                                        <span>Thank you for being with us!</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Content card */}
                        <section className="acct-card">
                            <div className="acct-card-body">
                                {/* My account: personal info */}
                                {activeTab === "info" &&
                                    (loadingProfile ? (
                                        <p className="acct-empty">Loading profile...</p>
                                    ) : (
                                        <form onSubmit={handleSave}>
                                            <h3 className="acct-section-title">
                                                Personal information
                                            </h3>

                                            <div className="acct-fields">
                                                <div className="acct-field">
                                                    <label htmlFor="profile-name">
                                                        Full name <span aria-hidden="true">*</span>
                                                    </label>
                                                    <div className="acct-input">
                                                        <User
                                                            size={18}
                                                            className="acct-input-icon"
                                                            aria-hidden="true"
                                                        />
                                                        <input
                                                            id="profile-name"
                                                            type="text"
                                                            name="name"
                                                            value={form.name}
                                                            onChange={handleChange}
                                                            autoComplete="name"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="acct-field">
                                                    <label htmlFor="profile-email">
                                                        Email address
                                                    </label>
                                                    <div className="acct-input">
                                                        <Mail
                                                            size={18}
                                                            className="acct-input-icon"
                                                            aria-hidden="true"
                                                        />
                                                        <input
                                                            id="profile-email"
                                                            type="email"
                                                            value={profile?.email || ""}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>

                                                <div className="acct-field">
                                                    <label htmlFor="profile-phone">
                                                        Phone number
                                                    </label>
                                                    <div className="acct-input">
                                                        <Phone
                                                            size={18}
                                                            className="acct-input-icon"
                                                            aria-hidden="true"
                                                        />
                                                        <input
                                                            id="profile-phone"
                                                            type="tel"
                                                            name="phone"
                                                            value={form.phone}
                                                            onChange={handleChange}
                                                            placeholder="Enter your phone number"
                                                            autoComplete="tel"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="acct-field">
                                                    <label htmlFor="profile-address">
                                                        Address
                                                    </label>
                                                    <div className="acct-input">
                                                        <Home
                                                            size={18}
                                                            className="acct-input-icon"
                                                            aria-hidden="true"
                                                        />
                                                        <input
                                                            id="profile-address"
                                                            type="text"
                                                            name="address"
                                                            value={form.address}
                                                            onChange={handleChange}
                                                            placeholder="Enter your address"
                                                            autoComplete="street-address"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="acct-actions">
                                                <button
                                                    type="button"
                                                    className="acct-btn acct-btn-outline"
                                                    onClick={handleReset}
                                                    disabled={savingProfile}
                                                >
                                                    <RotateCcw size={16} aria-hidden="true" />
                                                    Reset
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="acct-btn acct-btn-primary"
                                                    disabled={savingProfile}
                                                >
                                                    <Save size={16} aria-hidden="true" />
                                                    {savingProfile ? "Saving..." : "Save changes"}
                                                </button>
                                            </div>
                                        </form>
                                    ))}

                                {/* My orders */}
                                {activeTab === "orders" &&
                                    (loadingOrders ? (
                                        <p className="acct-empty">Loading order history...</p>
                                    ) : orders.length === 0 ? (
                                        <div className="acct-placeholder">
                                            <ShoppingBag size={40} aria-hidden="true" />
                                            <h3>No orders yet</h3>
                                            <p>When you order a cake, it will show up here.</p>
                                            <Link
                                                to="/cakes"
                                                className="acct-btn acct-btn-primary"
                                            >
                                                Browse cakes
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="acct-orders-bar">
                                                <h3 className="acct-section-title">
                                                    Order history
                                                </h3>
                                                <div
                                                    className="acct-filters"
                                                    role="group"
                                                    aria-label="Filter orders"
                                                >
                                                    {ORDER_FILTERS.map((f) => (
                                                        <button
                                                            key={f.id}
                                                            type="button"
                                                            className={
                                                                "acct-filter" +
                                                                (orderFilter === f.id ? " active" : "")
                                                            }
                                                            aria-pressed={orderFilter === f.id}
                                                            onClick={() => setOrderFilter(f.id)}
                                                        >
                                                            {f.label} <span>{orderCount(f.id)}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <p className="acct-hint" aria-live="polite">
                                                Showing {filteredOrders.length} of {orders.length}{" "}
                                                {orders.length === 1 ? "order" : "orders"}
                                            </p>

                                            {filteredOrders.length === 0 ? (
                                                <p className="acct-empty">
                                                    {EMPTY_MESSAGES[orderFilter]}
                                                </p>
                                            ) : (
                                                <div className="acct-orders">
                                                    {filteredOrders.map((order) => {
                                                        const items = order.items || [];
                                                        const expanded = !!expandedOrders[order.id];
                                                        const shown = expanded
                                                            ? items
                                                            : items.slice(0, 2);
                                                        const hidden = items.length - shown.length;

                                                        return (
                                                            <article
                                                                key={order.id}
                                                                className="acct-order"
                                                            >
                                                                <header className="acct-order-top">
                                                                    <div>
                                                                        <strong>Order #{order.id}</strong>
                                                                        <span>
                                                                            {formatDate(order.orderDate)} ·{" "}
                                                                            {items.length}{" "}
                                                                            {items.length === 1
                                                                                ? "item"
                                                                                : "items"}
                                                                        </span>
                                                                    </div>
                                                                    <span
                                                                        className={`acct-order-status acct-status-${(
                                                                            order.status || ""
                                                                        )
                                                                            .toLowerCase()
                                                                            .replace(/\s+/g, "-")}`}
                                                                    >
                                                                        {order.status}
                                                                    </span>
                                                                </header>

                                                                <ul className="acct-order-items">
                                                                    {shown.map((item, index) => (
                                                                        <li
                                                                            key={`${order.id}-${
                                                                                item.id ?? index
                                                                            }`}
                                                                        >
                                                                            {/* {item.imageUrl ? (
                                                                                <img
                                                                                    src={item.imageUrl}
                                                                                    alt=""
                                                                                    className="acct-order-thumb"
                                                                                    loading="lazy"
                                                                                />
                                                                            ) : (
                                                                                <span className="acct-order-thumb" />
                                                                            )} */}
                                                                            {getItemImage(item) ? (
    <img
        src={getItemImage(item)}
        alt=""
        className="acct-order-thumb"
        loading="lazy"
    />
) : (
    <span className="acct-order-thumb" />
)}
                                                                            <div className="acct-order-item-info">
                                                                                <span className="acct-order-item-name">
                                                                                    {item.cakeName ||
                                                                                        item.name ||
                                                                                        "Custom cake"}
                                                                                </span>
                                                                                <small>
                                                                                    Qty {item.quantity} ×{" "}
                                                                                    {formatCurrency(
                                                                                        item.unitPrice
                                                                                    )}
                                                                                </small>
                                                                            </div>
                                                                            <span className="acct-order-item-price">
                                                                                {formatCurrency(
                                                                                    item.subtotal
                                                                                )}
                                                                            </span>
                                                                        </li>
                                                                    ))}
                                                                </ul>

                                                                {items.length > 2 && (
                                                                    <button
                                                                        type="button"
                                                                        className="acct-order-toggle"
                                                                        aria-expanded={expanded}
                                                                        onClick={() =>
                                                                            setExpandedOrders((prev) => ({
                                                                                ...prev,
                                                                                [order.id]: !prev[order.id],
                                                                            }))
                                                                        }
                                                                    >
                                                                        {expanded
                                                                            ? "Show fewer items"
                                                                            : `Show ${hidden} more ${
                                                                                  hidden === 1
                                                                                      ? "item"
                                                                                      : "items"
                                                                              }`}
                                                                    </button>
                                                                )}

                                                                <footer className="acct-order-foot">
                                                                    <dl className="acct-order-meta">
                                                                        <div>
                                                                            <dt>Payment</dt>
                                                                            <dd>
                                                                                {[
                                                                                    order.paymentMethod,
                                                                                    order.paymentStatus,
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(" · ") || "—"}
                                                                            </dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt>Delivery address</dt>
                                                                            <dd>
                                                                                {order.shippingAddress ||
                                                                                    "—"}
                                                                            </dd>
                                                                        </div>
                                                                    </dl>
                                                                    <div className="acct-order-total">
                                                                        <span>Total</span>
                                                                        <strong>
                                                                            {formatCurrency(
                                                                                order.totalAmount
                                                                            )}
                                                                        </strong>
                                                                    </div>
                                                                </footer>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </>
                                    ))}

                                {/* My training */}
                                {activeTab === "training" && (
                                    <div className="acct-placeholder">
                                        <GraduationCap size={40} aria-hidden="true" />
                                        <h3>No training yet</h3>
                                        <p>
                                            Join one of our baking classes and your bookings will
                                            show up here.
                                        </p>
                                        <Link
                                            to="/training"
                                            className="acct-btn acct-btn-primary"
                                        >
                                            Browse training
                                        </Link>
                                    </div>
                                )}

                                {/* Change password */}
                                {activeTab === "security" && (
                                    <div className="acct-security">
                                        <form onSubmit={handleChangePassword} noValidate>
                                            <h3 className="acct-section-title">
                                                Update your password
                                            </h3>
                                            <p className="acct-hint">
                                                Choose something you don't use on other websites.
                                            </p>

                                            <div className="acct-fields acct-fields-single">
                                                {renderPasswordField({
                                                    id: "currentPassword",
                                                    label: "Current password",
                                                    show: showCurrentPassword,
                                                    setShow: setShowCurrentPassword,
                                                })}
                                                {renderPasswordField({
                                                    id: "newPassword",
                                                    label: "New password",
                                                    show: showNewPassword,
                                                    setShow: setShowNewPassword,
                                                })}
                                                {renderPasswordField({
                                                    id: "confirmPassword",
                                                    label: "Confirm new password",
                                                    show: showConfirmPassword,
                                                    setShow: setShowConfirmPassword,
                                                })}
                                            </div>

                                            <div className="acct-actions">
                                                <button
                                                    type="submit"
                                                    className="acct-btn acct-btn-primary"
                                                    disabled={changingPassword}
                                                >
                                                    <Lock size={16} aria-hidden="true" />
                                                    {changingPassword
                                                        ? "Updating..."
                                                        : "Update password"}
                                                </button>
                                            </div>
                                        </form>

                                        <aside
                                            className="acct-tips"
                                            aria-label="Password guidance"
                                        >
                                            <div className="acct-tips-head">
                                                <ShieldCheck size={20} aria-hidden="true" />
                                                <strong>Keep your account safe</strong>
                                            </div>

                                            <div className="acct-strength">
                                                <div className="acct-strength-row">
                                                    <span>Strength</span>
                                                    <strong>{strengthLabel || "—"}</strong>
                                                </div>
                                                <div
                                                    className={`acct-meter level-${strengthScore}`}
                                                    aria-hidden="true"
                                                >
                                                    {[0, 1, 2, 3].map((i) => (
                                                        <span
                                                            key={i}
                                                            className={i < strengthScore ? "on" : ""}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <ul className="acct-rules">
                                                {passwordRules.map((rule) => (
                                                    <li
                                                        key={rule.label}
                                                        className={rule.ok ? "ok" : ""}
                                                    >
                                                        <span
                                                            className="acct-rule-dot"
                                                            aria-hidden="true"
                                                        >
                                                            {rule.ok && <Check size={12} />}
                                                        </span>
                                                        {rule.label}
                                                    </li>
                                                ))}
                                            </ul>

                                            <p className="acct-tips-note">
                                                A longer password mixing upper and lower case letters
                                                and numbers is stronger.
                                            </p>
                                        </aside>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;
