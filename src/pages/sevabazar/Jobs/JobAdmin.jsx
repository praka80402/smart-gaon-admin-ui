// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./jobAdmin.css";

//  const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin";
// //const BASE_URL = "http://localhost:9090/api/admin";
// const JobAdmin = () => {

//   const role = localStorage.getItem("adminRole");
//   const token = localStorage.getItem("adminToken");

//   // ✅ Only SUPER + STATE can delete
//   const canManage =
//     role === "SUPER_ADMIN" || role === "STATE_ADMIN";

//   const authHeader = {
//     headers: {
//       Authorization: "Bearer " + token,
//     },
//   };

//   const [jobs, setJobs] = useState([]);
//   const [page, setPage] = useState(0);
//   const [size] = useState(5);
//   const [totalPages, setTotalPages] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [reports, setReports] = useState([]);
//   const [selectedJobId, setSelectedJobId] = useState(null);

//   useEffect(() => {
//     fetchJobs();
//   }, [page]);

//   // ================= FETCH JOBS =================
//   const fetchJobs = async () => {

//     setLoading(true);

//     try {

//       const res = await axios.get(
//         `${BASE_URL}/jobs?page=${page}&size=${size}`,
//         authHeader
//       );

//       const jobsData = res.data.content;

//       const jobsWithCount = await Promise.all(
//         jobsData.map(async (job) => {

//           const countRes = await axios.get(
//             `${BASE_URL}/jobs/${job.jobId}/reports/count`,
//             authHeader
//           );

//           return {
//             ...job,
//             reportCount: countRes.data
//           };
//         })
//       );

//       setJobs(jobsWithCount);
//       setTotalPages(res.data.totalPages);

//     } catch (error) {
//       console.error("Error loading jobs:", error);
//       alert("Unauthorized or failed to load jobs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= FETCH REPORTS =================
//   const fetchReports = async (jobId) => {

//     try {

//       const res = await axios.get(
//         `${BASE_URL}/jobs/${jobId}/reports?page=0&size=10`,
//         authHeader
//       );

//       setReports(res.data.content);
//       setSelectedJobId(jobId);
//       setShowModal(true);

//     } catch (error) {
//       console.error("Report API Error:", error);
//       alert("Failed to load reports");
//     }
//   };

//   // ================= DELETE JOB =================
//   const deleteJob = async (jobId) => {

//     if (!canManage) return;

//     if (!window.confirm("Are you sure you want to delete this job?")) {
//       return;
//     }

//     try {

//       await axios.delete(
//         `${BASE_URL}/jobs/${jobId}`,
//         authHeader
//       );

//       alert("Job deleted successfully");
//       fetchJobs();

//     } catch (error) {
//       console.error("Delete error:", error);
//       alert("Unauthorized or failed to delete job");
//     }
//   };

//   return (

//     <div className="job-admin-container">

//       <h2>Job Management</h2>

//       {loading && (
//         <p style={{ textAlign: "center" }}>Loading...</p>
//       )}

//       <table className="job-table">

//         {/* <thead>
//           <tr>
//             <th>S.No</th>
//             <th>Title</th>
//             <th>Employer</th>
//             <th>Reports</th>
//             {canManage && <th>Delete</th>}
//             <th>Report</th>
//           </tr>
//         </thead> */}

//         <thead>
//   <tr>
//     <th>ID</th>
//     <th>Title</th>
//     <th>Description</th>
//     <th>Requirements</th>
//     <th>Salary</th>
//     <th>Type</th>
//     <th>Location</th>
//     <th>Contact</th>
//     <th>Deadline</th>
//     <th>Status</th>
//     <th>Created At</th>
//     <th>Posted By</th>
//     <th>Reports</th>
//     {canManage && <th>Delete</th>}
//     <th>Report</th>
//   </tr>
// </thead>

//         {/* <tbody>

//           {!loading && jobs.length === 0 && (
//             <tr>
//               <td colSpan="6" style={{ textAlign: "center" }}>
//                 No Jobs Found
//               </td>
//             </tr>
//           )}

//           {jobs.map((job) => (

//             <tr key={job.jobId}>

//               <td>{job.jobId}</td>
//               <td>{job.title}</td>
//               <td>{job.employerId}</td>
//               <td>{job.reportCount}</td>

//               {canManage && (
//                 <td>
//                   <button
//                     className="delete-btn"
//                     onClick={() => deleteJob(job.jobId)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               )}

//               <td>
//                 <button
//                   className="view-btn"
//                   onClick={() => fetchReports(job.jobId)}
//                 >
//                   Report Details
//                 </button>
//               </td>

//             </tr>
//           ))}

//         </tbody> */}

//         <tbody>

//   {!loading && jobs.length === 0 && (
//     <tr>
//       <td colSpan="15" style={{ textAlign: "center" }}>
//         No Jobs Found
//       </td>
//     </tr>
//   )}

//   {jobs.map((job) => (

//     <tr key={job.jobId}>

//       <td>{job.jobId}</td>
//       <td>{job.title}</td>
//       <td>{job.description}</td>
//       <td>{job.requirements}</td>
//       <td>{job.salaryRange}</td>
//       <td>{job.employmentType}</td>
//       <td>{job.location}</td>
//       <td>{job.contactNumber}</td>
//       <td>{job.deadline}</td>
//       <td>{job.status}</td>
//       <td>
//         {job.createdAt
//           ? new Date(job.createdAt).toLocaleString()
//           : "-"}
//       </td>
//       {/* <td>{job.employerId}</td> */}
//       <td>{job.employerName || "N/A"}</td>
//       <td>{job.reportCount}</td>

//       {canManage && (
//         <td>
//           <button
//             className="delete-btn"
//             onClick={() => deleteJob(job.jobId)}
//           >
//             Delete
//           </button>
//         </td>
//       )}

//       <td>
//         <button
//           className="view-btn"
//           onClick={() => fetchReports(job.jobId)}
//         >
//           Report Details
//         </button>
//       </td>

//     </tr>
//   ))}

// </tbody>

//       </table>

//       {/* ================= PAGINATION ================= */}
//       <div className="pagination">

//         <button
//           disabled={page === 0}
//           onClick={() => setPage(page - 1)}
//         >
//           Prev
//         </button>

//         <span>
//           Page {page + 1} of {totalPages}
//         </span>

//         <button
//           disabled={page + 1 === totalPages}
//           onClick={() => setPage(page + 1)}
//         >
//           Next
//         </button>

//       </div>

//       {/* ================= REPORT MODAL ================= */}
//       {showModal && (

//         <div
//           className="modal-overlay"
//           onClick={() => setShowModal(false)}
//         >

//           <div
//             className="modal-content"
//             onClick={(e) => e.stopPropagation()}
//           >

//             <h3>Reports - Job #{selectedJobId}</h3>

//             <button
//               className="close-btn"
//               onClick={() => setShowModal(false)}
//             >
//               ✕
//             </button>

//             <table className="job-table">

//               <thead>
//                 <tr>
//                   <th>Reporter Name</th>
//                   <th>Reason</th>
//                   <th>Custom Reason</th>
//                   <th>Date</th>
//                 </tr>
//               </thead>

//               <tbody>

//                 {reports.length === 0 && (
//                   <tr>
//                     <td colSpan="4" style={{ textAlign: "center" }}>
//                       No Reports
//                     </td>
//                   </tr>
//                 )}

//                 {reports.map((r, index) => (
//                   <tr key={index}>
//                     <td>{r.reporterName || "Unknown"}</td>
//                     <td>{r.reason}</td>
//                     <td>{r.customReason || "-"}</td>
//                     <td>{new Date(r.reportedAt).toLocaleString()}</td>
//                   </tr>
//                 ))}

//               </tbody>

//             </table>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// };

// export default JobAdmin;


import React, { useEffect, useState } from "react";
import axios from "axios";
import "./jobAdmin.css";

const BASE_URL = "https://smartgaonadmin.duckdns.org/api/admin";

const JobAdmin = () => {
  const role = localStorage.getItem("adminRole");
  const token = localStorage.getItem("adminToken");

  const canManage = role === "SUPER_ADMIN" || role === "STATE_ADMIN";

  const authHeader = {
    headers: { Authorization: "Bearer " + token },
  };

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // ✅ Details modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  // ================= FETCH JOBS =================
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/jobs?page=${page}&size=${size}`,
        authHeader
      );

      const jobsData = res.data.content;

      const jobsWithCount = await Promise.all(
        jobsData.map(async (job) => {
          const countRes = await axios.get(
            `${BASE_URL}/jobs/${job.jobId}/reports/count`,
            authHeader
          );
          return { ...job, reportCount: countRes.data };
        })
      );

      setJobs(jobsWithCount);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      alert("Unauthorized or failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH REPORTS =================
  const fetchReports = async (jobId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/jobs/${jobId}/reports?page=0&size=10`,
        authHeader
      );
      setReports(res.data.content);
      setSelectedJobId(jobId);
      setShowReportModal(true);
    } catch (error) {
      alert("Failed to load reports");
    }
  };

  // ================= DELETE JOB =================
  const deleteJob = async (jobId) => {
    if (!canManage) return;
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`${BASE_URL}/jobs/${jobId}`, authHeader);
      alert("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      alert("Unauthorized or failed to delete job");
    }
  };

  // ================= OPEN DETAIL MODAL =================
  const openDetails = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  return (
    <div className="job-admin-container">
      <h2>Job Management</h2>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      <table className="job-table">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th>Title</th>
            <th>Location</th>
            <th>Type</th>
            <th>Salary</th>
            <th>Status</th>
            <th>Posted By</th>
            <th>Reports</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {!loading && jobs.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No Jobs Found
              </td>
            </tr>
          )}

          {jobs.map((job) => (
            <tr key={job.jobId}>
              {/* <td>{job.jobId}</td> */}
              <td>{job.title}</td>
              <td>{job.location}</td>
              <td>{job.employmentType}</td>
              <td>{job.salaryRange}</td>
              <td>
                <span className={`status-badge ${job.status?.toLowerCase()}`}>
                  {job.status}
                </span>
              </td>
              <td>{job.employerName || "N/A"}</td>
              <td>{job.reportCount}</td>
              <td className="action-cell">
                {/* ✅ View Details Button */}
                <button
                  className="detail-btn"
                  onClick={() => openDetails(job)}
                >
                  Details
                </button>

                {/* Report Details Button */}
                <button
                  className="view-btn"
                  onClick={() => fetchReports(job.jobId)}
                >
                  Reports
                </button>

                {/* Delete Button */}
                {canManage && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteJob(job.jobId)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= PAGINATION ================= */}
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* ================= JOB DETAIL MODAL ================= */}
      {showDetailModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Job Details — #{selectedJob.jobId}</h3>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Title</span>
                <span className="detail-value">{selectedJob.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{selectedJob.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Employment Type</span>
                <span className="detail-value">{selectedJob.employmentType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Salary Range</span>
                <span className="detail-value">{selectedJob.salaryRange}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact</span>
                <span className="detail-value">{selectedJob.contactNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deadline</span>
                <span className="detail-value">{selectedJob.deadline}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">{selectedJob.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created At</span>
                <span className="detail-value">
                  {selectedJob.createdAt
                    ? new Date(selectedJob.createdAt).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Description</span>
                <span className="detail-value">{selectedJob.description}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Requirements</span>
                <span className="detail-value">{selectedJob.requirements}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT MODAL ================= */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reports — Job #{selectedJobId}</h3>
            <button className="close-btn" onClick={() => setShowReportModal(false)}>✕</button>

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
                    <td colSpan="4" style={{ textAlign: "center" }}>No Reports</td>
                  </tr>
                )}
                {reports.map((r, index) => (
                  <tr key={index}>
                    <td>{r.reporterName || "Unknown"}</td>
                    <td>{r.reason}</td>
                    <td>{r.customReason || "-"}</td>
                    <td>{new Date(r.reportedAt).toLocaleString()}</td>
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

export default JobAdmin;