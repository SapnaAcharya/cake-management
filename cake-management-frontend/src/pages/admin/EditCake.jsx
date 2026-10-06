import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import cakeService from "../../services/cakeService";
import { getCategories } from "../../services/categoryService";
import { getImageUrl } from "../../utils/imageUrl";
import "../../styles/AddCake.css";

function EditCake() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    isAvailable: true,
    categoryId: "",
  });

  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  // Load categories + existing cake data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, cake] = await Promise.all([
          getCategories(),
          cakeService.getCakeById(id),
        ]);

        setCategories(categoriesData);

        setFormData({
          name: cake.name || "",
          description: cake.description || "",
          price: cake.price ?? "",
          stockQuantity: cake.stockQuantity ?? "",
          isAvailable: cake.isAvailable ?? true,
          categoryId: cake.categoryId ?? "",
        });

        setExistingImageUrl(cake.imageUrl || null);
      } catch {
        setError("Failed to load cake details.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [id]);

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

  const handleRemoveNewImage = () => {
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

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await cakeService.updateCake(id, payload);
      navigate("/admin/cakes");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update cake.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout title="Edit Cake" subtitle="Loading cake details...">
        <div className="add-cake-card">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Cake" subtitle="Update this cake's details.">
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
              required
            />
          </div>

          <div className="add-cake-field">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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

            {imagePreview ? (
              <div className="add-cake-preview">
                <img src={imagePreview} alt="New preview" />
                <button type="button" className="add-cake-remove-image" onClick={handleRemoveNewImage}>
                  Cancel new image
                </button>
              </div>
            ) : existingImageUrl ? (
              <div className="add-cake-preview">
                <img src={getImageUrl(existingImageUrl)} alt="Current cake" />
                <label className="add-cake-btn-secondary" style={{ cursor: "pointer", display: "inline-block", marginTop: "8px" }}>
                  Replace Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              </div>
            ) : (
              <label className="add-cake-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
                <span className="dropzone-text">Click to choose an image</span>
                <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB</span>
              </label>
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
            <button type="button" className="add-cake-btn-secondary" onClick={() => navigate("/admin/cakes")}>
              Cancel
            </button>
            <button type="submit" className="add-cake-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Update Cake"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default EditCake;