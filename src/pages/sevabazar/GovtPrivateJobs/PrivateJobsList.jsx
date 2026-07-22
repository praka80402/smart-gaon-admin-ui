import React, { useEffect, useState } from "react";
import { getAllJobs, deleteJob } from "./jobApi";
import "./privateJobs.css";

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
    <div className="private-jobs-page">

      <h3 className="private-jobs-title">Private Jobs</h3>

      {jobs.length === 0 ? (
        <p className="private-jobs-empty">No Private Jobs Found</p>
      ) : (
        <div className="private-jobs-card">

          <table className="private-jobs-table">

            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Description</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>

                  <td>{job.title}</td>
                  <td>{job.companyName}</td>

                  <td>
                    {getShortText(job.description, job.id)}
                    {job.description?.split(" ").length > 3 && (
                      <span
                        onClick={() => toggleView(job.id)}
                        className="private-view-more"
                      >
                        {expandedId === job.id ? "view less" : "View more"}
                      </span>
                    )}
                  </td>

                  <td>{job.location}</td>

                  <td className="private-action-cell">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="private-apply-link"
                    >
                      Apply
                    </a>

                    <button
                      onClick={() => handleDelete(job.id)}
                      className="private-delete-btn"
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

export default PrivateJobsList;
