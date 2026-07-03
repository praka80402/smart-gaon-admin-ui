import React, { useState } from "react";
import { createJob } from "./jobApi";
import "./createJob.css";

const CreateJob = () => {

  const [job, setJob] = useState({
    title: "",
    description: "",
    applyUrl: "",
    jobType: "",
    companyName: "",
    location: ""
  });

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!job.jobType) {
      alert("Select Job Type");
      return;
    }

    try {
      await createJob(job);
      alert("Job Created Successfully");

      setJob({
        title: "",
        description: "",
        applyUrl: "",
        jobType: "",
        companyName: "",
        location: ""
      });

    } catch (error) {
      console.error(error);
      alert("Error creating job");
    }
  };

  return (
    <div className="create-job-page">
      <div className="create-job-card">
        <h3 className="create-job-title">Create Job</h3>

        {/* Title */}
        <label className="cj-label">Job Title</label>
        <input
          name="title"
          value={job.title}
          placeholder="Enter job title"
          onChange={handleChange}
          className="cj-input"
        />

        {/* Description */}
        <label className="cj-label">Description</label>
        <textarea
          name="description"
          value={job.description}
          placeholder="Enter job description"
          onChange={handleChange}
          className="cj-textarea"
        />

        {/* URL */}
        <label className="cj-label">Apply URL</label>
        <input
          name="applyUrl"
          value={job.applyUrl}
          placeholder="Enter apply link"
          onChange={handleChange}
          className="cj-input"
        />

        {/* Dropdown */}
        <label className="cj-label">Job Type</label>
        <select
          name="jobType"
          value={job.jobType}
          onChange={handleChange}
          className="cj-select"
        >
          <option value="">Select Job Type</option>
          <option value="GOVT">Government</option>
          <option value="PRIVATE">Private</option>
        </select>

        {/* Company */}
        {job.jobType === "PRIVATE" && (
          <>
            <label className="cj-label">Company Name</label>
            <input
              name="companyName"
              value={job.companyName}
              placeholder="Enter company name"
              onChange={handleChange}
              className="cj-input"
            />
          </>
        )}

        {/* Location */}
        <label className="cj-label">Location</label>
        <input
          name="location"
          value={job.location}
          placeholder="Enter location"
          onChange={handleChange}
          className="cj-input"
        />

        {/* Button */}
        <button onClick={handleSubmit} className="cj-submit-btn">
          Submit
        </button>

      </div>
    </div>
  );
};

export default CreateJob;
