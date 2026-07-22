import React, { useEffect, useState } from "react";
import axios from "axios";
import "./businessAdmin.css";

 const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin/business";
//const BASE_URL = "http://localhost:9090/api/admin/business";

const BusinessAdmin = () => {

  const role = localStorage.getItem("adminRole");
  const token = localStorage.getItem("adminToken");

  const canManage =
    role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const authHeader = {
    headers: {
      Authorization: "Bearer " + token,
    },
  };

  const [businesses, setBusinesses] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, [page]);

  // ================= FETCH BUSINESSES =================
  const fetchBusinesses = async () => {

    setLoading(true);

    try {
      const res = await axios.get(
        `${BASE_URL}?page=${page}&size=${size}`,
        authHeader
      );

      setBusinesses(res.data.content);
      setTotalPages(res.data.totalPages);

    } catch (error) {
      alert("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH REPORTS =================
  const fetchReports = async (id) => {

    try {
      const res = await axios.get(
        `${BASE_URL}/${id}/reports`,
        authHeader
      );

      setReports(res.data);
      setSelectedId(id);
      setShowModal(true);

    } catch (error) {
      alert("Failed to load reports");
    }
  };

  // ================= DELETE =================
  const deleteBusiness = async (id) => {

    if (!canManage) return;

    if (!window.confirm("Are you sure you want to delete this business?")) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/${id}`, authHeader);
      fetchBusinesses();
    } catch (error) {
      alert("Delete failed");
    }
  };

  // ================= CARD STYLE HELPERS =================
  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB");
  };

  const isOpenStatus = (status) => {
    const s = (status || "").toUpperCase();
    return s === "ACTIVE" || s === "OPEN" || s === "APPROVED";
  };

  return (
    <div className="job-admin-container">

      <h2>Business Management</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      <div className="job-list-header">
        <span>Status</span>
        <span>Business Details</span>
        <span>Created At</span>
        <span>Description</span>
        <span>Location</span>
        <span>Budget</span>
        <span>Reports</span>
        <span>Actions</span>
      </div>

      {!loading && businesses.length === 0 && (
        <div className="job-empty">No Businesses Found</div>
      )}

      <div className="job-card-list">
        {businesses.map((b) => {
          const open = isOpenStatus(b.status);
          return (
            <div className="job-card" key={b.businessId}>

              <div className="job-col job-col-status">
                <span className={`status-pill ${open ? "open" : "closed"}`}>
                  <span className="status-dot" />
                  {b.status || "N/A"}
                </span>
              </div>

              <div className="job-col job-col-details">
                <div className="job-icon-avatar">
                  <span>🏢</span>
                </div>
                <div>
                  <p className="job-title">{b.title}</p>
                  <span className="job-tag">User #{b.userId ?? "N/A"}</span>
                </div>
              </div>

              <div className="job-col job-col-timeline">
                <span className="timeline-icon">📅</span>
                <div>
                  <div className="timeline-label">Created</div>
                  <div className="timeline-end">
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                  </div>
                </div>
              </div>

              <div className="job-col job-col-desc">
                {b.description || "-"}
              </div>

              <div className="job-col job-col-location">
                <span className="location-pill">{b.location || "ALL"}</span>
              </div>

              <div className="job-col job-col-salary">
                {b.budget || "—"}
              </div>

              <div className="job-col job-col-reports">
                <span className="reports-pill">
                  <span className="reports-icon">🚩</span>
                  {b.reportCount}
                </span>
              </div>

              <div className="job-col job-col-actions">
                <button
                  className="view-btn"
                  onClick={() => fetchReports(b.businessId)}
                >
                  Report Details
                </button>

                {canManage && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteBusiness(b.businessId)}
                  >
                    Delete
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="pagination">

        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>

      </div>

      {/* ================= REPORT MODAL ================= */}
      {showModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <h3>Reports - Business #{selectedId}</h3>

            <button
              className="close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <table className="job-table">

              <thead>
                <tr>
                  <th>Reporter Name</th>
                  <th>Reason</th>
                  <th>Custom Reason</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {reports.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No Reports
                    </td>
                  </tr>
                )}

                {reports.map((r, index) => (
                  <tr key={index}>
                    <td>{r.reporterName || "Unknown"}</td>
                    <td>{r.reason}</td>
                    <td>{r.customReason || "-"}</td>
                    <td>
                      {r.reportedAt
                        ? new Date(r.reportedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
};

export default BusinessAdmin;
