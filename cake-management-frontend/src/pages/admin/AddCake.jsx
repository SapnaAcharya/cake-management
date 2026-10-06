import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import cakeService from "../../services/cakeService";
import { getCategories } from "../../services/categoryService";
import "../../styles/AddCake.css";

function AddCake() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    imageUrl: "",
    isAvailable: true,
    categoryId: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setError("Failed to load categories.");
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", String(Number(formData.price)));
      payload.append("stockQuantity", String(Number(formData.stockQuantity)));
      payload.append("isAvailable", String(formData.isAvailable));
      payload.append("categoryId", String(Number(formData.categoryId)));

      if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await cakeService.createCake(payload);

      navigate("/admin/cakes");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add cake.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Add New Cake"
      subtitle="Create a new cake listing for your store."
    >
      <div className="add-cake-card">
        {error && <div className="add-cake-error">{error}</div>}

        <form onSubmit={handleSubmit} className="add-cake-form">
          <div className="add-cake-field">
            <label>Cake Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter cake name"
              required
            />
          </div>

          <div className="add-cake-field">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter cake description"
              rows={4}
            />
          </div>

          <div className="add-cake-row">
            <div className="add-cake-field">
              <label>Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="add-cake-field">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="add-cake-field">
            <label>Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

             <div className="add-cake-field">
            <label>Cake Image</label>

            {!imagePreview ? (
              <label className="add-cake-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
                <span className="dropzone-text">
                  Click to choose an image from your computer
                </span>
                <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB</span>
              </label>
            ) : (
              <div className="add-cake-preview">
                <img src={imagePreview} alt="Cake preview" />
                <button
                  type="button"
                  className="add-cake-remove-image"
                  onClick={handleRemoveImage}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <label className="add-cake-checkbox">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            Available for customers
          </label>

          

          <div className="add-cake-actions">
            <button
              type="button"
              className="add-cake-btn-secondary"
              onClick={() => navigate("/admin/cakes")}
            >
              Cancel
            </button>
            <button type="submit" className="add-cake-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Add Cake"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddCake;