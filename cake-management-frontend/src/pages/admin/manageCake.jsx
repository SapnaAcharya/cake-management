// import { useState, useEffect } from "react";
// import { Plus, Search,  Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
// import AdminLayout from "../../layouts/AdminLayout";
// import cakeService from "../../services/cakeService";
// import categoryService from "../../services/categoryService";
// import { useNavigate } from "react-router-dom";
// import { getImageUrl } from "../../utils/imageUrl";
// import "../../styles/AdminDashboard.css";

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const [cakes, setCakes] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [categories, setCategories] = useState([]);
//   const [categoryFilter, setCategoryFilter] = useState("all");

//   const [pageNumber, setPageNumber] = useState(1);
//   const pageSize = 10;
//   const [totalPages, setTotalPages] = useState(0);
//   const [totalCount, setTotalCount] = useState(0);
//   const startItem = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
//   const endItem = Math.min(pageNumber * pageSize, totalCount);

//   const fetchCakes = async () => {
//   setLoading(true);
//   setError("");

//   try {
//     const data = await cakeService.getCakes(pageNumber, pageSize);

//     setCakes(data.items || []);
//     setTotalPages(data.totalPages || 0);
//     setTotalCount(data.totalItems || 0);
//   } catch (err) {
//     setError(
//       err.response?.data?.message ||
//         "Failed to load cakes. Please try again."
//     );
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     let ignore = false;

//     const load = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const [cakesData, categoriesData] = await Promise.all([
//             cakeService.getCakes(pageNumber, pageSize),
//             categoryService.getCategories()
//         ]);

//         if (!ignore) {
//           setCakes(cakesData.items || []);
//           setCategories(Array.isArray(categoriesData) ? categoriesData : []);

//           setTotalPages(cakesData.totalPages || 0);
//           setTotalCount(cakesData.totalCount || 0);
//         }
//       } catch (err) {
//         if (!ignore) {
//           setError(
//             err.response?.data?.message || "Failed to load cakes. Please try again."
//           );
//         }
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     };

//     load();
//     return () => {
//       ignore = true;
//     };
//   }, [pageNumber, pageSize]);

//   const filteredCakes = cakes.filter((cake) => {
//     const matchesSearch = cake.name.toLowerCase().includes(search.toLowerCase());
//     const matchesCategory =
//         categoryFilter === "all" || cake.categoryId === Number(categoryFilter);

//     return matchesSearch && matchesCategory;
// });

//   const handleEdit = (cake) => {
//    navigate(`/admin/cakes/${cake.id}/edit`);
//   };

//   const handleDelete = async (cake) => {
//     const confirmed = window.confirm(`Delete "${cake.name}"? This can't be undone.`);
//     if (!confirmed) return;

//     try {
//       await cakeService.deleteCake(cake.id);
//       setCakes((prev) => prev.filter((c) => c.id !== cake.id));
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to delete cake.");
//     }
//   };

//   const handlePreviousPage = () => {
//   if (pageNumber > 1) {
//     setPageNumber(pageNumber - 1);
//   }
// };

// const handleNextPage = () => {
//   if (pageNumber < totalPages) {
//     setPageNumber(pageNumber + 1);
//   }
// };

// const handlePageChange = (page) => {
//   setPageNumber(page);
// };

// {/* <div className="pagination">

//   <button
//     className="page-btn"
//     aria-label="Previous page"
//     onClick={handlePreviousPage}
//     disabled={pageNumber === 1}
//   >
//     <ChevronLeft size={15} />
//   </button>

//   {Array.from(
//     { length: totalPages },
//     (_, index) => index + 1
//   ).map((page) => (
//     <button
//       key={page}
//       className={`page-btn ${
//         page === pageNumber ? "active" : ""
//       }`}
//       onClick={() => handlePageChange(page)}
//     >
//       {page}
//     </button>
//   ))}

//   <button
//     className="page-btn"
//     aria-label="Next page"
//     onClick={handleNextPage}
//     disabled={pageNumber === totalPages}
//   >
//     <ChevronRight size={15} />
//   </button>

// </div> */}

//   return (
//     <AdminLayout
//       title="Manage Cakes"
//       subtitle="View, add, edit and delete cakes from your store."
//       headerAction={
//         <button className="admin-primary-btn"
//         onClick={() => navigate("/admin/cakes/add")}
//         >
//           <Plus size={16} />
//           Add New Cake
//         </button>
//       }
//     >
//       <div className="manage-cakes-card">
//         <div className="manage-cakes-filters">
//           <div className="manage-cakes-search">
//             <Search size={16} />
//             <input
//               type="text"
//               placeholder="Search cakes..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
         
//           <select
//   className="category-filter-select"
//   value={categoryFilter}
//   onChange={(e) => setCategoryFilter(e.target.value)}
// >
//   <option value="all">All Categories</option>
//   {categories.map((cat) => (
//     <option key={cat.id} value={cat.id}>
//       {cat.name}
//     </option>
//   ))}
// </select>
//  </div> 
//         {loading && <div className="manage-cakes-status">Loading cakes...</div>}

//         {!loading && error && (
//           <div className="manage-cakes-status error">
//             {error}{" "}
//             <button className="retry-link" onClick={fetchCakes}>
//               Retry
//             </button>
//           </div>
//         )}

//         {!loading && !error && filteredCakes.length === 0 && (
//           <div className="manage-cakes-status">
//             {search ? "No cakes match your search." : "No cakes yet. Add your first one."}
//           </div>
//         )}

//         {!loading && !error && filteredCakes.length > 0 && (
//           <div className="manage-cakes-table-wrap">
//             <table className="manage-cakes-table">
//               <thead>
//                 <tr>
//                   <th>S.N.</th>
//                   <th>ID</th>
//                   <th>Image</th>
//                   <th>Name</th>
//                   <th>Slug</th>
//                   <th>Category</th>
//                   <th>Price</th>
//                   <th>Stock</th>
//                   <th>Personalized Message</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCakes.map((cake, index) => (
//                   <tr key={cake.id}>
//                     <td>{index + 1}</td>
//                     <td>{cake.id}</td>
//                     <td>
//                       <img src={getImageUrl(cake.imageUrl)} alt={cake.name} className="cake-thumb" />
//                     </td>
//                     <td className="cake-name">{cake.name}</td>
//                     <td className="cake-name">{cake.slug}</td>
//                     <td>{cake.categoryName}</td>
                
//                     <td>Rs. {Number(cake.price).toFixed(2)}</td>

// <td>{cake.stockQuantity}</td>

// <td>
//   {cake.allowMessage ? (
//     <div className="cake-message-info">
//       <span className="status-pill available">
//         Enabled
//       </span>
//       <small>
//         Label: {cake.messageLabel || "Personalized Message"}
//       </small>
//       <small className="cake-message-placeholder">
//         Placeholder: {cake.messagePlaceholder || "Enter your message.."}
//       </small>
//       <small>
//         Max: {cake.maxMessageLength} characters
//       </small>
//       <small>
//         + Rs. {Number(cake.messageAdditionalPrice || 0).toFixed(2)}
//       </small>
//     </div>
//   ) : (
//     <span className="status-pill unavailable">
//       Disabled
//     </span>
//   )}
// </td>

// <td>
//   <span className={`status-pill ${cake.isAvailable ? "available" : "unavailable"}`}>
//     {cake.isAvailable ? "Available" : "Unavailable"}
//   </span>
// </td>
//                     <td>
//                       <div className="row-actions">
//                         <button
//                           className="row-action-btn edit"
//                           onClick={() => handleEdit(cake)}
//                           aria-label="Edit"
//                         >
//                           <Pencil size={14} />
//                         </button>
//                         <button
//                           className="row-action-btn delete"
//                           onClick={() => handleDelete(cake)}
//                           aria-label="Delete"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         <div className="manage-cakes-footer">
//           <span>
//             Showing {startItem} to {endItem} of {totalCount} cakes
//            </span>
//           <div className="pagination">

//   <button
//     className="page-btn"
//     aria-label="Previous page"
//     onClick={handlePreviousPage}
//     disabled={pageNumber === 1}
//   >
//     <ChevronLeft size={15} />
//   </button>

//   {Array.from(
//     { length: totalPages },
//     (_, index) => index + 1
//   ).map((page) => (
//     <button
//       key={page}
//       className={`page-btn ${
//         page === pageNumber ? "active" : ""
//       }`}
//       onClick={() => handlePageChange(page)}
//     >
//       {page}
//     </button>
//   ))}

//   <button
//     className="page-btn"
//     aria-label="Next page"
//     onClick={handleNextPage}
//     disabled={pageNumber === totalPages}
//   >
//     <ChevronRight size={15} />
//   </button>

// </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }

// export default AdminDashboard;


import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings2
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import cakeService from "../../services/cakeService";
import categoryService from "../../services/categoryService";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUrl";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // Cakes
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and category filter
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Pagination
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const startItem =
    totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;

  const endItem = Math.min(pageNumber * pageSize, totalCount);

  // Personalized message configuration modal
const [selectedCake, setSelectedCake] = useState(null);
const [showMessageModal, setShowMessageModal] = useState(false);
const [savingMessageSettings, setSavingMessageSettings] = useState(false);

const [messageSettings, setMessageSettings] = useState({
  allowMessage: false,
  messageLabel: "Personalized Message",
  messagePlaceholder: "Enter your message",
  maxMessageLength: 100,
  messageAdditionalPrice: 0
});

  // Fetch cakes
  const fetchCakes = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await cakeService.getCakes(pageNumber, pageSize);

      setCakes(data.items || []);
      setTotalPages(data.totalPages || 0);

      // Backend PaginatedResponseDto uses TotalItems
      setTotalCount(data.totalItems || 0);
    } catch (err) {
      setError(err.message || "Failed to load cakes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load cakes and categories
  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [cakesData, categoriesData] = await Promise.all([
          cakeService.getCakes(pageNumber, pageSize),
          categoryService.getCategories()
        ]);

        if (!ignore) {
          setCakes(cakesData.items || []);
          setTotalPages(cakesData.totalPages || 0);
          setTotalCount(cakesData.totalItems || 0);

          setCategories(
            Array.isArray(categoriesData) ? categoriesData : []
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.message || "Failed to load cakes. Please try again."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [pageNumber]);

  // Search and category filtering
  const filteredCakes = cakes.filter((cake) => {
    const matchesSearch = (cake.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      cake.categoryId === Number(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  // Edit cake
  const handleEdit = (cake) => {
    navigate(`/admin/cakes/${cake.id}/edit`);
  };

  const handleConfigureMessage = (cake) => {
  setSelectedCake(cake);

  setMessageSettings({
    allowMessage: cake.allowMessage ?? false,
    messageLabel: cake.messageLabel || "Personalized Message",
    messagePlaceholder: cake.messagePlaceholder || "Enter your message",
    maxMessageLength: cake.maxMessageLength ?? 100,
    messageAdditionalPrice: cake.messageAdditionalPrice ?? 0
  });

  setShowMessageModal(true);
};

const handleSaveMessageSettings = async (e) => {
  e.preventDefault();

  if (!selectedCake) return;

  const maxLength = Number(messageSettings.maxMessageLength);
  const additionalPrice = Number(messageSettings.messageAdditionalPrice);

  if (
    messageSettings.allowMessage &&
    (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 500)
  ) {
    alert("Maximum message length must be between 1 and 500.");
    return;
  }

  if (
    !Number.isFinite(additionalPrice) ||
    additionalPrice < 0 ||
    additionalPrice > 100000
  ) {
    alert("Additional price must be between 0 and 100000.");
    return;
  }

  if (
    messageSettings.allowMessage &&
    (!messageSettings.messageLabel.trim() ||
      !messageSettings.messagePlaceholder.trim())
  ) {
    alert("Message label and placeholder are required.");
    return;
  }

  setSavingMessageSettings(true);

  try {
    const settings = {
      allowMessage: messageSettings.allowMessage,
      messageLabel: messageSettings.messageLabel.trim(),
      messagePlaceholder: messageSettings.messagePlaceholder.trim(),
      maxMessageLength: maxLength,
      messageAdditionalPrice: additionalPrice
    };

    await cakeService.updateMessageSettings(
      selectedCake.id,
      settings
    );

    // Update the selected cake in the table
    setCakes((prev) =>
      prev.map((cake) =>
        cake.id === selectedCake.id
          ? { ...cake, ...settings }
          : cake
      )
    );

    setShowMessageModal(false);
    setSelectedCake(null);

    alert("Personalized message settings updated successfully.");

  } catch (err) {
    alert(err.message || "Failed to update personalized message settings.");
  } finally {
    setSavingMessageSettings(false);
  }
};

  // Delete cake
  const handleDelete = async (cake) => {
    const confirmed = window.confirm(
      `Delete "${cake.name}"? This can't be undone.`
    );

    if (!confirmed) return;

    try {
      await cakeService.deleteCake(cake.id);

      setCakes((prev) =>
        prev.filter((c) => c.id !== cake.id)
      );

      setTotalCount((prev) => Math.max(0, prev - 1));

      // If the deleted cake was the only item on this page,
      // move to the previous page.
      if (cakes.length === 1 && pageNumber > 1) {
        setPageNumber((prev) => prev - 1);
      }
    } catch (err) {
      alert(err.message || "Failed to delete cake.");
    }
  };

  // Pagination
  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePageChange = (page) => {
    setPageNumber(page);
  };

  return (
    <AdminLayout
      title="Manage Cakes"
      subtitle="View, add, edit and delete cakes from your store."
      headerAction={
        <button
          className="admin-primary-btn"
          onClick={() => navigate("/admin/cakes/add")}
        >
          <Plus size={16} />
          Add New Cake
        </button>
      }
    >
      <div className="manage-cakes-card">

        {/* Search and category filter */}
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

        {/* Loading */}
        {loading && (
          <div className="manage-cakes-status">
            Loading cakes...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="manage-cakes-status error">
            {error}

            <button
              className="retry-link"
              onClick={fetchCakes}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCakes.length === 0 && (
          <div className="manage-cakes-status">
            {search || categoryFilter !== "all"
              ? "No cakes match your search or selected category."
              : "No cakes yet. Add your first one."}
          </div>
        )}

        {/* Cakes table */}
        {!loading && !error && filteredCakes.length > 0 && (
          <div className="manage-cakes-table-wrap">

            <table className="manage-cakes-table">

              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Personalized Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCakes.map((cake, index) => (
                  <tr key={cake.id}>

                    <td>
                      {(pageNumber - 1) * pageSize + index + 1}
                    </td>

                    <td>{cake.id}</td>

                    <td>
                      <img
                        src={getImageUrl(cake.imageUrl)}
                        alt={cake.name}
                        className="cake-thumb"
                      />
                    </td>

                    <td className="cake-name">
                      {cake.name}
                    </td>

                    <td className="cake-name">
                      {cake.slug}
                    </td>

                    <td>{cake.categoryName}</td>

                    <td>
                      Rs. {Number(cake.price).toFixed(2)}
                    </td>

                    <td>{cake.stockQuantity}</td>

                    {/* Personalized message settings */}
                    <td>
                      {cake.allowMessage ? (
                        <div className="cake-message-info">

                          <span className="status-pill available">
                            Enabled
                          </span>

                          <small>
                            Label: {cake.messageLabel || "Personalized Message"}
                          </small>

                          <small className="cake-message-placeholder">
                            Placeholder: {cake.messagePlaceholder || "Enter your message"}
                          </small>

                          <small>
                            Max: {cake.maxMessageLength} characters
                          </small>

                          <small>
                            + Rs. {Number(
                              cake.messageAdditionalPrice || 0
                            ).toFixed(2)}
                          </small>

                        </div>
                      ) : (
                        <span className="status-pill unavailable">
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Cake availability */}
                    <td>
                      <span
                        className={`status-pill ${
                          cake.isAvailable
                            ? "available"
                            : "unavailable"
                        }`}
                      >
                        {cake.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="row-actions">


    {/* Configure personalized message */}
    <button
      className="row-action-btn edit"
      onClick={() => handleConfigureMessage(cake)}
      aria-label="Configure personalized message"
      title="Configure personalized message"
    >
      <Settings2 size={14} />
    </button>

                        <button
                          className="row-action-btn edit"
                          onClick={() => handleEdit(cake)}
                          aria-label="Edit cake"
                          title="Edit cake"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          className="row-action-btn delete"
                          onClick={() => handleDelete(cake)}
                          aria-label="Delete cake"
                          title="Delete cake"
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

        {/* Footer and pagination */}
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
              disabled={pageNumber >= totalPages}
            >
              <ChevronRight size={15} />
            </button>

          </div>
        </div>

      </div>
      
      {/* Personalized Message Configuration Modal */}
      {showMessageModal && selectedCake && (
        <div className="message-modal-overlay">

          <div className="message-modal">

            <div className="message-modal-header">
              <div>
                <h2>Personalized Message Settings</h2>
                <p>
                  Configure message options for {selectedCake.name}
                </p>
              </div>

              <button
                type="button"
                className="message-modal-close"
                onClick={() => setShowMessageModal(false)}
                disabled={savingMessageSettings}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMessageSettings}>

              <div className="message-modal-body">

                {/* Enable / Disable */}
                <label className="message-toggle-row">

                  <div>
                    <strong>Allow Personalized Message</strong>
                    <small>
                      Allow customers to add a custom message to this cake.
                    </small>
                  </div>

                  <input
                    type="checkbox"
                    checked={messageSettings.allowMessage}
                    onChange={(e) =>
                      setMessageSettings((prev) => ({
                        ...prev,
                        allowMessage: e.target.checked
                      }))
                    }
                  />

                </label>

                {messageSettings.allowMessage && (
                  <>

                    {/* Message Label */}
                    <div className="message-form-group">
                      <label>Message Label</label>

                      <input
                        type="text"
                        value={messageSettings.messageLabel}
                        maxLength={100}
                        required
                        onChange={(e) =>
                          setMessageSettings((prev) => ({
                            ...prev,
                            messageLabel: e.target.value
                          }))
                        }
                        placeholder="Example: Write on your cake"
                      />
                    </div>

                    {/* Message Placeholder */}
                    <div className="message-form-group">
                      <label>Message Placeholder</label>

                      <input
                        type="text"
                        value={messageSettings.messagePlaceholder}
                        maxLength={200}
                        required
                        onChange={(e) =>
                          setMessageSettings((prev) => ({
                            ...prev,
                            messagePlaceholder: e.target.value
                          }))
                        }
                        placeholder="Example: Enter birthday wishes..."
                      />
                    </div>

                    {/* Maximum Length and Price */}
                    <div className="message-form-row">

                      <div className="message-form-group">
                        <label>Maximum Characters</label>

                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={messageSettings.maxMessageLength}
                          required
                          onChange={(e) =>
                            setMessageSettings((prev) => ({
                              ...prev,
                              maxMessageLength: e.target.value
                            }))
                          }
                        />
                      </div>

                      <div className="message-form-group">
                        <label>Additional Price (Rs.)</label>

                        <input
                          type="number"
                          min="0"
                          max="100000"
                          step="0.01"
                          value={messageSettings.messageAdditionalPrice}
                          required
                          onChange={(e) =>
                            setMessageSettings((prev) => ({
                              ...prev,
                              messageAdditionalPrice: e.target.value
                            }))
                          }
                        />
                      </div>

                    </div>

                  </>
                )}

                {!messageSettings.allowMessage && (
                  <div className="message-disabled-note">
                    Personalized messages will not be available to
                    customers for this cake.
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="message-modal-footer">

                <button
                  type="button"
                  className="message-cancel-btn"
                  onClick={() => setShowMessageModal(false)}
                  disabled={savingMessageSettings}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="message-save-btn"
                  disabled={savingMessageSettings}
                >
                  {savingMessageSettings
                    ? "Saving..."
                    : "Save Settings"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
