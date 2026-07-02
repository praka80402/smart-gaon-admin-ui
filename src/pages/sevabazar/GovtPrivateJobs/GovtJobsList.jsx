import React, { useEffect, useState } from "react";
import { getAllJobs, deleteJob } from "./jobApi";
import "./govtJobs.css";

const GovtJobsList = () => {

  const [jobs, setJobs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const data = await getAllJobs();
    if (!data) return;

    const govtJobs = data.filter((job) => job.jobType === "GOVT");
    setJobs(govtJobs);
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
    <div className="govt-jobs-page">

      <h3 className="govt-jobs-title">Govt Jobs</h3>

      {jobs.length === 0 ? (
        <p className="govt-jobs-empty">No Govt Jobs Found</p>
      ) : (
        <div className="govt-jobs-card">

          <table className="govt-jobs-table">

            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>

                  <td>{job.title}</td>

                  <td>
                    {getShortText(job.description, job.id)}
                    {job.description?.split(" ").length > 3 && (
                      <span
                        onClick={() => toggleView(job.id)}
                        className="govt-view-more"
                      >
                        {expandedId === job.id ? "view less" : "View more"}
                      </span>
                    )}
                  </td>

                  <td>{job.location}</td>

                  <td className="govt-action-cell">
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="govt-apply-link"
                    >
                      Apply
                    </a>

                    <button
                      onClick={() => handleDelete(job.id)}
                      className="govt-delete-btn"
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

export default GovtJobsList;
