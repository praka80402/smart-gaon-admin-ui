// import React from "react";
// import "./forum.css";

// const ReportModal = ({ reports, onClose }) => {
//   const safeReports = Array.isArray(reports) ? reports : [];

//   return (
//     <div className="gc-modal-overlay">
//       <div className="gc-modal">
//         <div className="gc-modal-header">
//           <h3>Post Reports</h3>
//           <button className="gc-modal-close-icon" onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         <table className="gc-table">
//           <thead>
//             <tr>
//               <th>User</th>
//               <th>Reason</th>
//               <th>Custom Reason</th>
//               <th>Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {safeReports.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="gc-empty">
//                   No reports found
//                 </td>
//               </tr>
//             ) : (
//               safeReports.map((r) => (
//                 <tr key={r.reportId}>
//                   <td>
//                     {/* If backend sends name later, it will auto work */}
//                     {r.reportedByUserName || `User #${r.reportedByUserId}`}
//                   </td>
//                   <td>
//                     <span className="gc-report-reason">{r.reason}</span>
//                   </td>
//                   <td>{r.customReason || "—"}</td>
//                   <td>
//                     {r.reportedAt
//                       ? new Date(r.reportedAt).toLocaleString()
//                       : "—"}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>

//         <div className="gc-modal-footer">
//           <button className="gc-btn-close" onClick={onClose}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportModal;


import React from "react";
import "./forum.css";

const ReportModal = ({ reports, onClose }) => {

  if (!Array.isArray(reports)) {
    return (
      <div className="gc-modal-overlay">
        <div className="gc-modal">
          <h3>Post Reports</h3>
          <p style={{ textAlign: "center" }}>No reports found</p>
          <button className="gc-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gc-modal-overlay">
      <div className="gc-modal">
        <h3>Post Reports</h3>

        <table className="gc-table">
          <thead>
            <tr>
              <th>User ID</th>
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
                  <td>{r.reportedByUserId}</td>
                  <td>{r.reason}</td>
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

