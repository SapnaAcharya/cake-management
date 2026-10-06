import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import templateService from "../../services/admintemplateService";
import "../../styles/AddCake.css";

// Free-text on the backend — offered as suggestions only, admin can type anything.
const CATEGORY_SUGGESTIONS = [
  "Birthday", "Chocolate", "Wedding", "Kids", "Graduation", "Anniversary",
  "Floral", "Macaron", "Cartoon", "Rustic", "Heart Shape", "Rainbow",
  "Ocean Theme", "Minimalist", "Fruits",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function AddTemplate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tiers: "",
    basePrice: "",
    isPopular: false,
    minPrepHours: "",
    maxPrepHours: "",
    sizes: "",     // comma-separated inches, e.g. "6, 8, 10"
    features: "",  // comma-separated tags, e.g. "sprinkles, message"
  });

  // Matches the backend's colors shape: [{ colorName, colorHex }]
  const [colors, setColors] = useState([{ colorName: "", colorHex: "#ffffff" }]);

  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [previewFile, setPreviewFile] = useState(null);
  const [previewPreview, setPreviewPreview] = useState(null);

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleColorChange = (index, field, value) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const addColorRow = () => {
    setColors((prev) => [...prev, { colorName: "", colorHex: "#ffffff" }]);
  };

  const removeColorRow = (index) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const validateImage = (file) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 5MB.");
      return false;
    }
    return true;
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (!file || !validateImage(file)) return;
    setError("");
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handlePreviewImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !validateImage(file)) return;
    setError("");
    setPreviewFile(file);
    setPreviewPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(validateImage);
    if (validFiles.length === 0) return;

    setError("");
    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!thumbFile) {
      setError("A thumbnail image is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("tiers", String(Number(formData.tiers)));
      payload.append("basePrice", String(Number(formData.basePrice)));
      payload.append("isPopular", String(formData.isPopular));
      payload.append("minPrepHours", String(Number(formData.minPrepHours)));
      payload.append("maxPrepHours", String(Number(formData.maxPrepHours)));

      formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((size) => payload.append("sizes", size));

      formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .forEach((feature) => payload.append("features", feature));

      colors
        .filter((c) => c.colorName.trim())
        .forEach((c, i) => {
          payload.append(`colors[${i}].colorName`, c.colorName.trim());
          payload.append(`colors[${i}].colorHex`, c.colorHex);
        });

      payload.append("thumbImage", thumbFile);
      if (previewFile) payload.append("previewImage", previewFile);
      galleryFiles.forEach((file) => payload.append("galleryImages", file));

      await templateService.createTemplate(payload);

      navigate("/admin/templates");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Add New Template"
      subtitle="Create a new cake template for the storefront."
    >
      <div className="add-cake-card">
        {error && <div className="add-cake-error">{error}</div>}

        <form onSubmit={handleSubmit} className="add-cake-form">
          <div className="add-cake-field">
            <label>Template Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter template name"
              required
            />
          </div>

          <div className="add-cake-field">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter template description"
              rows={4}
            />
          </div>

          <div className="add-cake-row">
            <div className="add-cake-field">
              <label>Category</label>
              <input
                type="text"
                name="category"
                list="category-suggestions"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Birthday"
                required
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="add-cake-field">
              <label>Tiers</label>
              <input
                type="number"
                name="tiers"
                value={formData.tiers}
                onChange={handleChange}
                placeholder="1"
                min="1"
                required
              />
            </div>
          </div>

          <div className="add-cake-row">
            <div className="add-cake-field">
              <label>Base Price ($)</label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="add-cake-field">
              <label>Sizes (inches, comma-separated)</label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="6, 8, 10"
              />
            </div>
          </div>

          <div className="add-cake-row">
            <div className="add-cake-field">
              <label>Min Prep Hours</label>
              <input
                type="number"
                name="minPrepHours"
                value={formData.minPrepHours}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="add-cake-field">
              <label>Max Prep Hours</label>
              <input
                type="number"
                name="maxPrepHours"
                value={formData.maxPrepHours}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="add-cake-field">
            <label>Features (comma-separated)</label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="sprinkles, message, candles"
            />
          </div>

          <div className="add-cake-field">
            <label>Colors</label>
            {colors.map((color, index) => (
              <div
                key={index}
                style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}
              >
                <input
                  type="text"
                  placeholder="Color name (e.g. pink)"
                  value={color.colorName}
                  onChange={(e) => handleColorChange(index, "colorName", e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="color"
                  value={color.colorHex}
                  onChange={(e) => handleColorChange(index, "colorHex", e.target.value)}
                  style={{ width: "44px", height: "36px", padding: 0, border: "none" }}
                />
                <input
                  type="text"
                  value={color.colorHex}
                  onChange={(e) => handleColorChange(index, "colorHex", e.target.value)}
                  style={{ width: "90px" }}
                />
                {colors.length > 1 && (
                  <button
                    type="button"
                    className="row-action-btn delete"
                    onClick={() => removeColorRow(index)}
                    aria-label="Remove color"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-cake-btn-secondary"
              onClick={addColorRow}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={14} /> Add Color
            </button>
          </div>

          <div className="add-cake-field">
            <label>Thumbnail Image</label>
            {!thumbPreview ? (
              <label className="add-cake-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbChange}
                  hidden
                />
                <span className="dropzone-text">
                  Click to choose a thumbnail image
                </span>
                <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB</span>
              </label>
            ) : (
              <div className="add-cake-preview">
                <img src={thumbPreview} alt="Thumbnail preview" />
                <button
                  type="button"
                  className="add-cake-remove-image"
                  onClick={() => {
                    setThumbFile(null);
                    setThumbPreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="add-cake-field">
            <label>Preview Image (used on the customize page)</label>
            {!previewPreview ? (
              <label className="add-cake-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePreviewImageChange}
                  hidden
                />
                <span className="dropzone-text">
                  Click to choose a preview image
                </span>
                <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB</span>
              </label>
            ) : (
              <div className="add-cake-preview">
                <img src={previewPreview} alt="Preview" />
                <button
                  type="button"
                  className="add-cake-remove-image"
                  onClick={() => {
                    setPreviewFile(null);
                    setPreviewPreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="add-cake-field">
            <label>Gallery Images</label>
            <label className="add-cake-dropzone">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryChange}
                multiple
                hidden
              />
              <span className="dropzone-text">
                Click to add one or more gallery images
              </span>
              <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB each</span>
            </label>

            {galleryPreviews.length > 0 && (
              <div className="add-cake-gallery-grid">
                {galleryPreviews.map((src, index) => (
                  <div className="add-cake-preview" key={index}>
                    <img src={src} alt={`Gallery ${index + 1}`} />
                    <button
                      type="button"
                      className="add-cake-remove-image"
                      onClick={() => handleRemoveGalleryImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="add-cake-checkbox">
            <input
              type="checkbox"
              name="isPopular"
              checked={formData.isPopular}
              onChange={handleChange}
            />
            Mark as Popular
          </label>

          <div className="add-cake-actions">
            <button
              type="button"
              className="add-cake-btn-secondary"
              onClick={() => navigate("/admin/templates")}
            >
              Cancel
            </button>
            <button type="submit" className="add-cake-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Add Template"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AddTemplate;
