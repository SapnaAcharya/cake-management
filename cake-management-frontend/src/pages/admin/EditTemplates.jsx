import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import templateService from "../../services/admintemplateService";
import "../../styles/AddCake.css";

const CATEGORY_SUGGESTIONS = [
  "Birthday", "Chocolate", "Wedding", "Kids", "Graduation", "Anniversary",
  "Floral", "Macaron", "Cartoon", "Rustic", "Heart Shape", "Rainbow",
  "Ocean Theme", "Minimalist", "Fruits",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function EditTemplate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tiers: "",
    basePrice: "",
    isPopular: false,
    minPrepHours: "",
    maxPrepHours: "",
    sizes: "",
    features: "",
  });

  const [colors, setColors] = useState([{ colorName: "", colorHex: "#ffffff" }]);

  const [existingThumb, setExistingThumb] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [existingPreviewImg, setExistingPreviewImg] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewPreview, setPreviewPreview] = useState(null);

  // Existing gallery rows keep their imageUrl; new ones are files with previews
  const [existingGallery, setExistingGallery] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const tpl = await templateService.getTemplateById(id);

        setFormData({
          name: tpl.name || "",
          description: tpl.description || "",
          category: tpl.category || "",
          tiers: tpl.tiers ?? "",
          basePrice: tpl.basePrice ?? "",
          isPopular: tpl.isPopular ?? false,
          minPrepHours: tpl.minPrepHours ?? "",
          maxPrepHours: tpl.maxPrepHours ?? "",
          sizes: (tpl.sizes || []).map((s) => s.sizeInInches).join(", "),
          features: (tpl.features || []).map((f) => f.featureName).join(", "),
        });

        const loadedColors = (tpl.colors || []).map((c) => ({
          colorName: c.colorName || "",
          colorHex: c.colorHex || "#ffffff",
        }));
        setColors(loadedColors.length > 0 ? loadedColors : [{ colorName: "", colorHex: "#ffffff" }]);

        const images = tpl.images || [];
        setExistingThumb(images.find((img) => img.imageType === "thumb")?.imageUrl || null);
        setExistingPreviewImg(images.find((img) => img.imageType === "preview")?.imageUrl || null);
        setExistingGallery(
          images.filter((img) => img.imageType === "gallery").map((img) => img.imageUrl)
        );
      } catch {
        setError("Failed to load template details.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

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

  const handleRemoveNewGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingGalleryImage = (index) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

      // Images: only send a new file if the admin replaced it; otherwise
      // the backend should keep the existing one for that image type.
      if (thumbFile) payload.append("thumbImage", thumbFile);
      if (previewFile) payload.append("previewImage", previewFile);
      galleryFiles.forEach((file) => payload.append("galleryImages", file));

      // Remaining existing gallery URLs (after any removals), so the
      // backend knows which previously-uploaded images to keep.
      existingGallery.forEach((url) => payload.append("existingGallery", url));

      await templateService.updateTemplate(id, payload);
      navigate("/admin/templates");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update template.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout title="Edit Template" subtitle="Loading template details...">
        <div className="add-cake-card">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Template" subtitle="Update this template's details.">
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
              <label>Category</label>
              <input
                type="text"
                name="category"
                list="category-suggestions"
                value={formData.category}
                onChange={handleChange}
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
            {thumbPreview ? (
              <div className="add-cake-preview">
                <img src={thumbPreview} alt="New thumbnail preview" />
                <button
                  type="button"
                  className="add-cake-remove-image"
                  onClick={() => {
                    setThumbFile(null);
                    setThumbPreview(null);
                  }}
                >
                  Cancel new image
                </button>
              </div>
            ) : existingThumb ? (
              <div className="add-cake-preview">
                <img src={existingThumb} alt="Current thumbnail" />
                <label
                  className="add-cake-btn-secondary"
                  style={{ cursor: "pointer", display: "inline-block", marginTop: "8px" }}
                >
                  Replace Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbChange}
                    hidden
                  />
                </label>
              </div>
            ) : (
              <label className="add-cake-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbChange}
                  hidden
                />
                <span className="dropzone-text">Click to choose a thumbnail image</span>
                <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB</span>
              </label>
            )}
          </div>

          <div className="add-cake-field">
            <label>Preview Image (used on the customize page)</label>
            {previewPreview ? (
              <div className="add-cake-preview">
                <img src={previewPreview} alt="New preview" />
                <button
                  type="button"
                  className="add-cake-remove-image"
                  onClick={() => {
                    setPreviewFile(null);
                    setPreviewPreview(null);
                  }}
                >
                  Cancel new image
                </button>
              </div>
            ) : existingPreviewImg ? (
              <div className="add-cake-preview">
                <img src={existingPreviewImg} alt="Current preview" />
                <label
                  className="add-cake-btn-secondary"
                  style={{ cursor: "pointer", display: "inline-block", marginTop: "8px" }}
                >
                  Replace Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePreviewImageChange}
                    hidden
                  />
                </label>
              </div>
            ) : (
              <label className="add-cake-dropzone">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePreviewImageChange}
                  hidden
                />
                <span className="dropzone-text">Click to choose a preview image</span>
                <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB</span>
              </label>
            )}
          </div>

          <div className="add-cake-field">
            <label>Gallery Images</label>

            {existingGallery.length > 0 && (
              <div className="add-cake-gallery-grid">
                {existingGallery.map((url, index) => (
                  <div className="add-cake-preview" key={`existing-${index}`}>
                    <img src={url} alt={`Gallery ${index + 1}`} />
                    <button
                      type="button"
                      className="add-cake-remove-image"
                      onClick={() => handleRemoveExistingGalleryImage(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="add-cake-dropzone">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryChange}
                multiple
                hidden
              />
              <span className="dropzone-text">Click to add more gallery images</span>
              <span className="dropzone-hint">JPG, PNG or WEBP — up to 5MB each</span>
            </label>

            {galleryPreviews.length > 0 && (
              <div className="add-cake-gallery-grid">
                {galleryPreviews.map((src, index) => (
                  <div className="add-cake-preview" key={`new-${index}`}>
                    <img src={src} alt={`New gallery ${index + 1}`} />
                    <button
                      type="button"
                      className="add-cake-remove-image"
                      onClick={() => handleRemoveNewGalleryImage(index)}
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
              {loading ? "Saving..." : "Update Template"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default EditTemplate;

