import React, { useEffect, useState } from "react";
//import axios from "axios";
import "./suggestion.css";
import {api} from "../../services/apiConfig"


export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store which row is expanded
  const [expandedId, setExpandedId] = useState(null);


  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await api.get(`/api/admin/suggestions`);
      setSuggestions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(
        `/api/admin/suggestions/${id}/status`,
        { status }
      );

      fetchSuggestions();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteSuggestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`/api/admin/suggestions/${id}`);
      fetchSuggestions();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const toggleDescription = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div className="loading-text">Loading...</div>;
  }

  return (
    <div className="admin-container">

      <h1 className="admin-title">User Suggestions</h1>

      <div className="table-wrapper">

        <table className="admin-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Phone</th>
              <th>Pincode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {suggestions.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <tr key={item.id}>

                  <td>{item.id}</td>
                  <td>{item.title}</td>

                  <td>
                    <div
                      className={
                        isExpanded
                          ? "desc-full"
                          : "desc-cell"
                      }
                    >
                      {item.description}
                    </div>

                    {item.description?.length > 10 && (
                      <button
                        className="view-btn"
                        onClick={() =>
                          toggleDescription(item.id)
                        }
                      >
                        {isExpanded ? "View Less" : "View More"}
                      </button>
                    )}
                  </td>

                  <td>{item.phone}</td>
                  <td>{item.pincode}</td>

                  <td>
                    <select
                      className="status-select"
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(item.id, e.target.value)
                      }
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEW">REVIEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSuggestion(item.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              );
            })}

            {suggestions.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-msg">
                  No suggestions found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}
