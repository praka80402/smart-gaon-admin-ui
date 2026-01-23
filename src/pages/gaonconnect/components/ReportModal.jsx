import React from "react";
import "./forum.css";

const ReportModal = ({ reports = [], onClose }) => {
  return (
    <div className="gc-modal-overlay">
      <div className="gc-modal">
        <h3>Post Reports</h3>

        <table className="gc-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Reason</th>
              <th>Custom Reason</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.reportId}>
                  <td>
                    <b>{r.reportedByUserName}</b>
                    <div className="gc-muted">
                      ID: {r.reportedByUserId}
                    </div>
                  </td>
                  <td>
                    <span className="gc-report-reason">
                      {r.reason}
                    </span>
                  </td>
                  <td>{r.customReason || "—"}</td>
                  <td>
                    {r.reportedAt
                      ? new Date(r.reportedAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button className="gc-btn-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
