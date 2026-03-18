import React, { useState } from "react";
import { createJob } from "./jobApi";

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
    <div style={{
      display: "flex",
      justifyContent: "center",
      padding: "40px",
      background: "#eef2f7",
      minHeight: "100vh"
    }}>

      <div style={{
        width: "500px",
        background: "#ffffff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>

        <h3 style={{
          textAlign: "center",
          marginBottom: "20px"
        }}>
          Create Job
        </h3>

        {/* Title */}
        <label style={labelStyle}>Job Title</label>
        <input
          name="title"
          value={job.title}
          placeholder="Enter job title"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Description */}
        <label style={labelStyle}>Description</label>
        <textarea
          name="description"
          value={job.description}
          placeholder="Enter job description"
          onChange={handleChange}
          style={{ ...inputStyle, height: "80px" }}
        />

        {/* URL */}
        <label style={labelStyle}>Apply URL</label>
        <input
          name="applyUrl"
          value={job.applyUrl}
          placeholder="Enter apply link"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Dropdown */}
        <label style={labelStyle}>Job Type</label>
        <select
          name="jobType"
          value={job.jobType}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select Job Type</option>
          <option value="GOVT">Government</option>
          <option value="PRIVATE">Private</option>
        </select>

        {/* Company */}
        {job.jobType === "PRIVATE" && (
          <>
            <label style={labelStyle}>Company Name</label>
            <input
              name="companyName"
              value={job.companyName}
              placeholder="Enter company name"
              onChange={handleChange}
              style={inputStyle}
            />
          </>
        )}

        {/* Location */}
        <label style={labelStyle}>Location</label>
        <input
          name="location"
          value={job.location}
          placeholder="Enter location"
          onChange={handleChange}
          style={inputStyle}
        />

        {/* Button */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            background: "linear-gradient(135deg, #007bff, #0056d2)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px"
          }}
        >
          Submit
        </button>

      </div>
    </div>
  );
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "500",
  marginBottom: "5px",
  display: "block"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

export default CreateJob;