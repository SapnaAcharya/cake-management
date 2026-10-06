import { useState, useEffect } from "react";
import { Plus, Search,  Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import cakeService from "../../services/cakeService";
import categoryService from "../../services/categoryService";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [cakes, setCakes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const startItem = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(pageNumber * pageSize, totalCount);

  const fetchCakes = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await cakeService.getCakes(pageNumber, pageSize);

    setCakes(data.items || []);
    setTotalPages(data.totalPages || 0);
    setTotalCount(data.totalCount || 0);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to load cakes. Please try again."
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
        const [cakesData, categoriesData] = await Promise.all([
            cakeService.getCakes(pageNumber, pageSize),
            categoryService.getCategories()
        ]);

        if (!ignore) {
          setCakes(cakesData.items || []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);

          setTotalPages(cakesData.totalPages || 0);
          setTotalCount(cakesData.totalCount || 0);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message || "Failed to load cakes. Please try again."
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
  }, [pageNumber, pageSize]);

  const filteredCakes = cakes.filter((cake) => {
    const matchesSearch = cake.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
        categoryFilter === "all" || cake.categoryId === Number(categoryFilter);

    return matchesSearch && matchesCategory;
});

  const handleEdit = (cake) => {
   navigate(`/admin/cakes/${cake.id}/edit`);
  };

  const handleDelete = async (cake) => {
    const confirmed = window.confirm(`Delete "${cake.name}"? This can't be undone.`);
    if (!confirmed) return;

    try {
      await cakeService.deleteCake(cake.id);
      setCakes((prev) => prev.filter((c) => c.id !== cake.id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete cake.");
    }
  };

  const handlePreviousPage = () => {
  if (pageNumber > 1) {
    setPageNumber(pageNumber - 1);
  }
};

const handleNextPage = () => {
  if (pageNumber < totalPages) {
    setPageNumber(pageNumber + 1);
  }
};

const handlePageChange = (page) => {
  setPageNumber(page);
};

<div className="pagination">

  <button
    className="page-btn"
    aria-label="Previous page"
    onClick={handlePreviousPage}
    disabled={pageNumber === 1}
  >
    <ChevronLeft size={15} />
  </button>

  {Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).map((page) => (
    <button
      key={page}
      className={`page-btn ${
        page === pageNumber ? "active" : ""
      }`}
      onClick={() => handlePageChange(page)}
    >
      {page}
    </button>
  ))}

  <button
    className="page-btn"
    aria-label="Next page"
    onClick={handleNextPage}
    disabled={pageNumber === totalPages}
  >
    <ChevronRight size={15} />
  </button>

</div>

  return (
    <AdminLayout
      title="Manage Cakes"
      subtitle="View, add, edit and delete cakes from your store."
      headerAction={
        <button className="admin-primary-btn"
        onClick={() => navigate("/admin/cakes/add")}
        >
          <Plus size={16} />
          Add New Cake
        </button>
      }
    >
      <div className="manage-cakes-card">
        <div className="manage-cakes-filters">
          <div className="manage-cakes-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search cakes..."
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
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
 </div> 
        {loading && <div className="manage-cakes-status">Loading cakes...</div>}

        {!loading && error && (
          <div className="manage-cakes-status error">
            {error}{" "}
            <button className="retry-link" onClick={fetchCakes}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredCakes.length === 0 && (
          <div className="manage-cakes-status">
            {search ? "No cakes match your search." : "No cakes yet. Add your first one."}
          </div>
        )}

        {!loading && !error && filteredCakes.length > 0 && (
          <div className="manage-cakes-table-wrap">
            <table className="manage-cakes-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCakes.map((cake, index) => (
                  <tr key={cake.id}>
                    <td>{index + 1}</td>
                    <td>{cake.id}</td>
                    <td>
                      <img src={getImageUrl(cake.imageUrl)} alt={cake.name} className="cake-thumb" />
                    </td>
                    <td className="cake-name">{cake.name}</td>
                    <td>{cake.categoryName}</td>
                    <td>${Number(cake.price).toFixed(2)}</td>
                    <td>{cake.stockQuantity}</td>
                    <td>
                      <span className={`status-pill ${cake.isAvailable ? "available" : "unavailable"}`}>
                            {cake.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="row-action-btn edit"
                          onClick={() => handleEdit(cake)}
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="row-action-btn delete"
                          onClick={() => handleDelete(cake)}
                          aria-label="Delete"
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
            Showing {startItem} to {endItem} of {totalCount} cakes
           </span>
          <div className="pagination">

  <button
    className="page-btn"
    aria-label="Previous page"
    onClick={handlePreviousPage}
    disabled={pageNumber === 1}
  >
    <ChevronLeft size={15} />
  </button>

  {Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).map((page) => (
    <button
      key={page}
      className={`page-btn ${
        page === pageNumber ? "active" : ""
      }`}
      onClick={() => handlePageChange(page)}
    >
      {page}
    </button>
  ))}

  <button
    className="page-btn"
    aria-label="Next page"
    onClick={handleNextPage}
    disabled={pageNumber === totalPages}
  >
    <ChevronRight size={15} />
  </button>

</div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;