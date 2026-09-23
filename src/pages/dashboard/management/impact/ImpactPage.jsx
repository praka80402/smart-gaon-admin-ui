import React, { useState, useEffect } from "react";
import "./impact.css";
import {
  getImpactData,
  addState,
  updateState,
  deleteState,
} from "./impact.service";

const ImpactPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stateName, setStateName] = useState("");
  const [count, setCount] = useState("");
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = data.filter((item) =>
    item.stateName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = (search ? filteredData : data).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 Fetch data
  const loadData = async () => {
    try {
      const res = await getImpactData();
      setData(res || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Add / Update
  const handleSubmit = async () => {
    if (!stateName || !count) {
      alert("Fill all fields");
      return;
    }

    const payload = {
      stateName,
      count: Number(count),
    };

    try {
      if (editId) {
        await updateState(editId, payload);
      } else {
        await addState(payload);
      }

      await loadData();

      setStateName("");
      setCount("");
      setEditId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  // 🔹 Edit
  const handleEdit = (item) => {
    setStateName(item.stateName);
    setCount(item.count);
    setEditId(item.id);
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this state?")) return;

    await deleteState(id);
    loadData();
  };

  return (
    <div className="impact-container">
      <h2>Gaon Talent Competition</h2>

      <div className="impact-main-card">

        {/* 🔹 STATS */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>{data.length}</h3>
            <p>Total States</p>
          </div>

          <div className="stat-card">
            <h3>
              {data.reduce((sum, item) => sum + (item.count || 0), 0)}
            </h3>
            <p>Total Villages</p>
          </div>
        </div>

       {/* 🔹 TOP ACTIONS */}
       <div className="table-header-actions">
         <div className="search-wrapper">
           <svg
             className="search-icon"
             width="16"
             height="16"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
           >
             <circle cx="11" cy="11" r="8" />
             <line x1="21" y1="21" x2="16.65" y2="16.65" />
           </svg>
           <input
             type="text"
             placeholder="Search state..."
             value={search}
             onChange={(e) => {
               setSearch(e.target.value);
               setCurrentPage(1);
             }}
             className="search-input"
           />
           {search && (
             <button
               type="button"
               className="search-clear-btn"
               onClick={() => setSearch("")}
               title="Clear search"
             >
               ✕
             </button>
           )}
         </div>

         <button
           type="button"
           className="add-btn"
           onClick={() => {
             setStateName("");
             setCount("");
             setEditId(null);
             setIsModalOpen(true);
           }}
         >
           <span className="add-btn-icon">
             <svg
               width="14"
               height="14"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2.5"
               strokeLinecap="round"
               strokeLinejoin="round"
             >
               <line x1="12" y1="5" x2="12" y2="19" />
               <line x1="5" y1="12" x2="19" y2="12" />
             </svg>
           </span>
           <span>Add State</span>
         </button>
       </div>

        {/* 🔹 TABLE */}
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <>
            <div className="impact-table-container">
              <table className="impact-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Village Count</th>
                    <th>Status</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.map((item) => (
                    <tr key={item.id || item.stateName}>
                      <td>
                        <div className="state-info">
                          <div className="state-avatar">
                            {item.stateName.charAt(0)}
                          </div>
                          <span>{item.stateName}</span>
                        </div>
                      </td>

                      <td>{item.count}</td>

                      <td>
                        <span className="badge active">Active</span>
                      </td>

                      <td>
                        <div className="impact-actions-cell">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => {
                              handleEdit(item);
                              setIsModalOpen(true);
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => handleDelete(item.id)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 🔹 PAGINATION */}
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </button>

              <span>Page {currentPage}</span>

              <button
                disabled={
                  currentPage * itemsPerPage >=
                  (search ? filteredData.length : data.length)
                }
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🔹 MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <span className="modal-icon-badge">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <h3>{editId ? "Edit State" : "Add New State"}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form
              className="modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="modal-form-group">
                <label>
                  State Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Uttar Pradesh"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="modal-form-group">
                <label>
                  Village Count <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 150"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  {editId ? "Update State" : "Add State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ImpactPage;