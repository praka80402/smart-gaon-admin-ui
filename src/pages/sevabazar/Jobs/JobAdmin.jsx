import React, { useEffect, useState } from "react";
import axios from "axios";

import "./jobAdmin.css";

const JobAdmin = () => {

  const [jobs, setJobs] = useState([]);

  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // Load jobs
  useEffect(() => {
    fetchJobs();
  }, [page]);

  // ================= FETCH JOBS =================
  const fetchJobs = async () => {

    setLoading(true);

    try {

      const res = await axios.get(
        `https://smartgaonadmin.duckdns.org/api/admin/jobs?page=${page}&size=${size}`
      );

      const jobsData = res.data.content;

      // Fetch report count for each job
      const jobsWithCount = await Promise.all(
        jobsData.map(async (job) => {

          const countRes = await axios.get(
            `https://smartgaonadmin.duckdns.org/api/admin/jobs/${job.jobId}/reports/count`
          );

          return {
            ...job,
            reportCount: countRes.data
          };
        })
      );

      setJobs(jobsWithCount);
      setTotalPages(res.data.totalPages);

    } catch (error) {
      console.error("Error loading jobs:", error);
      alert("Failed to load jobs");

    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH REPORTS =================
  const fetchReports = async (jobId) => {

    try {

      const res = await axios.get(
        `https://smartgaonadmin.duckdns.org/api/admin/jobs/${jobId}/reports?page=0&size=10`
      );

      setReports(res.data.content);
      setSelectedJobId(jobId);
      setShowModal(true);

    } catch (error) {

      console.error("Report API Error:", error);
      alert("Failed to load reports");
    }
  };

  // ================= DELETE JOB =================
  const deleteJob = async (jobId) => {

    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {

      await axios.delete(
        `https://smartgaonadmin.duckdns.org/api/admin/jobs/${jobId}`
      );

      alert("Job deleted successfully");

      fetchJobs();

    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete job");
    }
  };

  return (

    <div className="job-admin-container">

      <h2>Job Management</h2>

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center" }}>Loading...</p>
      )}

      {/* ================= TABLE ================= */}
      <table className="job-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Employer</th>
            <th>Reports</th>
            <th>Delete</th>
            <th>Report</th>
          </tr>
        </thead>

        <tbody>

          {!loading && jobs.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No Jobs Found
              </td>
            </tr>
          )}

          {jobs.map((job) => (

            <tr key={job.jobId}>

              <td>{job.jobId}</td>
              <td>{job.title}</td>
              <td>{job.employerId}</td>

              <td>{job.reportCount}</td>

              {/* Delete */}
              <td>
                <button
                  className="delete-btn"
                  onClick={() => deleteJob(job.jobId)}
                >
                  Delete
                </button>
              </td>

              {/* Report Details */}
              <td>
                <button
                  className="view-btn"
                  onClick={() => fetchReports(job.jobId)}
                >
                  Report Details
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

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

            <h3>Reports - Job #{selectedJobId}</h3>

            {/* Close Button */}
            <button
              className="close-btn"
              title="Close"
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

                    {/* ✅ SHOW USER NAME */}
                    <td>{r.reporterName || "Unknown"}</td>

                    <td>{r.reason}</td>

                    <td>{r.customReason || "-"}</td>

                    <td>
                      {new Date(r.reportedAt).toLocaleString()}
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

export default JobAdmin;
