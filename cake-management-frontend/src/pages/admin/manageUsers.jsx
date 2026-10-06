import { useEffect, useState } from "react";
import {
    Users,
    Shield,
    UserCheck,
    RefreshCw,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    X
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
    getAllUsers,
    updateUser,
    deleteUser
} from "../../services/adminuserService";
import "../../styles/ManageUsers.css";

// Get the logged-in admin's own ID so we can protect their row
const getCurrentUserId = () => {
    try {
        const raw =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        if (!raw) return null;

        const user = JSON.parse(raw);
        return user?.id ?? null;
    } catch {
        return null;
    }
};

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUserId = getCurrentUserId();

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [roleFilter, setRoleFilter] = useState("All");

    // Edit modal state
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        address: "",
        role: "Customer"
    });
    const [savingEdit, setSavingEdit] = useState(false);

    // Load all users
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllUsers();

            setUsers(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadUsers();
    }, []);

    // Open edit modal
    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
            role: user.role || "Customer"
        });
        setError("");
        setSuccess("");
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditCancel = () => {
        setEditingUser(null);
    };

    // Save edit
    const handleEditSave = async (e) => {
        e.preventDefault();

        if (!editingUser) return;

        try {
            setSavingEdit(true);
            setError("");
            setSuccess("");

            const updated = await updateUser(editingUser.id, editForm);

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === editingUser.id
                        ? { ...user, ...updated }
                        : user
                )
            );

            setSuccess(`User #${editingUser.id} updated successfully.`);
            setEditingUser(null);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to update user.");
        } finally {
            setSavingEdit(false);
        }
    };

    // Delete user
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user? This cannot be undone."
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await deleteUser(id);

            setUsers((currentUsers) =>
                currentUsers.filter((user) => user.id !== id)
            );

            setSuccess(`User #${id} deleted successfully.`);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to delete user.");
        }
    };

    // Filter users
    const filteredUsers =
        roleFilter === "All"
            ? users
            : users.filter((user) => user.role === roleFilter);

    // Statistics
    const totalUsers = users.length;

    const adminCount = users.filter(
        (user) => user.role === "Admin"
    ).length;

    const customerCount = users.filter(
        (user) => user.role === "Customer"
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

    // Role badge class
    const getRoleClass = (role) => {
        switch (role) {
            case "Admin":
                return "user-role admin";
            case "Customer":
                return "user-role customer";
            default:
                return "user-role";
        }
    };

    return (
        <AdminLayout
            title="Manage Users"
            subtitle="View, edit, and manage all registered users."
        >
            {/* SUCCESS / ERROR */}
            {success && (
                <div className="users-success-message">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {error && (
                <div className="users-error-message">
                    <XCircle size={18} />
                    {error}
                </div>
            )}

            {/* PAGE ACTIONS */}

            <div className="users-page-actions">
                <button
                    className="refresh-users-btn"
                    onClick={loadUsers}
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
            <div className="user-stat-grid">

                <div className="user-stat-card">
                    <div className="user-stat-icon">
                        <Users size={21} />
                    </div>
                    <div>
                        <p>Total Users</p>
                        <h2>{totalUsers}</h2>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon">
                        <Shield size={21} />
                    </div>
                    <div>
                        <p>Admins</p>
                        <h2>{adminCount}</h2>
                    </div>
                </div>

                <div className="user-stat-card">
                    <div className="user-stat-icon">
                        <UserCheck size={21} />
                    </div>
                    <div>
                        <p>Customers</p>
                        <h2>{customerCount}</h2>
                    </div>
                </div>

            </div>

            {/* USER TABLE */}
            <div className="users-card">

                <div className="users-card-header">
                    <div>
                        <h2>User Records</h2>
                        <p>{filteredUsers.length} users found</p>
                    </div>

                    <div className="user-filter">
                        <label>Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Customer">Customer</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="users-loading">
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="users-empty">
                        <Users size={40} />
                        <h3>No users found</h3>
                        <p>There are no users matching the selected role.</p>
                    </div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Joined</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>#{user.id}</strong></td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || "—"}</td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <span className={getRoleClass(user.role)}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            {user.id === currentUserId ? (
                                                <span className="own-account-note">
                                                    This is you — manage your profile separately
                                                </span>
                                            ) : (
                                                <div className="user-actions">
                                                    <button
                                                        className="edit-user-btn"
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <Pencil size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="delete-user-btn"
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={user.role === "Admin"}
                                                        title={
                                                            user.role === "Admin"
                                                                ? "Admin accounts can't be deleted from here"
                                                                : "Delete user"
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* EDIT USER MODAL */}

            {editingUser && (
                <div
                    className="user-modal-overlay"
                    onClick={handleEditCancel}
                >
                    <div
                        className="user-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="user-modal-header">
                            <div>
                                <h2>Edit User #{editingUser.id}</h2>
                                <p>{editingUser.email}</p>
                            </div>
                            <button
                                className="modal-close-btn"
                                onClick={handleEditCancel}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSave} className="user-edit-form">

                            <div className="form-field">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="form-field">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editForm.address}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="form-field">
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={editForm.role}
                                    onChange={handleEditChange}
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="user-modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={handleEditCancel}
                                    disabled={savingEdit}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={savingEdit}
                                >
                                    {savingEdit ? "Saving..." : "Save Changes"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}

export default ManageUsers;

