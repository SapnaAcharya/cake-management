import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import templateService from "../../services/admintemplateService";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboard.css";

// Your API's `images` field is a flat array of { imageUrl, imageType } rows
// (thumb / preview / gallery), not a flat `imageUrls` array — pull the one we need.
function getThumbUrl(template) {
  const thumb = (template.images || []).find((img) => img.imageType === "thumb");
  return thumb?.imageUrl || null;
}

function AdminTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await templateService.getTemplates();
      console.log("API Response:", data);
      setTemplates(data.items || data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load templates. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await templateService.getTemplates();
        if (!ignore) {
          setTemplates(data.items || data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Failed to load templates. Please try again."
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const categories = [...new Set(templates.map((tpl) => tpl.category).filter(Boolean))];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleEdit = (template) => {
    navigate(`/admin/templates/${template.id}/edit`);
  };

  const handleDelete = async (template) => {
    const confirmed = window.confirm(`Delete "${template.name}"? This can't be undone.`);
    if (!confirmed) return;

    try {
      await templateService.deleteTemplate(template.id);
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete template.");
    }
  };

  return (
    <AdminLayout
      title="Manage Templates"
      subtitle="View, add, edit and delete cake templates shown on the storefront."
      headerAction={
        <button
          className="admin-primary-btn"
          onClick={() => navigate("/admin/templates/add")}
        >
          <Plus size={16} />
          Add New Template
        </button>
      }
    >
      <div className="manage-cakes-card">
        <div className="manage-cakes-filters">
          <div className="manage-cakes-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        <select
  className="category-filter-select"
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
>
  <option value="all">All Categories</option>
  {categories.map((category) => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>
        </div>

        {loading && <div className="manage-cakes-status">Loading templates...</div>}

        {!loading && error && (
          <div className="manage-cakes-status error">
            {error}{" "}
            <button className="retry-link" onClick={fetchTemplates}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="manage-cakes-status">
            {search ? "No templates match your search." : "No templates yet. Add your first one."}
          </div>
        )}

        {!loading && !error && filteredTemplates.length > 0 && (
          <div className="manage-cakes-table-wrap">
            <table className="manage-cakes-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Tiers</th>
                  <th>Base Price</th>
                  <th>Popular</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
  {filteredTemplates.map((template, index) => (
    <tr key={template.id}>
      <td>{index + 1}</td>

      <td>{template.id}</td>

      <td>
        {getThumbUrl(template) ? (
          <img
            src={getThumbUrl(template)}
            alt={template.name}
            className="cake-thumb"
          />
        ) : (
          <div className="cake-thumb cake-thumb-placeholder">
            No Image
          </div>
        )}
      </td>

      <td>{template.name}</td>

      <td>{template.category}</td>

      <td>{template.tiers}</td>
      <td>${Number(template.basePrice).toFixed(2)}</td>
      <td>
        <span
          className={`status-pill ${
            template.isPopular
              ? "available"
              : "unavailable"
          }`}
        >
          {template.isPopular ? "Popular" : "Standard"}
        </span>
      </td>

      <td>
        <div className="row-actions">
          <button
            className="row-action-btn edit"
            onClick={() => handleEdit(template)}
          >
            <Pencil size={14} />
          </button>

          <button
            className="row-action-btn delete"
            onClick={() => handleDelete(template)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}

        <div className="manage-cakes-footer">
          <span>
            Showing 1 to {filteredTemplates.length} of {templates.length} templates
          </span>
          <div className="pagination">
            <button className="page-btn" aria-label="Previous page">
              <ChevronLeft size={15} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn" aria-label="Next page">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminTemplates;
