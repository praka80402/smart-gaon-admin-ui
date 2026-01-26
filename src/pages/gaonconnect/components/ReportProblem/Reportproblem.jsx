import React, { useEffect, useState } from "react";
import axios from "axios";
import "./problem.css"; // Create this file

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const BASE_URL = "http://localhost:9090";

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/problems`);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${BASE_URL}/api/admin/problems/${id}/status`,
        { status }
      );
      fetchProblems();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const deleteProblem = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/admin/problems/${id}`);
      fetchProblems();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const toggleDesc = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="problem-container">

      <h1 className="problem-title">Problem Reports</h1>

      <div className="problem-table-wrapper">

        <table className="problem-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Title</th>
              <th>Description</th>
              <th>Location</th>
              <th>Status</th>
              <th>Media</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {problems.map((item) => {
              const expanded = expandedId === item.reportId;

              return (
                <tr key={item.reportId}>

                  <td>{item.reportId}</td>
                  <td>{item.category}</td>
                  <td>{item.title}</td>

                  <td>
                    <div
                      className={
                        expanded
                          ? "desc-full"
                          : "desc-short"
                      }
                    >
                      {item.description}
                    </div>

                    <button
                      className="view-btn"
                      onClick={() => toggleDesc(item.reportId)}
                    >
                      {expanded ? "View Less" : "View More"}
                    </button>
                  </td>

                  <td>{item.location}</td>

                  <td>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(item.reportId, e.target.value)
                      }
                      className="status-select"
                    >
                      <option>Submitted</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Closed</option>
                    </select>
                  </td>

                  <td>
                    <div className="media-box">
                      {item.mediaAttachments?.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="media"
                        />
                      ))}
                    </div>
                  </td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteProblem(item.reportId)
                      }
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              );
            })}

            {problems.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">
                  No reports found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}
