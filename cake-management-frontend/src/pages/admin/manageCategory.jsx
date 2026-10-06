import { useEffect, useState } from "react";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/categoryService";
import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/ManageCategories.css";

function ManageCategories() {
    const [categories, setCategories] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
         // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount, setState only runs after await
        loadCategories();
    }, []);

    // Clear form
    const resetForm = () => {
        setName("");
        setDescription("");
        setEditingId(null);
    };

    // Add or update category
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Category name is required");
            return;
        }

        try {
            setError("");
            setSuccess("");

            const categoryData = {
                name: name.trim(),
                description: description.trim()
            };

            if (editingId) {
                await updateCategory(editingId, categoryData);
                setSuccess("Category updated successfully.");
            } else {
                await createCategory(categoryData);
                setSuccess("Category added successfully.");
            }

            resetForm();
            await loadCategories();

        } catch (err) {
            setError(err.message);
        }
    };

    // Load category data into form for editing
    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name);
        setDescription(category.description || "");

        setError("");
        setSuccess("");
    };

    // Delete category
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmDelete) return;

        try {
            setError("");
            setSuccess("");

            await deleteCategory(id);

            setSuccess("Category deleted successfully.");
            await loadCategories();

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AdminLayout
             title="Manage Categories"
             subtitle="Add, edit, and manage cake categories."
        >
            {/* Messages */}
            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="category-layout">

                {/* Category Form */}
                <div className="category-form-card">
                    <h2>
                        {editingId ? "Edit Category" : "Add New Category"}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Category Name</label>
                            <input
                                type="text"
                                placeholder="Enter category name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Enter category description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {editingId ? "Update Category" : "Add Category"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                    </form>
                </div>

                {/* Category List */}
                <div className="category-list-card">
                    <div className="list-header">
                        <div>
                            <h2>Category Records</h2>
                            <p>{categories.length} categories found</p>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading categories...</p>
                    ) : categories.length === 0 ? (
                        <p>No categories found.</p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.N.</th>
                                        <th>Category Name</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {categories.map((category, index) => (
                                        <tr key={category.id}>
                                            <td>{index + 1}</td>
                                            <td>{category.name}</td>
                                            <td>{category.description || "—"}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}

export default ManageCategories;