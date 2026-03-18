import React, { useEffect, useState } from "react";
import { getAllJobs, deleteJob } from "./jobApi";

const PrivateJobsList = () => {

  const [jobs, setJobs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const data = await getAllJobs();
    if (!data) return;

    const privateJobs = data.filter((job) => job.jobType === "PRIVATE");
    setJobs(privateJobs);
  };

  const handleDelete = async (id) => {
    await deleteJob(id);
    loadJobs();
  };

  const toggleView = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getShortText = (text, id) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= 3) return text;

    return expandedId === id
      ? text
      : words.slice(0, 3).join(" ") + "...";
  };

  return (
    <div style={{ padding: "20px", background: "#f4f6f9" }}>

      <h3 style={{ marginBottom: "10px" }}>Private Jobs</h3>

      {jobs.length === 0 ? (
        <p>No Private Jobs Found</p>
      ) : (
        <div style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "15px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>

            <thead>
              <tr style={{ background: "#2e7d32", color: "#fff" }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Company</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: "1px solid #eee" }}>

                  <td style={tdStyle}>{job.title}</td>
                  <td style={tdStyle}>{job.companyName}</td>

                  <td style={tdStyle}>
                    {getShortText(job.description, job.id)}
                    {job.description?.split(" ").length > 3 && (
                      <span
                        onClick={() => toggleView(job.id)}
                        style={{ color: "#007bff", cursor: "pointer", marginLeft: "5px" }}
                      >
                        {expandedId === job.id ? "view less" : "view more"}
                      </span>
                    )}
                  </td>

                  <td style={tdStyle}>{job.location}</td>

                  <td style={tdStyle}>
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      style={{ color: "#007bff", marginRight: "10px" }}
                    >
                      Apply
                    </a>

                    <button
                      onClick={() => handleDelete(job.id)}
                      style={{
                        background: "#ff4d4d",
                        color: "#fff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "5px"
                      }}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "10px",
  textAlign: "left"
};

const tdStyle = {
  padding: "10px",
  fontSize: "14px"
};

export default PrivateJobsList;