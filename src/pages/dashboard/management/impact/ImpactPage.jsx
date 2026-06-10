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

  <button
    className="add-btn"
    onClick={() => {
      setStateName("");
      setCount("");
      setEditId(null);
      setIsModalOpen(true);
    }}
  >
    + Add State
  </button>

  <input
    type="text"
    placeholder="Search state..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="search-input"
  />

</div>

        {/* 🔹 TABLE */}
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <>
            <table className="impact-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Village Count</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                      <button
                        className="edit-btn"
                        onClick={() => {
                          handleEdit(item);
                          setIsModalOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editId ? "Edit State" : "Add State"}</h3>

            <input
              type="text"
              placeholder="State Name"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Village Count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={handleSubmit}>
                {editId ? "Update" : "Add"}
              </button>

              <button onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ImpactPage;